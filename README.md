# shamoilp.github.io

Portfolio site for **Shamoil Plumber**, accountant and tax advisor for businesses in Saudi Arabia.

**▶ Live: https://shamoilp.github.io/**

One static page: services, how client books are kept safe, free tools, and how to get in touch. No build step, no JavaScript, no cookies or tracking.

## Edit and preview

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

Edit `index.html` or `styles.css`, then push to `main`. GitHub Pages updates in about a minute.

## Checks

```bash
npm install   # jsdom, for the tests only
npm test
```

The tests check that every link has a target, every image has a description and size, every local file exists, and the contact links and link-preview tags are in place.

`assets/og.png` is the image LinkedIn and WhatsApp show when the link is shared.
