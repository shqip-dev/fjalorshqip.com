---
name: Fjalori 1980
description: The Fjalor i Gjuhës së Sotme Shqipe (1980) rebuilt as an interface — one sheet of warm academy stock carrying the entry, with the cover cloth on the lemma, on the masthead's rule and on the closing block at the foot.
colors:
  cloth: "#6b1d1f"
  on-cloth: "#f0eae0"
  on-cloth-muted: "#cdbcae"
  stock: "#e9e4d7"
  stock-sunk: "#e0dbcc"
  ink: "#241d17"
  ink-muted: "#5c5145"
  rule: "#c4bba7"
  rule-strong: "#837a66"
typography:
  display:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "clamp(2.4rem, 9vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "clamp(1.9rem, 4.5vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.015em"
  subhead:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "1.22rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0"
  body:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "1.075rem"
    fontWeight: 400
    lineHeight: 1.62
  small:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Alegreya SC, Alegreya Variable, Georgia, serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.06em"
  wordmark:
    fontFamily: "Alegreya SC, Alegreya Variable, Georgia, serif"
    fontSize: "1.32rem"
    fontWeight: 700
    letterSpacing: "0.11em"
  field:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "clamp(1.4rem, 5.5vw, 1.9rem)"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  none: "0"
spacing:
  hair: "0.3rem"
  rule-gap: "0.45rem"
  tight: "0.7rem"
  sense: "0.85rem"
  block: "1.5rem"
  gutter: "clamp(1.25rem, 5vw, 2.5rem)"
  section: "clamp(1.75rem, 6vw, 3rem)"
components:
  masthead:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.cloth}"
    typography: "{typography.wordmark}"
    rounded: "{rounded.none}"
    padding: "0.85rem 0 0.75rem"
  masthead-mark-hover:
    textColor: "{colors.ink}"
  colophon:
    backgroundColor: "{colors.cloth}"
    textColor: "{colors.on-cloth}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "1.6rem 0 2.4rem"
  colophon-separator:
    textColor: "{colors.on-cloth-muted}"
    typography: "{typography.label}"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.none}"
    padding: "0 0 0.3rem"
  search-field-compact:
    typography: "{typography.body}"
    padding: "0 0 0.3rem"
  status-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.small}"
  result-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0.7rem 0.5rem"
  result-row-active:
    backgroundColor: "{colors.stock-sunk}"
    textColor: "{colors.cloth}"
  guide-rail:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "0 0 0.45rem"
  headword:
    backgroundColor: "transparent"
    textColor: "{colors.cloth}"
    typography: "{typography.display}"
  page-title:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
  sense-number:
    textColor: "{colors.cloth}"
    typography: "{typography.body}"
    width: "1.6rem"
  cross-reference:
    textColor: "{colors.cloth}"
    typography: "{typography.label}"
  skip-link-focus:
    backgroundColor: "{colors.cloth}"
    textColor: "{colors.on-cloth}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1rem"
---

# Design System: Fjalori 1980

## Overview

**Creative North Star: "The academy dictionary, opened."**

This is the *Fjalor i Gjuhës së Sotme Shqipe* (1980) rebuilt as an interface rather than a website that
happens to hold dictionary data. Every device on screen is one the printed volume already had: running
guide words at the top of the page, a capitalized headword in the binding's own red, an italic
abbreviation stack, numbered senses, a separated idiom block, cross-references set in small caps.
Nothing is invented to look "designed"; the structure the book used to make a dense page legible is the
structure the page uses.

