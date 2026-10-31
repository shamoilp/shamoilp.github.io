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
      'https://github.com/shamoilp/trade-chokepoint',
      'https://github.com/shamoilp/property-game-series',
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
