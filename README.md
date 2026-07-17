# Redirect Loop — Interactive Player Guide

[Open the published guide](https://rshermanut-rgb.github.io/redirect-loop-guide/) · [Play Redirect Loop](https://rshermanut-rgb.github.io/redirect-loop/) · [View the game source](https://github.com/rshermanut-rgb/redirect-loop)

This repository contains the standalone player guide for **Redirect Loop**, a handcrafted pixel-art factory strategy game built with HTML Canvas.

The site includes:

- a spoiler-safe quick start;
- a searchable-by-category control reference;
- a seven-step factory walkthrough with locally saved progress;
- real screenshots from the released Canvas game;
- expandable troubleshooting and accessibility guidance;
- a two-stage spoiler vault for the catastrophe and ending;
- a keyboard-accessible screenshot viewer;
- responsive desktop and mobile layouts.

No framework or external runtime dependency is used. The public site is plain HTML, CSS, and JavaScript.

## Local development

Install a current version of Node.js, then run:

```text
npm run dev
```

Open `http://127.0.0.1:4175/`.

## Validation and release

- `npm test` checks links, asset paths, spoiler gating, accessibility hooks, interactive features, JavaScript syntax, and deployment configuration.
- `npm run build` creates the allowlisted static site in `dist/`.
- `npm run preview` serves the built release at `http://127.0.0.1:4176/`.
- Every push to `main` tests, builds, and deploys `dist/` through GitHub Pages.

All guide screenshots are captures of the real released game and retain the game’s native 480 × 270 pixel-art presentation.