The sheet is **warm, not grey**. Academy stock (`--stock`) is a cream-khaki paper and the ink laid on it
is a brown-black, not a neutral near-black — the page has a hue of its own rather than reading as grey
card under black type. The sheet is **one ground from the masthead through the content**, and the
binding closes it: the cover cloth becomes the ground exactly once, at the foot, in the colophon block.
At the head the cloth is a line and a colour of text, not a band — the wordmark is oxblood and a
`2px solid var(--cloth)` rule closes the masthead. The history of the chrome matters, because the
shipped state is a restoration rather than a new idea: full-bleed oxblood bands *top and bottom* were
tried and rejected as harsh; the oxblood was then desaturated in answer to that, which was judged not an
improvement; a further build put gold foil edges on both regions instead. What ships drops foil
entirely and returns the cloth to its **original oxblood** (`#6b1d1f`) — red text at the head, a single
closing block of red at the foot. The desaturated red is history, not a value in this system. Between
those two ends the cover cloth does what the printed dictionary does with it: it sets the **lemma**. The headword of an entry, the not-found
title and the wordmark are oxblood; so are sense numbers, homograph marks, cross-references, the caret
and focused rule of the field, hover states, and the focus ring.

It is a printed world, so it has no lighting. There are no shadows, no gradients and no rounded corners
anywhere in the build. Depth is rule weight and ink density only. The site has one appearance:
`color-scheme: light` is declared, a single `theme-color` (`#e9e4d7`) ships, and no
`prefers-color-scheme` query exists anywhere — a browser asking for dark gets this same sheet. The
rejections that still hold are explicit: not the centered search box on white that every dictionary
ships, not the soft cream-and-literary-serif costume that "old book" usually means, not two full-bleed
cloth bands bracketing the page, and not the colourless grey rendition this system briefly carried.

**Key Characteristics:**
- One warm ground for reading — academy stock from the masthead through the entry — closed by one cloth
  block at the foot.
- Cloth sets the lemma, the marks and the masthead's rule; it is a surface only in the colophon.
- Depth is rule weight — 1px hairline, 2px bound, 3px close — and nothing else.
- Alegreya Variable for everything read; Alegreya SC for labels only, never for sentences.
- Light-only by decision, with body ink at 13.1:1 and every boundary measured.

## Colors

A warm cream-khaki paper carrying brown-black ink and hairline rules, with oxblood entering as the
lemma, the marks, the masthead's rule and the ground of the closing block.

### Primary
- **Cover Cloth Oxblood** (`--cloth`): The word the dictionary defines, every mark that points at it, and
  the binding at both ends of the page. The entry headword and the not-found title (weight 600), the
  wordmark, sense numbers, Roman-numeral homograph marks, cross-reference links, the caret and focused
  underline of the search field, link and rail hover colour, the headword of an active or hovered result
  row, the focus-ring outline, prose link underlines, the `2px` rule under the masthead, the ground of
  the colophon, the ground of the focused skip-link chip, and — at 22% strength against stock — the
  `::selection` wash. Measures 9.09:1 as text on stock.

### Neutral
- **Ink On Cloth** (`--on-cloth`): The paper laid on the binding. Three uses: the colophon's text and
  links (9.64:1 on cloth), the focus-ring outline inside the colophon (the same 9.64:1), and the text of
  the focused skip-link chip.
- **Muted Ink On Cloth** (`--on-cloth-muted`): One use — the middot separators between colophon links
  (6.26:1 on cloth). It is the colophon's equivalent of `--rule-strong`, dimmer than the link text but
  still read as ink, not as a hairline.
- **Academy Stock** (`--stock`): The reading ground — body background, masthead, the `theme-color`, the
  3px border that shapes the scrollbar thumb, and the base of the `::selection` mix.
- **Sunk Stock** (`--stock-sunk`): The only fill on the sheet — the hover/keyboard-active wash under a
  result row.
- **Brown-Black Ink** (`--ink`): Body text, prose page titles, the 3px rules that close a headword or a
  page title, and selected text. 13.1:1 on stock.
- **Muted Ink** (`--ink-muted`): The apparatus and the running commentary — guide words, the masthead
  descriptor, status and loader lines, grammatical labels, result gists, idiom titles, placeholder text.
  6.09:1 on stock, 5.58:1 on sunk stock.
