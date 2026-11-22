# Ahmed Ragab, Portfolio

Static site: HTML + CSS + JS, no build step, no framework.

## Run / deploy
- Open `index.html` in a browser, or upload the whole folder to any static host
  (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
- Fonts load from Google Fonts, so the first load needs internet.

## Files
- `index.html` structure, SEO metadata, JSON-LD
- `css/styles.css` design tokens, dark/light themes, RTL, responsive layouts
- `js/content.js` ALL text (EN/AR) and the 25 projects. Edit titles and descriptions here.
- `js/app.js` behaviour. `js/dims.js` original image sizes (keeps true proportions)
- `assets/projects/full/Pxx.jpg` your ORIGINAL files, byte-identical, shown in the case study
- `assets/projects/thumb/Pxx.webp` 900px previews used in the galleries only

## Project IDs
Experimental: P01 P02 P04 P03 P07 P18 P19
Social media: P10 P21 P11 P12 P13 P15 P14 P08 P09 P25 P16 P22 P24 P17 P23
Other: P20 P05 P06

## Replace an image
Overwrite `full/Pxx.jpg`, then make a new 900px WebP in `thumb/Pxx.webp` with the same name.
If the size changes, update the entry in `js/dims.js`.

## Contact form
Uses a `mailto:` link, so it opens the visitor's email app (no server needed).
For a real form backend later, connect Formspree or Web3Forms in `js/app.js` (form submit handler).

## Content notes
All works are labelled concept / practice work. Project titles are working titles: change them in `js/content.js`.
