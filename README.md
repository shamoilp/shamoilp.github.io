# shamoilp.github.io

Portfolio site for **Shamoil Plumber**, accountant and tax advisor for businesses in Saudi Arabia.

**▶ Live: https://shamoilp.github.io/**

Three static pages, with no build step and no cookies or tracking:

- `index.html`: services, how client books are kept safe, free tools, and how to get in touch. No JavaScript.
- `saudi-wht-checker/index.html`: the **Saudi WHT Checker** at https://shamoilp.github.io/saudi-wht-checker/. It runs its rules in the visitor's browser and sends nothing anywhere.
- `ksa-treaty-library/`: the **KSA Treaty Library** at https://shamoilp.github.io/ksa-treaty-library/. Saudi Arabia's treaties article by article, with tabs for the OECD Commentary digest, ZATCA's view and the partner's OECD positions. The page reads its own JSON files in `ksa-treaty-library/data/` and loads nothing from other sites.

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

- `index.json`: the treaty list (country, dates, ZATCA links, article titles) and the `asAt` date shown in the header.
- `t/<ISO>.json`: one treaty's text, split into preamble, articles and protocol, as extracted from ZATCA's PDF. Nine treaties are in Arabic only. ZATCA publishes no text for Taiwan.
- `oecd/<article>.json`: the OECD Commentary digest for Articles 5, 7, 10, 11, 12, 21, 25 and 29, with paragraph references and OECD PDF page numbers.
- `ksa.json`: ZATCA's view by article, the per-treaty facts (services PE list, MLI coverage and so on) and the source list.
- `views.json`: each partner's OECD reservations, observations or positions, summarised. `un.json`: UN Model 2021 differences and the wording checks.

When a source changes, edit the entry, update `asAt` in `index.json`, and keep the source reference beside the text. `ksa-treaty-library/og.jpg` is the image shown when the link is shared.

## Checks

```bash
npm install   # jsdom, for the tests only
npm test
```

The tests check that every link has a target, every image has a description and size, every local file exists, and the contact links and link-preview tags are in place. For the checker they also check its link preview, that it loads nothing from other sites, and that no rule is awaiting sign-off. For the treaty library they check its link preview, that it loads nothing from other sites and stores nothing in the browser, and that every data file it needs exists and parses.

`assets/og.png` is the image LinkedIn and WhatsApp show when the link is shared.