- **Hairline Rule** (`--rule`): Every 1px rule: the guide-word underline, result-row separators, rail
  leaders, the column rule in a two-column entry, the idiom block's left rule, the rule between
  homograph versions, the loader's closing rule.
- **Strong Rule** (`--rule-strong`): The resting 3px underline of the search field, link underlines at
  rest on stock, and the scrollbar thumb. Held at 3.35:1 on stock **because** it carries the field's
  resting underline, which is a UI boundary owing 3:1.

### Named Rules
**The One Ground Rule.** The sheet is one ground — academy stock — from the masthead through the whole
of the content, and the binding closes it. `--cloth` becomes a ground exactly once, in the colophon
block at the foot of the page, and nowhere else: not behind the masthead, not behind a card, not behind
a section of an entry. Two full-bleed cloth bands bracketing the page were tried and rejected as harsh;
one closing block at the foot with red *text* at the head is the arrangement that shipped. A new region
that wants to stand out gets a rule, not a fill.

**The Cloth-As-Lemma Rule.** Oxblood sets the word the dictionary is defining and the marks that point
at one: headword, not-found title, sense numbers, homograph marks, cross-references, hover and focus
states. It is never running text. A page title that is *not* a defined word — the Rreth `h1` — stays ink
at the same weight; the red is what tells a lemma from a heading.

**The Measured Boundary Rule.** `--rule-strong` may not be lightened. It carries the search field's
resting underline, the only boundary in the system a user has to see before interacting, and it is set
where it is (3.35:1 on stock) to clear the 3:1 a UI boundary owes. Decorative hairlines (`--rule`) are
exempt; anything that *bounds a control* is not.

**The Single Appearance Rule.** This site ships one appearance. `color-scheme: light` is declared and no
`prefers-color-scheme` query exists in the build; a dark-preference browser renders this exact sheet.
Do not add a dark variant to a new surface.

## Typography

**Display / Body Font:** Alegreya Variable (self-hosted via fontsource; falls back to Alegreya, Georgia, serif)
**Apparatus Font:** Alegreya SC (self-hosted small caps, weights 400 and 700)

**Character:** One family, two voices. Alegreya's calligraphic serif sets everything read — body, senses,
headwords, status lines — and its small-caps companion is reserved for short labels that point at the
text rather than being it. `font-synthesis-weight: none` is set, so weights are real cuts only.

### Hierarchy
- **Display** (600, `clamp(2.4rem, 9vw, 4rem)`, 1.02, oxblood): The headword on a word page and the title
  on the not-found page. Uppercase, slightly tightened, balanced wrap, closed by a 3px ink rule. Weight
  600 rather than a black cut: the colour carries the emphasis, so the letterforms do not have to.
- **Headline** (600, `clamp(1.9rem, 4.5vw, 2.6rem)`, 1.08, ink): Prose-page `h1`, uppercase, closed with a
  3px ink rule. Same weight as a headword, deliberately not the same colour.
- **Title** (700, 1.3rem, 1.25): The headword in a search result row; uppercase, lightly tracked, turning
  oxblood when the row is hovered or keyboard-active.
- **Subhead** (700, 1.22rem, 1.25): Prose-page `h2`, sentence case, balanced wrap, 2.2rem of space above.
  Also the ceiling of the compact search field's clamp.
- **Body** (400, 1.075rem, 1.62): Senses and definitions, held to the 68ch `--measure`. Prose paragraphs
  are the same size but not the same block: they span the container and take 1.7 leading (see Layout).
- **Small** (400, 0.9rem, 1.45): Italic label stacks, result gists, idiom lines, homograph marks — and,
  in the regular upright face, every status sentence: the field's hint, "Po kërkohet…", the no-match and
  error lines, the loader line, and the colophon's static-site and copyright notes.
- **Label** (Alegreya SC, 400, 0.82rem, +0.06em): Guide words, the running-head rail and its count, the
  masthead descriptor, homograph marks, colophon links, idiom-block titles, cross-references.
