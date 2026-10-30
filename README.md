# hkforge.dev

Source of Hasan Karakra's portfolio, served at https://hkforge.dev (Netlify) and
mirrored by GitHub Pages at https://forgehk.github.io.

Plain HTML, CSS and JavaScript, no build step. Fonts, GSAP, ScrollTrigger and
Lenis are vendored under `assets/`, so the page has no third party requests and
ships a strict Content Security Policy (`_headers`).

## Updating

- Case studies live in `index.html` under `section.work`: one `.item` row and one
  `.case` panel per project, plus a hover preview image in `.preview .stack`.
- Screenshots: `assets/img/shot-<key>.webp` (1200 by 750, with 1800 and 2400
  variants) for the hover preview and `assets/img/tall-<key>.webp` (1200 by 2250,
  with an 800 wide variant) for the case panel.
- Bump the `?v=` query on `styles.css` and `main.js` after editing them.

Deploy: push to `main`, then publish the repository root to the `hkforge`
Netlify site (or link the site to this repository for automatic deploys).
