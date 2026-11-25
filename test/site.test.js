// Checks the portfolio page: working links, described images, contact routes and link previews.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const { document } = new JSDOM(html).window;
const all = (selector) => [...document.querySelectorAll(selector)];
const meta = (key) => document.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.content ?? '';

describe('page basics', () => {
  test('names the person and what they do', () => {
    assert.match(document.title, /Shamoil Plumber/);
    assert.match(meta('description'), /tax/i);
    assert.equal(document.documentElement.lang, 'en');
  });

  test('states the professional qualification up front and in the preview', () => {
    assert.match(document.querySelector('.hero').textContent, /Chartered Accountant \(ICAI, India\)/);
    assert.match(meta('description'), /Chartered Accountant/);
    assert.match(meta('og:title'), /Chartered Accountant/);
  });

  test('has one main heading', () => {
    assert.equal(all('h1').length, 1);
  });

  test('has a link preview (title, description and an absolute image URL)', () => {
    assert.notEqual(meta('og:title'), '');
    assert.notEqual(meta('og:description'), '');
    assert.match(meta('og:image'), /^https:\/\/shamoilp\.github\.io\/assets\/.+\.png$/);
    assert.notEqual(meta('og:image:alt'), '', 'the preview image is described');
  });
});

describe('links', () => {
  test('every in-page link has a target', () => {
    for (const link of all('a[href^="#"]')) {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      assert.ok(id === '' || document.getElementById(id), `missing #${id}`);
    }
  });

  test('outside links use https or mailto', () => {
    for (const link of all('a[href]')) {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) continue;
      assert.match(href, /^(https:\/\/|mailto:)/, href);
    }
  });

  test('links that open a new tab cannot reach back into this page', () => {
    for (const link of all('a[target="_blank"]')) {
      assert.match(link.getAttribute('rel') ?? '', /noopener/, link.href);
    }
  });

  test('offers email and LinkedIn as ways to get in touch', () => {
    const hrefs = all('#contact a').map((link) => link.getAttribute('href'));
    assert.ok(hrefs.includes('mailto:shamoilp@outlook.com'));
    assert.ok(hrefs.includes('https://www.linkedin.com/in/shamoilp/'));
  });

  test('links every free tool', () => {
    const hrefs = all('#tools a').map((link) => link.getAttribute('href'));
    for (const url of [
      'https://shamoilp.github.io/worth-winning/',
      'https://shamoilp.github.io/saudi-wht-checker/',
      'https://shamoilp.github.io/ksa-treaty-library/',
      'https://shamoilp.github.io/ksa-dmt-study/',
      'https://shamoilp.github.io/ksa-tax-zakat-library/',
      'https://github.com/shamoilp/trade-chokepoint',
      'https://github.com/shamoilp/property-game-series',
      'https://github.com/shamoilp/edge-ledger',
    ]) {
      assert.ok(hrefs.includes(url), url);
    }
  });
});

describe('images and files', () => {
  test('every image has a description and a fixed size, so the page does not jump while loading', () => {
    for (const image of all('img')) {
      assert.ok(image.hasAttribute('alt'), image.src);
      assert.ok(image.getAttribute('width') && image.getAttribute('height'), image.src);
    }
  });

  test('every local file the page uses exists', () => {
    const local = [
      ...all('img').map((image) => image.getAttribute('src')),
      ...all('link[href]').map((link) => link.getAttribute('href')),
    ].filter((path) => !/^(https?:|data:)/.test(path));
    assert.ok(local.length > 0);
    for (const path of local) assert.ok(existsSync(new URL(path, root)), path);
  });

  test('the link-preview image is in the repo', () => {
    const path = new URL(meta('og:image')).pathname.slice(1);
    assert.ok(existsSync(new URL(path, root)), path);
  });
});