- **Wordmark** (Alegreya SC, 700, 1.32rem, +0.11em, uppercase, oxblood; ink on hover): The masthead only.
- **Field** (500, `clamp(1.4rem, 5.5vw, 1.9rem)`, 1.3): The search input at home scale; the `compact`
  variant on a word page steps down to `clamp(1.05rem, 3.2vw, 1.22rem)` at weight 400.

### Named Rules
**The Small-Caps-Are-Labels Rule.** Alegreya SC is for *labels*: a guide word, a homograph numeral, a
footer link, the masthead descriptor, an idiom-block title, a cross-reference, a result count. It is
never a sentence. A sentence set in small caps at 13px has no lowercase shapes left to read a line by,
and every status, hint, pending, no-match, error, loader and colophon-note line in this build is
therefore set in the regular upright face at `--step-small` with normal tracking. If it has a verb, it
is not in small caps.

**The No-Hyphenation Rule.** `hyphens: auto` is deliberately absent everywhere, including in justified
two-column entries. The browser's pattern set breaks Albanian wrongly (`ko-ckë` for `koc-kë`) and varies
by engine; a bad break inside a dictionary *of that language* teaches the error. `text-align: justify`
is kept on the two-column long-entry layout — the one page the book itself justified — because narrow
measures need it and the ragged right of a 2.5rem-gapped column looks broken.

**The Tabular Numbers Rule.** Sense numbers are set `font-variant-numeric: tabular-nums lining-nums` in
a fixed 1.6rem right-aligned column, so the sense text hangs on one axis from 1. through 36.

**The Terminology-Not-Code Rule.** Backticked terms in prose take an italic at +0.01em in the inherited
serif. There is no monospace face in this system.

## Layout

One column, no grid — and, since the prose change, two reading widths inside it. `.container` is
`min(100% - 2×gutter, 56rem)` centred, with the gutter itself
fluid (`clamp(1.25rem, 5vw, 2.5rem)`). The colophon's cloth ground is the one element that breaks the
container: the colour runs full-bleed while its contents stay on the same 56rem column as everything
above.

**The two page types measure differently, on purpose.** Both span their structure across the full
container, and there they agree: 896px of span at the 56rem container on a word page and on a prose
page alike. Below the structure they diverge. A word page holds its sense list to the 68ch `--measure`
— 623px, 68 characters, 1.62 leading. A prose page holds nothing back: `.prose h1`, `.prose h2`,
`.prose p` and `.prose li` all run the full 896px, which is **98 characters** to the line, and the
paragraphs open to **1.7** leading to carry it. That is the user's explicit choice — they asked for the
Rreth page's text to sit on the same edge as its heading — and the line-length cost has been raised
with them separately. It is recorded here as a stated tension, not as a target to copy blindly.

`--measure` (68ch) still exists and still governs everything it governed before except prose: the sense
list on a word page and the `.notfound` block. Search results are not measured; they are held by the
container like the rest of the search column.

Vertical rhythm is a small set of reused steps rather than a numeric scale:
`clamp(1.75rem, 6vw, 3rem)` opens every major block (entry, not-found, loader, prose), 1.5rem separates
homograph versions, 0.85rem separates senses, 0.7rem and 0.45rem carry label stacks and rule gaps. The
home page adds `clamp(2rem, 9vh, 5rem)` of headroom above the field so the caret sits near the optical
centre; a word page steps that down to `clamp(1.4rem, 4vh, 2.4rem)` so the entry leads. Main ends with
`clamp(3rem, 10vw, 5.5rem)` of clearance above the colophon, and the body is a column flex with main
flexed so the cloth block always closes the viewport.

Responsive behaviour is two breakpoints and both are content-driven: below 30rem the rail's middle count
is dropped and the leader closes to a single uninterrupted rule; at and above 60rem a long entry's sense
list becomes two columns with a 2.5rem gap and a hairline column rule. Nothing reflows into a drawer, a
modal or a hamburger — the field is the navigation at every width.

