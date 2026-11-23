# shamoilp.github.io

Portfolio site for **Shamoil Plumber**, accountant and tax advisor for businesses in Saudi Arabia.

**▶ Live: https://shamoilp.github.io/**

Two static pages, with no build step and no cookies or tracking:

- `index.html`: services, how client books are kept safe, free tools, and how to get in touch. No JavaScript.
- `saudi-wht-checker/index.html`: the **Saudi WHT Checker** at https://shamoilp.github.io/saudi-wht-checker/. It runs its rules in the visitor's browser and sends nothing anywhere.

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

## Checks

```bash
npm install   # jsdom, for the tests only
npm test
```

The tests check that every link has a target, every image has a description and size, every local file exists, and the contact links and link-preview tags are in place. For the checker they also check its link preview, that it loads nothing from other sites, and that no rule is awaiting sign-off.

`assets/og.png` is the image LinkedIn and WhatsApp show when the link is shared.
