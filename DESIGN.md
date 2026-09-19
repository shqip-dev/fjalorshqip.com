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
  reading:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "1.075rem"
    fontWeight: 400
    lineHeight: 1.7
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
  day-word:
    fontFamily: "Alegreya Variable, Alegreya, Georgia, serif"
    fontSize: "clamp(1.9rem, 4.5vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.015em"
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
    padding: "0.7rem 0"
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
  day-word-head:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 0 0.45rem"
  day-word-term:
    backgroundColor: "transparent"
    textColor: "{colors.cloth}"
    typography: "{typography.day-word}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0"
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
  leaders, the idiom block's left rule, the rule between
  homograph versions, the loader's closing rule.
- **Strong Rule** (`--rule-strong`): The resting 3px underline of the search field, link underlines at
  rest on stock, and the scrollbar thumb. Held at 3.35:1 on stock **because** it carries the field's
  resting underline, which is a UI boundary owing 3:1.

### Named Rules
**The One Ground Rule.** The sheet is one ground — academy stock — from the masthead through the whole
of the content, and the binding closes it. `--cloth` becomes a ground in exactly two places: the
colophon block at the foot of every page, and a Fjalëz tile holding a letter that stands in its place —
a single cell, not a region, and the one state in the system that has to be read across a grid at a
glance. Nowhere else: not behind the masthead, not behind a card, not behind
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

**The Resting Affordance Rule.** A link carries its underline at rest, on every ground: guide-rail
links at 40%-strength `--ink-muted`, colophon links at 45%-strength `--on-cloth`, prose links in full
`--cloth`, and the day's word at 40%-strength `--cloth`. Hover only resolves that underline to
`currentColor`; on the day's word the hover step is wrapped in `@media (hover: hover)` so a touch device
is never left with oxblood as the only signal. Hover is an enhancement, never the affordance — the same
commitment as "don't signal state with colour alone", read from the other side.

**The Rule-Colours-Are-Not-Ink Rule.** `--rule-strong` and `--rule` draw lines; they never set type.
`--rule-strong` sits at 3.35:1, correct for a boundary and short of the 4.5:1 text floor, so a label,
date or caption that reads as apparatus takes `--ink-muted` (6.09:1) instead. The running head over the
day's word sets both of its halves — the label and the UTC date — in that one colour for this reason.

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
- **Body** (400, 1.075rem, 1.62): The body size, and the leading for text that does not wrap at column
  width — the document default and short UI lines.
- **Reading** (400, 1.075rem, `--leading-read` = 1.7): Every block of long-form text, whatever surface it
  is on: a sense on a word page, the day's-word sense, prose paragraphs and list items, the not-found
  note, the idiom lines. Same size and face as Body; the leading is what makes a full-column line
  readable.
- **Small** (400, 0.9rem, 1.45): Italic label stacks, result gists, idiom lines, homograph marks — and,
  in the regular upright face, every status sentence: the field's hint, "Po kërkohet…", the no-match and
  error lines, the loader line, and the colophon's static-site and copyright notes.
- **Label** (Alegreya SC, 400, 0.82rem, +0.06em): Guide words, the running-head rail and its count, the
  masthead descriptor, homograph marks, colophon links, idiom-block titles, cross-references.
- **Wordmark** (Alegreya SC, 700, 1.32rem, +0.11em, uppercase, oxblood; ink on hover): The masthead only.
- **Day Word** (700, `clamp(1.9rem, 4.5vw, 2.6rem)`, 1.2, +0.015em, uppercase, oxblood): The home
  page's idle lemma, and the only link in the system set at headline scale. It shares the `--step-title`
  step with a prose `h1` and deliberately shares neither its weight nor its colour — it is a word the
  dictionary defines, so it is cloth at 700.
- **Field** (500, `clamp(1.4rem, 5.5vw, 1.9rem)`, 1.3): The search input at home scale; the `compact`
  variant on a word page steps down to `clamp(1.05rem, 3.2vw, 1.22rem)` at weight 400.

### Named Rules
**The Small-Caps-Are-Labels Rule.** Alegreya SC is for *labels*: a guide word, a homograph numeral, a
footer link, the masthead descriptor, an idiom-block title, a cross-reference, a result count. It is
never a sentence. A sentence set in small caps at 13px has no lowercase shapes left to read a line by,
and every status, hint, pending, no-match, error, loader and colophon-note line in this build is
therefore set in the regular upright face at `--step-small` with normal tracking. If it has a verb, it
is not in small caps.