### Named Rules
**The Two Measures Rule.** This system has two reading widths and they are not reconciled. A *defined
word* is read at the 68ch `--measure` at 1.62 leading; a *page of prose* is read at the full container,
98 characters at 1.7 leading, because the user asked for heading and text on one edge. Structure — the
h1, its 3px rule, the guide rail — spans the container on both. When you add a surface, decide which of
the two it is and take that page's whole behaviour, measure and leading together; do not invent a third
width and do not quietly re-cap the prose page.

## Elevation & Depth

**There are no shadows in this system, and no gradients.** A grep of the source returns zero
`box-shadow`, zero `border-radius` and zero gradient functions. This world is printed: depth is carried
entirely by rule weight and ink density. The masthead is separated from the content by an edge in cloth;
content is separated from content by hairlines in `--rule`; the colophon needs no edge at all, because a
change of ground is already the strongest separation in the system.

### Rule Weight Vocabulary
- **Hairline** (`1px solid var(--rule)`): Separation without hierarchy — result rows, the guide-word
  underline, rail leaders, column rules, the idiom block's left rule, the rule between homograph
  versions, the loader's closing rule.
- **Bound** (`2px solid var(--cloth)` / `2px solid var(--rule-strong)`): The limits of a region or a
  control — the masthead's bottom edge in cloth; the compact search field's underline on a word page.
- **Terminal** (`3px solid var(--ink)` / `3px solid var(--rule-strong)` / `3px solid var(--cloth)`):
  The end of something — the rule under a headword or a page title, and the search field at home scale,
  where the 3px line *is* the field and turns oxblood on focus.

### Named Rules
**The Rule-Weight Depth Rule.** Three weights are the whole depth system: 1px separates, 2px bounds,
3px closes. A surface that needs to feel raised gets a heavier rule, never a shadow, a tint or a radius.

## Shapes

Everything is square. Radius is `0` everywhere in the build — not "small", zero — including the search
field, the result rows, the focus ring's outline box, the colophon block and the clear button. Form is
expressed by ruled lines, by ink weight and by the one change of ground, not by silhouette. Borders are
always full-width or full-height single rules; there are no boxes drawn on all four sides anywhere in
the system. The one inline icon (the clear "×") is hand-drawn SVG geometry — two square-capped 1.6px
strokes at currentColor — not an icon font or a glyph.

## Components

### Masthead
Quiet paper closed by an oxblood rule: the cloth wordmark and the muted-ink descriptor sit
baseline-aligned on the stock ground above a `2px solid var(--cloth)` bottom border. The wordmark is
small caps, uppercase, +0.11em, undecorated, and inverts to ink on hover — the one place in the system
where leaving oxblood *is* the hover state. Wraps to two lines on narrow viewports; it never becomes a
nav.

### Colophon
The binding closing the page: a full-bleed `--cloth` ground with no top border — the change of ground is
the boundary — holding its contents on the same container column. Text is `--on-cloth` (9.64:1). The
link row is small caps at label size in `--on-cloth` with a 45%-opacity underline of the same colour
that goes solid on hover; the middot separators between links are `--on-cloth-muted` (6.26:1). The
static-site note and the copyright below are sentences, so they drop out of small caps into the regular
face at `--step-small` with normal tracking. Because this is the one region whose ground is not stock,
it is also the one region that recolours the focus ring: `.colophon :focus-visible` overrides
`outline-color` to `--on-cloth` (9.64:1 on cloth) while keeping the 2px width and 3px offset. The
override is global rather than layout-scoped on purpose — the link row is a React island, which Astro's
scoped styles do not reach.

### Search Field (signature)
- **Shape:** A ruled line, not a box. No background, no border except a 3px `--rule-strong` underline
  and 0.3rem of padding above it.