describe('Saudi WHT Checker page', () => {
  const checkerHtml = readFileSync(new URL('saudi-wht-checker/index.html', root), 'utf8');
  const checker = new JSDOM(checkerHtml).window.document;
  const checkerMeta = (key) => checker.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.content ?? '';

  test('has a title, description, canonical address and link preview', () => {
    assert.match(checker.title, /Saudi WHT Checker/);
    assert.match(checkerMeta('description'), /withholding tax/i);
    assert.equal(checker.querySelector('link[rel="canonical"]')?.getAttribute('href'), 'https://shamoilp.github.io/saudi-wht-checker/');
    assert.match(checkerMeta('og:image'), /^https:\/\/shamoilp\.github\.io\/saudi-wht-checker\/.+\.(png|jpg)$/);
    assert.notEqual(checkerMeta('og:image:alt'), '');
  });

  test('the link-preview image is in the repo', () => {
    const path = new URL(checkerMeta('og:image')).pathname.slice(1);
    assert.ok(existsSync(new URL(path, root)), path);
  });

  test('loads nothing from other sites, so answers stay in the browser', () => {
    assert.equal(checker.querySelectorAll('script[src]').length, 0);
    assert.equal(checker.querySelectorAll('link[rel="stylesheet"]').length, 0);
    assert.doesNotMatch(checkerHtml, /\bfetch\(|XMLHttpRequest|sendBeacon|localStorage|document\.cookie/);
  });

  test('carries no review banner and no rule awaiting sign-off', () => {
    assert.equal(checker.querySelector('.review-banner'), null);
    const data = JSON.parse(checkerHtml.match(/^const DATA = (\{.*\});$/m)[1]);
    assert.deepEqual(data.pendingSignoff, []);
  });
});

describe('KSA Treaty Library page', () => {
  const libHtml = readFileSync(new URL('ksa-treaty-library/index.html', root), 'utf8');
  const lib = new JSDOM(libHtml).window.document;
  const libMeta = (key) => lib.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.content ?? '';
  const data = (path) => JSON.parse(readFileSync(new URL(`ksa-treaty-library/data/${path}`, root), 'utf8'));

  test('has a title, description, canonical address and link preview', () => {
    assert.match(lib.title, /KSA Treaty Library/);
    assert.match(libMeta('description'), /tax treaties/i);
    assert.equal(lib.querySelector('link[rel="canonical"]')?.getAttribute('href'), 'https://shamoilp.github.io/ksa-treaty-library/');
    assert.match(libMeta('og:image'), /^https:\/\/shamoilp\.github\.io\/ksa-treaty-library\/.+\.(png|jpg)$/);
    assert.notEqual(libMeta('og:image:alt'), '');
  });

  test('the link-preview image is in the repo', () => {
    const path = new URL(libMeta('og:image')).pathname.slice(1);
    assert.ok(existsSync(new URL(path, root)), path);
  });

  test('loads nothing from other sites and stores nothing in the browser', () => {
    assert.equal(lib.querySelectorAll('script[src]').length, 0);
    assert.equal(lib.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]').length, 0);
    assert.doesNotMatch(libHtml, /XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|googleapis|gstatic/);
    for (const call of libHtml.match(/get\('[^']*'/g) ?? []) assert.match(call, /^get\('data\//, call);
  });

  test('every treaty with a published text has its file, and every article has text', () => {
    const index = data('index.json');
    assert.equal(index.treaties.length, 63);
    for (const treaty of index.treaties) {
      if (treaty.missing) continue;
      const text = data(`t/${treaty.iso2}.json`);
      assert.ok(text.articles.length > 0, treaty.iso2);
      assert.equal(text.articles.length, treaty.articles.length, treaty.iso2);
    }
    assert.deepEqual(index.treaties.filter((treaty) => treaty.missing).map((treaty) => treaty.iso2), ['TW']);
  });

  test('every core article has a digest with paragraph references and a source', () => {
    for (const article of ['5', '7', '10', '11', '12', '21', '25', '29']) {
      const digest = data(`oecd/${article}.json`);
      assert.equal(digest.source.doi, 'https://doi.org/10.1787/db32e18b-en', article);
      const entries = digest.sections.flatMap((section) => section.entries);
      assert.ok(entries.length > 5, article);
      for (const entry of entries) {
        assert.ok(entry.p && entry.t, `${article} ${entry.p}`);
        if (!entry.annex) assert.ok(entry.pdfPage > 0, `${article} ${entry.p}`);
      }
    }
  });

  test('every article has a plain-words note, and every treaty has rates and time limits', () => {
    const index = data('index.json');
    const plain = data('plain.json');
    for (const key of ['pre', 'prot', 'claim']) assert.ok(plain[key], key);
    for (const treaty of index.treaties) {
      for (const article of treaty.articles) assert.ok(plain[article.pk]?.one, `${treaty.iso2} ${article.n} ${article.pk}`);
      assert.ok(treaty.rates?.dividends && treaty.rates?.interest && treaty.rates?.royalties, treaty.iso2);
      if (treaty.missing) continue;
      assert.ok(treaty.facts.map?.n >= 2, `${treaty.iso2} mutual agreement time limit`);
      assert.ok(treaty.facts.emp?.n >= 182, `${treaty.iso2} employment day limit`);
    }
  });

  test('the UAE treaty has an English translation for every paragraph', () => {
    const uae = data('t/AE.json');
    assert.match(uae.translation.note, /Arabic text is the only authentic text/);
    assert.equal(uae.preambleEn.length, uae.preamble.length);
    for (const article of uae.articles) {
      assert.ok(article.titleEn, article.n);
      assert.equal(article.en.length, article.paras.length, article.n);
    }
  });

  test('every treaty has an MLI status, and every changed treaty has dates and a source', () => {
    const mli = data('mli.json');
    const index = data('index.json');
    assert.equal(Object.keys(mli.treaties).length, index.treaties.length);
    for (const treaty of index.treaties) {
      const record = mli.treaties[treaty.iso2];
      assert.ok(['changed', 'pending', 'not'].includes(record?.status), treaty.iso2);
      if (record.status !== 'changed') continue;
      assert.match(record.effect.wht, /^\d{4}-\d{2}-\d{2}$/, treaty.iso2);
      assert.match(record.effect.other, /^\d{4}-\d{2}-\d{2}$/, treaty.iso2);
      assert.ok(['synth', 'positions'].includes(record.checked), treaty.iso2);
      if (record.synth) assert.match(record.synth.url, /^https:\/\//, treaty.iso2);
    }
    for (const source of Object.values(mli.sources)) assert.match(source.url, /^https:\/\//);
  });

  test('every case has a source, a date, an outcome and a treaty article that exists', () => {
    const cases = data('cases.json');
    const index = data('index.json');
    const isos = new Set(index.treaties.map((t) => t.iso2));
    assert.ok(cases.cases.length >= 30);
    const seen = new Set();
    for (const c of cases.cases) {
      const key = c.id + (c.part ?? '');
      assert.ok(!seen.has(key), key);
      seen.add(key);
      assert.ok(['taxpayer', 'zatca', 'split', 'remanded'].includes(c.outcome), key);
      assert.ok(c.title && c.summary && c.habit && c.court && c.date && c.year, key);
      assert.ok(c.src.length > 0, key);
      for (const s of c.src) assert.match(s.u, /^https:\/\//, key);
      if (c.forum === 'sa') for (const s of c.src) assert.match(s.u, /^https:\/\/gstc\.gov\.sa\/.+\.pdf#page=\d+$/, key);
      for (const r of c.tr) {
        if (!isos.has(r.iso)) { assert.equal(r.iso, 'US-SHIP', key); continue; }
        const t = data(`t/${r.iso}.json`);
        for (const n of r.arts) assert.ok(t.articles.some((a) => String(a.n) === String(n)), `${key} ${r.iso} ${n}`);
      }
    }
  });

  test('the treaty page offers a Cases tab and the case digest', () => {
    const page = readFileSync(new URL('ksa-treaty-library/index.html', root), 'utf8');
    assert.match(page, /\['cases','Cases'\]/);
    assert.match(page, /data-cases="1"/);
    assert.match(page, /data\/cases\.json/);
  });

  test('the removed KSA view and Other countries files are gone', () => {
    for (const file of ['ksa.json', 'views.json', 'un.json']) assert.ok(!existsSync(new URL(`ksa-treaty-library/data/${file}`, root)), file);
  });
});

describe('KSA DMT Study page', () => {
  const studyHtml = readFileSync(new URL('ksa-dmt-study/index.html', root), 'utf8');
  const study = new JSDOM(studyHtml).window.document;
  const studyMeta = (key) => study.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.content ?? '';
  const embedded = (id) => JSON.parse(study.getElementById(id).textContent);
  const arabic = /[؀-ۿ]/;

  test('has a title, description, canonical address and link preview', () => {
    assert.match(study.title, /KSA DMT Study/);
    assert.match(studyMeta('description'), /Domestic Minimum Tax/);
    assert.equal(study.querySelector('link[rel="canonical"]')?.getAttribute('href'), 'https://shamoilp.github.io/ksa-dmt-study/');
    assert.match(studyMeta('og:image'), /^https:\/\/shamoilp\.github\.io\/ksa-dmt-study\/.+\.(png|jpg)$/);
    assert.notEqual(studyMeta('og:image:alt'), '');
  });

  test('the link-preview image is in the repo', () => {
    const path = new URL(studyMeta('og:image')).pathname.slice(1);
    assert.ok(existsSync(new URL(path, root)), path);
  });

  test('loads nothing from other sites and keeps only its own progress in the browser', () => {
    assert.equal(study.querySelectorAll('script[src]').length, 0);
    assert.equal(study.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]').length, 0);
    assert.doesNotMatch(studyHtml, /\bfetch\(|XMLHttpRequest|sendBeacon|sessionStorage|indexedDB|document\.cookie|googleapis|gstatic/);
    assert.match(studyHtml, /const KEY = "ksaDmtStudy\.v1"/);
    const uses = studyHtml.match(/localStorage\.\w+\([^)]*\)/g) ?? [];
    assert.ok(uses.length > 0);
    for (const use of uses) assert.match(use, /^localStorage\.(getItem|setItem)\(KEY\b/, use);
  });

  test('covers all 106 articles, and every quiz answer and flashcard cites one', () => {
    const law = embedded('law-data');
    const { modules } = embedded('course-data');
    assert.equal(law.length, 106);
    assert.equal(modules.length, 15);
    const covered = new Set(modules.flatMap((m) => m.arts));
    for (let n = 1; n <= 106; n++) assert.ok(covered.has(n), `article ${n}`);
    const cites = (refs) => refs.length > 0 && refs.every((r) => {
      const n = parseInt(String(r), 10);
      return n >= 1 && n <= 106;
    });
    for (const m of modules) {
      assert.equal(m.cases.length, 3, `module ${m.id} case studies`);
      assert.equal(m.quiz.length, 12, `module ${m.id} questions`);
      assert.equal(m.cards.length, 12, `module ${m.id} flashcards`);
      for (const q of m.quiz) {
        assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length, q.q[0]);
        assert.ok(cites(q.r), q.q[0]);
      }
      for (const c of m.cards) assert.ok(cites(c.r), c.f[0]);
    }
  });

  test('the public page carries no reflection cards', () => {
    const { modules } = embedded('course-data');
    for (const m of modules) assert.equal(m.reflect, undefined, `module ${m.id}`);
  });

  test('every module, question and flashcard has Arabic as well as English', () => {
    const { modules } = embedded('course-data');
    for (const m of modules) {
      assert.ok(m.title[0] && arabic.test(m.title[1]), `module ${m.id} title`);
      assert.ok(m.goal[0] && arabic.test(m.goal[1]), `module ${m.id} goal`);
      for (const q of m.quiz) {
        assert.ok(arabic.test(q.q[1]), q.q[0]);
        for (const o of q.o) assert.ok(o[0] && o[1], q.q[0]);
      }
      for (const c of m.cards) assert.ok(arabic.test(c.f[1]) && arabic.test(c.b[1]), c.f[0]);
    }
  });

  test('quiz answers are not given away by length or position, and options are shuffled on screen', () => {
    const { modules } = embedded('course-data');
    let longest = 0, total = 0;
    for (const m of modules) {
      const pos = [0, 0, 0, 0];
      let modLongest = 0;
      for (const q of m.quiz) {
        total++; pos[q.a]++;
        const len = q.o.map((o) => o[0].length);
        const others = len.filter((_, j) => j !== q.a);
        if (len[q.a] > Math.max(...others)) { longest++; modLongest++; }
        if (len[q.a] >= 25) assert.ok(len[q.a] <= 1.2 * Math.max(...others), `module ${m.id}: ${q.q[0]}`);
      }
      assert.ok(modLongest <= 4, `module ${m.id}: correct option is the longest in ${modLongest} questions`);
      for (const p of pos) assert.ok(p >= 2 && p <= 4, `module ${m.id} answer positions ${pos}`);
    }
    assert.ok(longest / total <= 0.3, `picking the longest option scores ${longest}/${total}`);
    assert.match(studyHtml, /order\(x\.o\.length, q\.seed, qi\)/);
    assert.match(studyHtml, /if \(s\.qv !== QV\) \{ s\.quiz = \{\}; s\.qv = QV; \}/);
  });

  test('every key point has a plain line and every case a bottom line and a diagram, in both languages', () => {
    const { modules } = embedded('course-data');
    for (const m of modules) {
      assert.ok(m.terms.length >= 5, `module ${m.id} words`);
      for (const t of m.terms) assert.ok(t.t[0] && arabic.test(t.t[1]) && t.d[0] && arabic.test(t.d[1]), t.t[0]);
      for (const p of m.points) assert.ok(p.p && p.p[0] && arabic.test(p.p[1]), `module ${m.id}: ${p.h[0]}`);
      assert.ok(m.diagrams.some((d) => d.quick || d.pos === 'picture'), `module ${m.id} has a diagram in Quick view`);
      for (const c of m.cases) {
        assert.ok(c.p && c.p[0] && arabic.test(c.p[1]), `module ${m.id}: ${c.t[0]}`);
        assert.ok(c.diagrams.length >= 1, `module ${m.id}: ${c.t[0]} diagram`);
      }
    }
  });
});

describe('KSA Tax & Zakat Library page', () => {
  const pageHtml = readFileSync(new URL('ksa-tax-zakat-library/index.html', root), 'utf8');
  const page = new JSDOM(pageHtml).window.document;
  const pageMeta = (key) => page.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.content ?? '';
  const data = (path) => JSON.parse(readFileSync(new URL(`ksa-tax-zakat-library/data/${path}`, root), 'utf8'));
  const idx = data('index.json');
  const files = Object.fromEntries(idx.inst.map((m) => [m.id, data(`${m.id}.json`)]));
  const cases = data('cases.json');
  const extra = data('extra.json');
  const exists = (id, n) => Boolean(files[id] && files[id][String(n)]);

  test('has a title, description, canonical address and link preview', () => {
    assert.match(page.title, /KSA Tax & Zakat Library/);
    assert.match(pageMeta('description'), /Zakat/);
    assert.equal(page.querySelector('link[rel="canonical"]')?.getAttribute('href'), 'https://shamoilp.github.io/ksa-tax-zakat-library/');
    assert.match(pageMeta('og:image'), /^https:\/\/shamoilp\.github\.io\/ksa-tax-zakat-library\/.+\.(png|jpg)$/);
    assert.notEqual(pageMeta('og:image:alt'), '');
    assert.ok(existsSync(new URL(new URL(pageMeta('og:image')).pathname.slice(1), root)));
  });

  test('loads nothing from other sites and stores nothing in the browser', () => {
    assert.equal(page.querySelectorAll('script[src]').length, 0);
    assert.equal(page.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]').length, 0);
    assert.doesNotMatch(pageHtml, /XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|googleapis|gstatic/);
    for (const call of pageHtml.match(/get\('[^']*'/g) ?? []) assert.match(call, /^get\('data\//, call);
  });

  test('every instrument has its file, a source and an as-at date, and its article list matches the file', () => {
    assert.match(idx.asOf, /^\d{4}-\d{2}-\d{2}$/);
    for (const m of idx.inst) {
      assert.ok(m.arurl.startsWith('https://zatca.gov.sa/'), m.id);
      assert.ok(m.ref && m.enlab && m.arlab, m.id);
      assert.deepEqual(m.arts.map((a) => a[0]).sort(), Object.keys(files[m.id]).sort(), m.id);
    }
  });

  test('every article that applies has English, and the Arabic where an official text exists', () => {
    for (const [id, arts] of Object.entries(files)) {
      for (const [n, a] of Object.entries(arts)) {
        if (a.st === 'live' || a.st === 'past') assert.ok(a.en.length > 20, `${id} ${n} English`);
        if ((a.st === 'live' || a.st === 'past') && !['z38', 'deemed'].includes(id)) assert.ok(a.ar.length > 20, `${id} ${n} Arabic`);
        if (a.st === 'deleted' || a.st === 'repealed') assert.ok(a.stn, `${id} ${n} says what removed it`);
      }
    }
  });

  test('every live article of the Law, the Bylaws and the 1445H Regulations has a plain-words note and a habit', () => {
    for (const id of ['itl', 'itr', 'z45']) {
      for (const [n, a] of Object.entries(files[id])) {
        if (a.st !== 'live' || (id === 'itr' && n === '73')) continue;
        assert.ok(a.n && a.n.p, `${id} ${n} plain`);
        assert.ok(a.n.h, `${id} ${n} habit`);
      }
    }
  });

  test('every earlier Zakat article points to an existing 1445H article', () => {
    for (const id of ['z40', 'z38', 'fin', 'deemed']) {
      for (const [n, a] of Object.entries(files[id])) for (const k of a.now) assert.ok(exists('z45', k), `${id} ${n} -> ${k}`);
    }
    for (const [n, a] of Object.entries(files.itr)) for (const k of a.law) assert.ok(exists('itl', k), `itr ${n} -> itl ${k}`);
  });

  test('every committee principle has its text, a GSTC source and links to articles that exist', () => {
    assert.ok(cases.length > 300);
    for (const c of cases) {
      assert.ok(c.p.length > 20, c.id);
      assert.match(c.u, /^https:\/\/gstc\.gov\.sa\//, c.id);
      assert.ok(Number.isInteger(c.pno), c.id);
      for (const [id, n] of c.refs) assert.ok(exists(id, n), `${c.id} -> ${id} ${n}`);
    }
  });

  test('every guideline, issue guide, key number, glossary term and draft line points to things that exist', () => {
    const ids = new Set(cases.map((c) => c.id));
    for (const g of extra.guides) {
      assert.match(g.u, /^https:\/\/(www\.)?zatca\.gov\.sa\//, g.id);
      for (const [id, n] of g.refs) assert.ok(exists(id, n), `${g.id} -> ${id} ${n}`);
    }
    for (const s of extra.issues) {
      for (const id of s.cases) assert.ok(ids.has(id), `${s.id} -> ${id}`);
      assert.ok(s.now.length && s.h, s.id);
    }
    for (const r of extra.numbers) assert.ok(exists(r[2], r[3]), r[0]);
    for (const g of extra.glossary) for (const [id, n] of g[3]) assert.ok(exists(id, n), g[0]);
    assert.match(extra.drafts.meta.status, /Drafts only/);
    for (const s of extra.drafts.meta.sources) assert.match(s[2], /^https:\/\//);
    for (const r of extra.drafts.itl) { assert.ok(r.src, r.topic); for (const n of r.now) assert.ok(exists('itl', n), r.topic); for (const n of r.by ?? []) assert.ok(exists('itr', n), r.topic); }
    for (const r of extra.drafts.ztpl) { assert.ok(r.src, r.topic); for (const n of r.nowITL) assert.ok(exists('itl', n), r.topic); for (const n of r.nowZ) assert.ok(exists('z45', n), r.topic); }
  });

  test('has layouts for ultra-wide screens: text beside notes from 2300px, four columns from 3000px', () => {
    assert.match(pageHtml, /@media\(min-width:2300px\)\{[^@]*#read\.art \.cols\{[^}]*grid-template-columns:minmax\(0,2fr\) minmax\(0,1fr\)\}/);
    assert.match(pageHtml, /@media\(min-width:3000px\)\{[^@]*#read\.art \.c-plain\{display:block/);
    assert.match(pageHtml, /\.bi \.col>\*\{max-width:82ch/);
  });

  test('the earlier 1440H Regulations include Articles 30 bis to 33', () => {
    for (const n of ['30bis', '31', '32', '33']) assert.ok(exists('z40', n), n);
  });
});