**The One Leading Rule.** Text that wraps at column width is led at `--leading-read` (1.7), and it does
not matter what the text *is*. A definition, a paragraph of prose, an idiom line and the not-found note
are the same object at this width and take the same rhythm; 1.62 stays for text that does not wrap
there. The build previously ran prose at 1.7 and definitions at 1.62 at the same size, and — once the
caps came off — at the same width, which is two rhythms for one object. The rule has **no exception**:
the one that existed, a sense returning to 1.62 inside the two-column mode for long entries, went when
the two-column mode did. Every sense on every entry is led at 1.7.

**The No-Hyphenation Rule.** `hyphens: auto` is deliberately absent everywhere, and a grep for
`hyphens` returns nothing. The browser's pattern set breaks Albanian wrongly (`ko-ckë` for `koc-kë`) and
varies by engine; a bad break inside a dictionary *of that language* teaches the error.

**The Ragged Right Rule.** Every line in the build is set ragged right; `text-align: justify` appears
nowhere. This is a reversal, and the reasoning is worth keeping: justification was argued for on the
long-entry layout as the visible part of the printed-page claim, and it was kept while senses sat in
~430px columns, which is the measure a flush edge needs. When the columns went and the senses opened to
the full 896px, the case went with them — justifying a 98-character line with no hyphenation available
opens rivers. Justification was tried and defended here, not overlooked; it is out because the measure
changed under it.

**The Tabular Numbers Rule.** Sense numbers are set `font-variant-numeric: tabular-nums lining-nums` in
a fixed 1.6rem right-aligned column, so the sense text hangs on one axis from 1. through 36.

**The Terminology-Not-Code Rule.** Backticked terms in prose take an italic at +0.01em in the inherited
serif. There is no monospace face in this system.

## Layout

One column, no grid, and one width inside it. `.container` is `min(100% - 2×gutter, 56rem)` centred,
with the gutter itself fluid (`clamp(1.25rem, 5vw, 2.5rem)`). The colophon's cloth ground is the one
element that breaks the container: the colour runs full-bleed while its contents stay on the same 56rem
column as everything above.

**There is no measure token.** `--measure` was deleted and a repo-wide grep for `var(--measure)` returns
nothing; every cap it held — the sense list on a word page, the day's-word sense, the `.notfound` block
— is gone, and the prose page had already lost its own in an earlier round. Measured at a 1440 viewport
against the container, every surface starts and ends on the same edge: container 0/896/0, search input
0/896/0, status line 0/896/0, result headword and result gist 0/·/0 and 0/896/0, word-page headword
0/896/0, word-page sense 0/896/0, day's-word sense 0/896/0, prose paragraph 0/896/0. A line of text is
**98 characters** at that width, and `--leading-read` (1.7) is what carries it — the leading is the
answer to the length, not a narrower box. This is the user's decision, stated plainly: the width of a
definition is the width of its container, on a word page and on the day's word alike.

Vertical rhythm is a small set of reused steps rather than a numeric scale:
`clamp(1.75rem, 6vw, 3rem)` opens every major block (entry, not-found, loader, prose), 1.5rem separates
homograph versions, 0.85rem separates senses, 0.7rem and 0.45rem carry label stacks and rule gaps. The
home page adds `clamp(2rem, 9vh, 5rem)` of headroom above the field so the caret sits near the optical
centre; a word page steps that down to `clamp(1.4rem, 4vh, 2.4rem)` so the entry leads. Main ends with
`clamp(3rem, 10vw, 5.5rem)` of clearance above the colophon, and the body is a column flex with main
flexed so the cloth block always closes the viewport.

Responsive behaviour is **one** breakpoint and it is content-driven: below 30rem the rail's middle
count is dropped and the leader closes to a single uninterrupted rule. Nothing else changes with width —
the type clamps carry the rest, and a 36-sense entry is one continuous column at every size. Nothing
reflows into a drawer, a modal or a hamburger — the field is the navigation at every width.