- **Focus:** The underline turns oxblood over 160ms; the caret is already oxblood. The input's own
  outline is suppressed because the rule *is* the focus indicator.
- **Clear:** A 1.9rem square hit area holding a 0.95rem inline SVG cross in muted ink, going oxblood on
  hover; it appears only when the field has content.
- **Status line:** Every non-result state — the "write without ë and ç" hint, "Po kërkohet…", the
  three-letter minimum, the no-match line, the index-read error — is a sentence in the regular face at
  `--step-small`, muted ink, on a reserved 1.5em line so nothing below it jumps.
- **Shortcut:** `/` from anywhere on the page puts the caret in the field.
- **Compact variant:** On a word page the same object steps back — 2px underline, subhead-ceiling input
  at weight 400, 1.6rem clear target, rail rule removed — so the entry leads the viewport.

### Running-Head Rail (signature)
The search's guide words: the first and last term of the prefix shard the browser actually fetched sit
at the margins in muted small caps, with a hairline leader running between them and the result count
centred inside the leader — a count is a label, so it stays in small caps. Below 30rem the count drops
out and the leader closes to one rule. On a word page the same rail shows the entry's alphabetical
neighbours; the end that *is* the current word is told apart by having no underline, never by fading.

### Result Row
Baseline grid of headword plus italic label stack, with a truncated one-line gist beneath. Separated by
hairlines, never boxed. Hover and keyboard-active share one treatment: a `--stock-sunk` wash plus the
headword turning oxblood.

**Motion is scripted, not declarative.** A layout effect in `SearchBar.tsx` runs a FLIP pass over the
list before paint: a row that survives a keystroke keeps its DOM node (its key is the entry, not the
index) and animates from its previous rect to its new one; a new row fades in from 5px below; a row that
stops matching is *kept in the list* at the position it held, marked `data-leaving="true"`, and collapsed
by height over 200ms while the rows around it close the gap. All of it runs through the Web Animations
API at 260ms on `cubic-bezier(0.16, 1, 0.3, 1)`; there are no `@keyframes` and no animation library in
the project. The whole pass is skipped when `prefers-reduced-motion: reduce` matches, and leaving rows
are `pointer-events: none`, `aria-hidden` and `role="presentation"` for their whole exit.

### Entry
The headword sets at display scale in oxblood at weight 600 — the lemma, in the binding's colour — then
the first homograph version is closed above by a 3px ink rule and each subsequent version by a hairline.
Each version head carries a small-caps Roman-numeral homograph mark in oxblood beside its italic label
stack. Senses are a counter-reset list with tabular numbers hanging in a 1.6rem column; a single-sense
entry drops the number and the indent entirely. Long entries go two-column with a hairline column rule
at 60rem. The idiom block sits below the senses behind a hairline left rule under a small-caps
"Shprehje" title. Cross-references parsed from `shih te BËJ` render as small-caps oxblood links.

### Not-Found / Empty / Loading
All three are set exactly where a real entry sets its parts, so the page stays inside the book: the
not-found title at display scale in oxblood at 600 over a 3px ink rule, its short verdict in the italic
label position, its explanation as ordinary muted prose, and the loader as a muted sentence in the
regular face closed by a hairline.

### Browser Surfaces
Selection is a wash of the binding rather than a block of colour: `color-mix(in srgb, var(--cloth) 22%,
var(--stock))` under `--ink` text (8.76:1). The focus ring is one ring recoloured for the one region
whose ground differs: a 2px outline at 3px offset, `--cloth` everywhere on the stock ground and
`--on-cloth` inside the colophon.
Scrollbars are thin, `--rule-strong` thumb on a transparent track, with a 3px stock border so the thumb
reads as a rule rather than a bar. The skip link is screen-reader-only until focused, when it becomes a
cloth chip: oxblood ground, `--on-cloth` text, 0.6rem/1rem padding, square.

## Do's and Don'ts

