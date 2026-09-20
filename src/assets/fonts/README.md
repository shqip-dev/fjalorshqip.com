# Fonts for the social cards

Alegreya, as plain TrueType. These are **not** served to the browser — the pages load the woff2
subsets from `@fontsource/alegreya-sc` and `@fontsource-variable/alegreya` (see
`src/styles/fonts.scss`). They exist because the card renderer draws text with pango, which reads
font files through FreeType and does not accept the packaged woff2.

They were produced from the installed packages with `woff2_decompress`:

    cp node_modules/@fontsource/alegreya-sc/files/alegreya-sc-latin-700-normal.woff2 .
    cp node_modules/@fontsource-variable/alegreya/files/alegreya-latin-wght-normal.woff2 .
    woff2_decompress alegreya-sc-latin-700-normal.woff2   # → alegreya-sc-700.ttf
    woff2_decompress alegreya-latin-wght-normal.woff2     # → alegreya-variable.ttf

Regenerate them the same way when either package is upgraded, or the cards will keep being drawn in
the old cut of the typeface. Licensed under the SIL Open Font License 1.1 — `LICENSE-Alegreya.txt`.