### Named Rules
**The One Column Rule.** The container is the measure. Structure and text share one edge on every
surface — headword, rule, guide rail, sense, paragraph, result row, status line — and nothing inside the
column is narrower than the column. Do not add a `max-width` to a block of text, and do not inset a row
with inline padding: both produce the same fault, a line that stops short of the rules above it. When a
line at 98 characters feels long, the answer is leading (`--leading-read`), not a second width. The only
rule is unconditional: no block of text is narrowed and none is split. A ≥60rem two-column mode for
entries of six senses or more used to be the exception; it was removed after the user hit `/f/unë`,
where one word carries two entries — a 2-sense entry and a 9-sense entry — and the threshold rendered
them as two different layouts, ragged single column above justified double column, inside one word.
A rule that splits one object by a count of its parts is what that looked like.

**The Sibling-Island Flag Rule.** Islands coordinate through the document element, not through props.
`SearchBar` writes `document.documentElement.dataset.searching`; the day's word answers in its own
stylesheet with `:global(:root[data-searching='true']) .wordofday { display: none }`. The two have no
shared parent — Astro mounts them as separate islands — and the system does not invent one by lifting
state. The same channel carries a second thing in the build: `src/lib/analytics.ts` keeps the visit
token on `document`, so the field and the day's word report against one visit without a shared ancestor
either. A new surface that must react to another island's state reads a `data-` flag on `:root` and
hides, shifts or recolours itself; it does not acquire a wrapper component.

**The Thumb Target Rule.** A target a thumb has to hit clears 44px, and the build reaches it two ways.
A link that opens an entry grows by its own padding: a result row is 48px (0.7rem of block padding under
a 1.3rem/1.25 headword), the day's word is 48px at 320–390, 53px at 768 and 61px at desktop (0.35rem of
block padding under the `--step-title` step). A control whose *glyph* must stay small grows by an
overlay instead: the field's clear button keeps its 1.9rem box (1.6rem in the compact variant) and adds
a centred, transparent `::after` of 2.75rem inside `@media (pointer: coarse)` — glyph 30px, target 44px
— so the reach grows without the row growing with it. The overlay is deliberately absent on a fine
pointer, where a 44px box would swallow clicks meant for the end of the typed text. Read the target, not
the declared width: a small `width`/`height` on a control is not by itself a finding until you have
looked for the overlay.

## Elevation & Depth

**There are no shadows in this system, and no gradients.** A grep of the source returns zero
`box-shadow`, zero `border-radius` and zero gradient functions. This world is printed: depth is carried
entirely by rule weight and ink density. The masthead is separated from the content by an edge in cloth;
content is separated from content by hairlines in `--rule`; the colophon needs no edge at all, because a
change of ground is already the strongest separation in the system.

### Rule Weight Vocabulary
- **Hairline** (`1px solid var(--rule)`): Separation without hierarchy — result rows, the guide-word
  underline, rail leaders, the idiom block's left rule, the rule between homograph
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
the system. The one grid of cells — the Fjalëz board and its alphabet keyboard — is built the way a
printed table is: a rule-coloured ground showing through 1px grid gaps, so the hairlines are shared
between neighbours and no cell owns a border. The one inline icon (the clear "×") is hand-drawn SVG geometry — two square-capped 1.6px
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
- **Clear:** A 1.9rem square box holding a 0.95rem inline SVG cross in muted ink, going oxblood on
  hover; it appears only when the field has content. On a coarse pointer a transparent 2.75rem `::after`
  centred on that box carries the target to 44px without changing anything visible or moving the row —
  the declared 1.9rem (1.6rem compact) is the glyph, not the target.
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
headword turning oxblood. **The row has no inline padding** (`0.7rem 0`): its text, its separator rule
and the wash that highlights it all stop at the column edge, measured 0/0 on all three. A padded row
insets its headword 8px from the edge every other line on the page starts at; a negative margin to keep
the wash padded was tried and rejected, because it made the band wider than the rules above and below
it. The block padding stays — it is what carries the row to 48px.

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
entry drops the number and the indent entirely. Senses run the full column at `--leading-read`, ragged
right, at every width and every length — the 36-sense entry at `/f/bëhem` is one continuous column, and
the two entries under `/f/unë` are set identically. The idiom block sits below the senses behind a hairline left rule under a small-caps
"Shprehje" title, its lines at `--step-small` and `--leading-read` — it was the tightest leading on the
page (1.5) on what is now its longest line, ~118 characters at 14.4px. Cross-references parsed from `shih te BËJ` render as small-caps oxblood links.