### Do:
- **Do** keep one reading ground: `--stock` from the masthead through the content, with the masthead
  closed by `2px solid var(--cloth)`.
- **Do** let the cloth be a ground exactly once — the colophon block at the foot — with `--on-cloth`
  text, `--on-cloth` links, `--on-cloth-muted` separators, an `--on-cloth` focus ring, and no border
  above it.
- **Do** set a lemma in `--cloth` at weight 600 — the entry headword, the not-found title — and keep a
  non-lemma page title (`.prose h1`) in `--ink` at the same weight.
- **Do** use `--cloth` for marks as well: sense numbers, homograph marks, cross-references, the focused
  field rule, the caret, hover colours, the focus ring.
- **Do** express depth as rule weight — 1px separates, 2px bounds, 3px closes.
- **Do** set labels in Alegreya SC at 0.82rem / +0.06em: guide words, the rail and its count, colophon
  links, homograph marks, idiom titles, cross-references.
- **Do** set every sentence — hints, status, pending, no-match, errors, the loader, colophon notes — in
  the regular upright face at `--step-small` with normal tracking.
- **Do** span structure across the container on both page types (896px at the 56rem container), and
  then follow the page: a word page's sense list and the `.notfound` block are capped at the 68ch
  `--measure` (623px, 1.62 leading); a prose page is not capped at all and runs the full 896px at 1.7
  leading. Don't split the difference on a new surface — pick the page type it belongs to.
- **Do** keep `--rule-strong` at or above 3:1 on stock (it measures 3.35:1); it is the field's resting
  underline.
- **Do** keep every text/background pair at or above 4.5:1 — ink 13.1:1, muted ink 6.09:1 and cloth
  9.09:1 on stock; `--on-cloth` 9.64:1 and `--on-cloth-muted` 6.26:1 on cloth — and make every state
  legible without relying on colour alone.
- **Do** use tabular lining figures for any number that stacks vertically.
- **Do** animate list changes with a measured FLIP pass on real DOM nodes — survivors move, entrants
  fade in, leavers hold their slot and collapse — and skip the whole pass under
  `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** add a `box-shadow`, a gradient or a `border-radius` anywhere. The build contains none of the
  three and the world is printed.
- **Don't** give a second region a coloured ground. The cloth is the ground once, at the foot; the
  masthead, the entry, the result list and every future section sit on stock. Two full-bleed cloth bands
  bracketing the page were tried and rejected as harsh — do not restore the top band, and do not invent
  a third.
- **Don't** set a sentence in small caps. Small caps are for labels of a few words; a 13px line with no
  lowercase shapes cannot be read as a line.
- **Don't** lighten `--rule-strong`, `--ink-muted` or `--ink` to soften the page. The warmth comes from
  the hue of the stock and the ink, not from lower contrast.
- **Don't** set body text, a sense or a prose paragraph in oxblood; cloth is the lemma and the marks.
- **Don't** put `--ink`, `--ink-muted` or `--rule-strong` on the cloth ground, or `--on-cloth` /
  `--on-cloth-muted` on stock. Each pair belongs to one ground.
- **Don't** enable `hyphens: auto` — the engine hyphenates Albanian wrongly, and this is a dictionary of
  Albanian. Justification in two-column long entries is allowed and intended.
- **Don't** add a `prefers-color-scheme: dark` block or a second palette. The site is light-only by
  decision.
- **Don't** draw a four-sided border, a card or a rounded well around the search field or a result row.
- **Don't** add an icon font, an emoji or a third typeface. Icons are inline SVG geometry at
  currentColor.
- **Don't** put a kicker or eyebrow label above a title — the not-found page comments this refusal
  explicitly and sets its short verdict where an entry sets its label stack instead.
- **Don't** signal state with colour alone, and don't convey the current-page rail end by fading it.
- **Don't** reach for an animation library or `@keyframes` for list motion; the system's motion is
  measured in a layout effect and played through the Web Animations API.
