# shamoilp.github.io

Portfolio site for **Shamoil Plumber**, accountant and tax advisor for businesses in Saudi Arabia.

**▶ Live: https://shamoilp.github.io/**

Four static pages, with no build step and no cookies or tracking:

- `index.html`: services, how client books are kept safe, free tools, and how to get in touch. No JavaScript.
- `saudi-wht-checker/index.html`: the **Saudi WHT Checker** at https://shamoilp.github.io/saudi-wht-checker/. It runs its rules in the visitor's browser and sends nothing anywhere.
- `ksa-treaty-library/`: the **KSA Treaty Library** at https://shamoilp.github.io/ksa-treaty-library/. Saudi Arabia's treaties article by article: the text, a plain-words guide with diagrams, the OECD Commentary digest and the BEPS MLI changes. The UAE treaty also has an unofficial English translation. The page reads its own JSON files in `ksa-treaty-library/data/` and loads nothing from other sites.
- `ksa-dmt-study/index.html`: the **KSA DMT Study** at https://shamoilp.github.io/ksa-dmt-study/. A study course on Saudi Arabia's draft Domestic Minimum Tax (Pillar Two) Law in English and Arabic: 15 modules, 45 case studies with diagrams, 180 quiz questions and spaced-repetition flashcards, with the draft's 106 articles in a side-by-side reader. Every key point leads with a one-line plain version, and a Quick view shows just the essentials. One self-contained file that also works offline. It keeps the visitor's study progress in their own browser (one `localStorage` key, `ksaDmtStudy.v1`) and sends nothing anywhere.

## Edit and preview

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

Edit `index.html` or `styles.css`, then push to `main`. GitHub Pages updates in about a minute.

## Updating the Saudi WHT Checker

The checker's rules and treaty rates sit in one line of the page, `const DATA = {...};`, with `rulesVersion`, `asAt` and `pendingSignoff` at the start. When a rule changes:

1. Update the rule or treaty record, then bump `rulesVersion` and `asAt`.
2. Update the same figures in the page header (treaty count, "Rules as at", version) and under "How the rates were checked".
3. A rule not yet signed off goes in `pendingSignoff`, so every answer that uses it says so. Keep it out of `main` until it is signed off.

`saudi-wht-checker/og.jpg` is the image shown when the checker's link is shared.

## Updating the KSA Treaty Library

All content sits in `ksa-treaty-library/data/`:

- `index.json`: the treaty list (country, dates, ZATCA links, article titles and groups), each treaty's withholding rates (from the Saudi WHT Checker data) and its key time limits read from the text (PE thresholds, the employment day limit, the MAP deadline), and the `asAt` date shown in the header.
- `t/<ISO>.json`: one treaty's text, split into preamble, articles and protocol, as extracted from ZATCA's PDF. Nine treaties are in Arabic only; the UAE file also holds an unofficial English translation, paragraph by paragraph (`en`, `titleEn`, `preambleEn`). ZATCA publishes no text for Taiwan.
- `plain.json`: the plain-words guide for each kind of article, the note on claiming a treaty rate in Saudi Arabia (with its ZATCA source) and Saudi Arabia's own withholding rates. The diagrams are drawn by the page from these notes and the treaty's figures.
- `mli.json`: the BEPS MLI status of each treaty (changed, not yet, or not changed, with the reason), the MLI rules that apply and the dates they take effect in Saudi Arabia, and a link to the official synthesised text where one exists. It is built from the OECD's records of each country's MLI choices and its status list; re-check it when the OECD updates the list or a partner ratifies.
- `cases.json`: the case digest. Each case is a Saudi tax committee decision from the volumes the General Secretariat of Tax Committees publishes, or a ruling in India on the India treaty, that turns on a tax treaty. It holds the treaty and article, the outcome, a summary in our own words, a practical habit, the status, and a link to the source (for committee decisions, the volume PDF at the right page). Pending cases are not tracked; add new volumes when GSTC publishes them.
- `oecd/<article>.json`: the OECD Commentary digest for Articles 5, 7, 10, 11, 12, 21, 25 and 29, with paragraph references and OECD PDF page numbers.

When a source changes, edit the entry, update `asAt` in `index.json`, and keep the source reference beside the text. `ksa-treaty-library/og.jpg` is the image shown when the link is shared.

## Updating the KSA DMT Study

The page is built from source files kept outside this repo: the page template, one JSON file per module (picture, anchors, words to know, diagrams, key points with plain lines, OECD notes, reflection, three case studies with diagrams and bottom lines, twelve quiz questions, twelve flashcards) and the article text extracted from the bilingual draft. A build step checks every English/Arabic pair, every article reference, every quiz answer and every case-study calculation, then writes one `index.html` with the course and the law embedded in it. Publish by replacing `ksa-dmt-study/index.html` with the new build.

When the final law or the Regulations are issued, re-extract the articles, re-check every module against the new numbering, and update the dates under "Sources and dates" on the page's About screen. `ksa-dmt-study/og.jpg` is the image shown when the link is shared.

## Checks

```bash
npm install   # jsdom, for the tests only
npm test
```

The tests check that every link has a target, every image has a description and size, every local file exists, and the contact links and link-preview tags are in place. For the checker they also check its link preview, that it loads nothing from other sites, and that no rule is awaiting sign-off. For the treaty library they check its link preview, that it loads nothing from other sites and stores nothing in the browser, that every data file it needs exists and parses, that every article has a plain-words note, and that the UAE translation covers every paragraph. For the DMT study they check its link preview, that it loads nothing from other sites and keeps only its own progress key in the browser, that the course covers all 106 articles with every quiz answer and flashcard citing one, and that every screen has Arabic as well as English.

`assets/og.png` is the image LinkedIn and WhatsApp show when the link is shared.