### Fjala e Ditës (signature)
The home page's idle state, and the one place the site speaks before it is asked anything. It is **set as
a small entry, not a card** — no border, no ground, no radius — using the entry's own parts in the
entry's own order: a small-caps running head (the label at the left margin, the date at the right,
closed by a hairline, both halves in `--ink-muted` at 6.09:1); then the headword as an oxblood link at
`--step-title` / 700 with its italic label stack beside it; then the entry's first sense in
`--ink-muted` at `--leading-read`. **Nothing in the block is measured**: the running head, the headword
and the sense all run the container's full width — 0/896/0 at a 1440 viewport, the same edge the field
rule and the hint rule above it stop at, and 20→370 on a phone. The
link's underline is present at rest at 40%-strength cloth and resolves to `currentColor` on hover inside
`@media (hover: hover)`; `padding-block: 0.35rem` carries the tap target to 48px at phone widths. The
headword and its label stack sit 0.7rem apart, not the result row's 0.55rem: a fixed gap beside a 2.6rem
headword reads about half as wide as it does beside a 1.3rem one, so the step is tuned per scale.

It renders only on `/` — `DynamicEntries` picks it by pathname — and only while the field is empty: the
moment a query exists, `:root[data-searching='true']` hides it and the results own the column, so the
day's word steps aside rather than being scrolled past.

The link is instrumented: clicking it fires one `track()` call through `src/lib/analytics.ts` before the
navigation completes. That call is wrapped so a blocked or absent Umami cannot take the page down, and
it changes nothing visual — no pixel of this component depends on analytics loading.

The word and its date are both chosen from **UTC**, so every reader worldwide sees one word at one time
without a daily build. The cost is recorded in the source: near midnight the date label can name a day
the reader's own clock has left. That was accepted over the alternative of a label disagreeing with the
word beneath it.

### Fjalëz Board (signature)
The word game at `/fjaleez`, and the one **ruled table** in this system. A puzzle in a book is set as a
grid of cells with hairlines between them, and that is how it is drawn: a rule-coloured ground under a
1px grid gap with cells in `--stock` on top, so no cell carries a border, a radius or a shadow of its
own. The keyboard beneath it is the same construction in three staggered strips — QWERTY, with Ë after P and
Ç after L where a German layout keeps Ü, Ö and Ä, and no W, because the alphabet has none. Each row
is its own ruled strip, centred against the widest one and sized as its share of the keyboard
(`--keys / --columns * 100%`), which holds every key to one width across rows without measuring
anything. The board, the keyboard and the two action keys share one measure, `--play`, which answers to
the viewport's **height** as well as its width (`min(100%, 26rem, max(16rem, 100svh - 28rem))`): six
square rows and three rows of keys have to be seen together, or the game is played by scrolling. The
play block is the one **centred** object in the system — `margin-inline: auto` on a block of `--play`
— while the title, the running head, the intro and the archive keep the column's left edge, and
nothing *inside* the block is centred: the status line, the answer and the legend all start on the
board's own left edge.

A tile's answer is an **ink density**, which is the system's whole depth vocabulary:
- *In place* — `--cloth` ground, `--on-cloth` letter (9.64:1). The placed letter is the lemma being
  revealed, so it is set in the binding.
- *In the word, elsewhere* — `--cloth-wash` ground (the selection wash, 22% cloth over stock) under
  `--ink` (8.85:1), closed by a 3px `--cloth` rule along the bottom.
- *Not in the word* — `--stock-sunk` under `--ink-muted` (5.58:1).

The three grounds are ordered by lightness — dark, mid, pale — so the pattern reads when the colour does
not, and the misplaced letter carries the rule as a second signal rather than relying on the wash alone.
The cell waiting for a letter wears the search field's own caret: a 3px oxblood rule along its bottom
edge. A refused guess nudges the active row once through the Web Animations API and says why in the
status line; the row that has just been scored settles left to right, one tile after another, the way a
line is read. Both are skipped under `prefers-reduced-motion`.

A box holds one character, so a letter written with two fills two boxes and the grid stays five wide.
The page title is **ink**, not oxblood — "Fjalëz" is a page, not a defined word — with the puzzle's
number and its UTC date as a running head below it. The answer, once the game is over, is set exactly as
the day's word is set: an oxblood headword at `--step-title` / 700 with its underline at rest, linking
to the entry. The archive below is the result list's construction — hairline-separated rows, each a
full-width target, the current day's number in oxblood.

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
- **Do** run structure *and* text to the container edge on every surface (896px at the 56rem
  container) — headword, rule, guide rail, sense, paragraph, result row, status line all start and end
  on one edge.
- **Do** lead every block that wraps at column width with `--leading-read` (1.7) — senses, prose
  paragraphs and list items, the day's-word sense, the not-found note, idiom lines — and keep 1.62 for
  text that does not wrap there.
- **Do** keep `--rule-strong` at or above 3:1 on stock (it measures 3.35:1); it is the field's resting
  underline.
- **Do** keep every text/background pair at or above 4.5:1 — ink 13.1:1, muted ink 6.09:1 and cloth
  9.09:1 on stock; `--on-cloth` 9.64:1 and `--on-cloth-muted` 6.26:1 on cloth — and make every state
  legible without relying on colour alone.
- **Do** give every link its underline at rest and let hover only resolve it to `currentColor` — and
  gate the hover step behind `@media (hover: hover)` when it is the only state change on the element.
- **Do** give a thumb 44px: pad an entry-opening link until it reaches it (result row 48px, the day's
  word 48–61px), or, where the glyph must stay small, add a centred transparent `::after` of 2.75rem
  under `@media (pointer: coarse)` the way the field's clear button does.
- **Do** set apparatus text — labels, dates, captions — in `--ink-muted` (6.09:1). `--rule-strong` is a
  line colour at 3.35:1 and is never type.
- **Do** coordinate sibling islands through a `data-` flag on `:root` read from the consuming
  stylesheet, the way `data-searching` hides the day's word while a query exists.
- **Do** use tabular lining figures for any number that stacks vertically.
- **Do** animate list changes with a measured FLIP pass on real DOM nodes — survivors move, entrants
  fade in, leavers hold their slot and collapse — and skip the whole pass under
  `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** add a `box-shadow`, a gradient or a `border-radius` anywhere. The build contains none of the
  three and the world is printed.
- **Don't** give a second region a coloured ground. The cloth is the ground at the foot and inside a
  single placed Fjalëz tile; the masthead, the entry, the result list and every future section sit on
  stock. Two full-bleed cloth bands
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
  Albanian.
- **Don't** justify text. The build is ragged right throughout; justification was tried on the old
  narrow-column entry layout and dropped when the measure widened, because a 98-character line with no
  hyphenation available rivers.
- **Don't** split a text block into columns, and don't branch a layout on a count of an entry's parts.
  One word can hold two entries of different lengths, and a threshold sets them in two different
  layouts side by side.
- **Don't** add a `prefers-color-scheme: dark` block or a second palette. The site is light-only by
  decision.
- **Don't** draw a four-sided border, a card or a rounded well around the search field or a result row.
- **Don't** add an icon font, an emoji or a third typeface. Icons are inline SVG geometry at
  currentColor.
- **Don't** put a kicker or eyebrow label above a title — the not-found page comments this refusal
  explicitly and sets its short verdict where an entry sets its label stack instead. A *running head* is
  a different object and the book's own: a small-caps label with its counterpart at the opposite margin,
  closed by a hairline, as the guide rail and the day's word both set it.
- **Don't** let hover be the thing that tells a reader something is a link, and don't ship a `:hover`
  rule as the only state an element has.
- **Don't** set text in `--rule-strong`. It measures 3.35:1 — a boundary colour, below the 4.5:1 floor
  every text/background pair in this system holds.
- **Don't** re-introduce a `max-width` on a block of text, and don't inset a row from the column edge
  with inline padding. Both make a line stop short of the rules above it. A long line is answered with
  leading, not with a second width.
- **Don't** wrap a new home-page block in a card to separate it from the one above. Separation is a
  small-caps running head over a hairline, the same parts an entry already uses.
- **Don't** signal state with colour alone, and don't convey the current-page rail end by fading it.
- **Don't** reach for an animation library or `@keyframes` for list motion; the system's motion is
  measured in a layout effect and played through the Web Animations API.
