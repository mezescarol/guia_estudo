# AGENTS.md — Guia de Estudo (Tuna)

> This folder also holds unrelated tuna (student music group) files — sheet music, recordings
> for "Tanto Mar", etc. This file documents the study-guide pages that live alongside them.

## Repo / workflow

**This IS a real git repo now** (an earlier version of this file said otherwise — that's stale,
correct it if you see it repeated). Remote `origin` → `https://github.com/mezescarol/guia_estudo.git`,
default branch `main`, pushed directly (no PR workflow observed so far). Commit messages are
PT-PT, Conventional-Commits-style prefixes (`feat:`/`fix:`/`chore:`), one short paragraph body
explaining *why*, not a line-by-line diff summary. **Only commit when the user explicitly asks**
— several sessions' worth of work has sat uncommitted across many small requests before a single
"resume em formato de commit" ask. The user has explicitly asked for `commit --amend` +
`push --force-with-lease` once (to fix a typo in an already-pushed message) — that's not a
standing default, confirm before amending/force-pushing again, same as any repo.

All HTML/CSS/JS edits this session were made **directly to the files in this directory** — no
scratchpad/Artifact-publishing round-trip. If an older note below describes a scratchpad-based
workflow for `cavaquinho.html`, treat that as historical (from an earlier session) and verify
with the user before assuming it still applies — it did not apply this session.

## Site structure — 4 pages + 3 shared files

| File | Role |
|---|---|
| `index.html` | Home page ("Meet Cordas"). Hero header only, no `<section>`s of its own. |
| `cavaquinho.html` | Complete, all 6 sections. |
| `bandolim.html` | Partial — sections 01-02 of 6 built; sections 03-06 not yet started (no `<section>` elements exist for them at all, not even empty anchors). Currently also shows a temporary "Página em construção" banner stacked above the real content, see below. |
| `guitarra.html` | Placeholder only — no sections, no anchors, just the "Página em construção" banner. Created this session (`icons/guitar.png` used for its instrument icon; there is no `guitarra.png`, don't invent one). |
| `styles.css` | Shared by all 4 pages. |
| `audio-engine.js` | Shared Web Audio helpers (`playStrum`, `playStrumReverse`, `playStrumSequence`, `playStrumNoteAt`, `getAudioCtx`) — cavaquinho-specific frequencies live *inside* this file, see the bandolim note below about not calling its cavaquinho-hardcoded functions from other pages. |
| `quick-nav.js` | **New shared file this session** — the entire floating "☰" dropdown menu (all 4 pages' titles + subtitles, the open/close/accordion logic) lives here now. See the dedicated section below; don't hand-edit per-page submenu markup, there isn't any anymore. |

Every page's `<body>` carries `data-page="index"` / `"cavaquinho"` / `"bandolim"` / `"guitarra"` —
`quick-nav.js` reads this to know which page it's on. If a 5th page is ever added, give it this
attribute too and add an entry to `quick-nav.js`'s `PAGES` array.

## Site-wide layout conventions established this session — don't casually undo

- **Sticky footer:** `.page{ display:flex; flex-direction:column; min-height:100vh; }` +
  `footer{ margin-top:auto; }`. On short pages (`index.html`, `guitarra.html`) this pins the
  footer to the exact bottom of the viewport instead of leaving it floating mid-page; on long
  pages (`cavaquinho.html`, `bandolim.html`) it's a no-op since content already exceeds 100vh.
  `.page`'s own trailing bottom padding was cut from the old `clamp(80px,10vw,100px)` down to a
  flat **`16px`** — that old large value used to be the only thing separating a long page's last
  section from the footer, but now that every `section` already has its own `clamp(46px,6vw,62px)`
  bottom padding *and* the footer sits via `margin-top:auto`, the old value was just adding a
  huge dead gap *after* the footer, below the visible text, before the true screen bottom.
  Explicit user ask: "espaçamento inferior mínimo entre footer e fim da tela." Don't re-inflate
  this value; if more breathing room is ever wanted before the footer, add it to `footer`'s own
  `padding-top` (currently `30px 0 10px`) or to the last section, not back onto `.page`.
- **`--page-pad` CSS custom property** (`:root{ --page-pad: clamp(20px, 5vw, 48px); }`) is the
  single source of truth for the page's left/right padding. `.page`'s own horizontal padding
  references it (`padding: 0 var(--page-pad) 16px`), and so does the mobile instrument-icon width
  formula (see below) — if you change the page gutter, both stay in sync automatically. Don't
  hardcode a duplicate `clamp(20px,5vw,48px)` anywhere else; reference the variable.
- **`.cover` header has `padding: 0 0 clamp(34px, 4.5vw, 44px)`** — top padding is deliberately
  **zero**. It used to be `clamp(56px,7vw,72px)` on top too; that was removed on explicit request
  ("diminuir ao máximo o espaçamento superior no topo da página, acima do primeiro ícone"). All of
  the top spacing above the page's first element now comes from `.staff`'s own margin (next
  bullet) — don't add header top padding back, it would stack with `.staff`'s margin and both
  balloon the top gap again *and* break the top/bottom symmetry described next.
- **`.staff`** (the 5 short horizontal lines — a decorative "musical staff" graphic, the very
  first element in every page's `<header class="cover">`, before the eyebrow nav text) is what
  the user refers to informally as **"o ícone"** at the top of the page when giving spacing
  instructions — keep that mapping in mind for future requests. It's `margin: 22px auto` (was
  `margin: 0 auto 22px` — zero top, 22px bottom only). Changed to be symmetric: "esse ícone tem o
  mesmo espaçamento superior e inferior, usando o espaçamento inferior atual como padrão" — with
  `.cover`'s top padding now zero (previous bullet), `.staff`'s own 22px margin is the *only*
  thing producing the gap on both sides, so top and bottom are now genuinely equal. If you touch
  either of these two rules, touch them together or the symmetry breaks silently.
- **`.eyebrow` font-size is fluid, not fixed:** `clamp(9.5px, 0.83vw + 6.83px, 12px)` (was a flat
  `12px`) plus `white-space: nowrap`. The nav row "Página inicial · Cavaquinho · Bandolim ·
  Guitarra" must never wrap to two lines; instead of a hard mobile breakpoint, the formula shrinks
  the text continuously and only as much as needed — it's still exactly `12px` above a ~620px
  viewport (same as before) and floors at `9.5px` around 320px. Don't replace with a flat px value
  or a stepped media-query breakpoint; the whole point was avoiding both.

## Instrument-icons system (`index.html` only) — three distinct, deliberately separate behaviors

This took many iterations; the three behaviors below are independent and must stay that way —
don't merge them or let one accidentally trigger another's classes.

1. **Entrance animation** (mobile only, `max-width:620px` match, respects
   `prefers-reduced-motion`): an `IntersectionObserver` (`threshold: 1.0`) watches
   `.instrument-icons`; the moment the whole row is *fully* on screen (covers both "already
   visible on load" and "revealed after scrolling"), it plays a left-to-right sequence — one icon
   at a time gets `.auto-spin` (→ `rotate(45deg) scale(1.136)` on the `<img>`, label fades in),
   held ~1200ms, then a 300ms gap before the next. Fires once per page view; the observer
   disconnects itself after triggering.
2. **Click-to-navigate animation** (mobile only, separate class from the entrance one — don't
   reuse `.auto-spin` for this): tapping an icon's link calls `preventDefault()`, adds
   `.icon-clicked` to that `.instrument-item` (scales the **whole item — icon + label together**
   by 1.2x via `transform:scale(1.2)` on the item itself, not just the `<img>`) and `.has-clicked`
   to the `.instrument-icons` container (dims every *other* item to `opacity:0.3` via
   `.has-clicked .instrument-item:not(.icon-clicked)`). Navigation is delayed by
   `CLICK_TRANSITION_MS` (currently `850` in the inline script), which is **kept exactly equal**
   to the CSS transition duration (`.instrument-item{ transition: transform .85s ease, opacity
   .85s ease; }`) — no buffer beyond the animation itself, per explicit instruction ("remova o
   delay atual" after an earlier version added an arbitrary extra wait). If either number changes,
   change both together. Bumped `600`→`700`→`850` (`.6s`→`.7s`→`.85s`) across two follow-up
   requests this session — same "change both together" rule applies to any future adjustment.
   - **Clicking during the entrance sequence interrupts it** (real bug fixed this session): `spin()`
     schedules its `HOLD_MS`/`GAP_MS` timers via `setTimeout`, and until this fix nothing ever
     cancelled them, so clicking an icon mid-sequence still let *other* icons rotate into
     `.auto-spin` underneath the dimmed/selected click state, visibly fighting it. Every timer id
     `spin()` schedules is now pushed onto a module-level `spinTimers` array; the click handler
     calls `stopSequence()` first (clears every pending timer via `clearSpinTimers()`, sets
     `running = false`, strips `.auto-spin` from all items including the just-clicked one, since
     otherwise its rotate transform would stack with `.icon-clicked`'s scale). If you add more
     `setTimeout` calls to the entrance sequence, push their ids onto `spinTimers` too or this
     breaks again silently.
3. **Desktop hover** (`@media (min-width: 621px)` only): the *same* rotate+scale visual as the
   entrance animation, but via real `:hover`, deliberately **not** available on mobile — mobile
   `:hover`-on-tap was explicitly removed (touch browsers fire `:hover` on tap unpredictably,
   which collided with behavior #2 above). Don't remove the `min-width:621px` scoping.

**bfcache reset (real bug fixed this session):** browsers restoring a page from the
back/forward-cache (hitting the browser Back button) don't re-run inline `<script>`s, so any of
the three classes above left on an element right before the user navigated away would still be
sitting there when they came back. A `pageshow` listener checks `event.persisted` and calls
`resetIcons()`, which must clear **all three** states — `auto-spin`, `icon-clicked` on every item,
*and* `has-clicked` on the container — then re-arms the `IntersectionObserver` so the entrance
sequence can play again. `resetIcons()` originally only cleared `auto-spin`; don't regress to that
narrower version, a stale enlarged/dimmed icon set could otherwise reappear on a bfcache restore.
A plain fresh full page load doesn't need this — the script re-runs from scratch, nothing is ever
set on a brand-new DOM.

**Icon sizing:** desktop is a flat `105.6px` (`aspect-ratio:1/1`, not a fixed height — lets the
mobile override below change only `width`) — bumped up 20% from the original `88px` on explicit
request. Mobile: `width: clamp(64px, calc((100vw - 2 * var(--page-pad) - 28px) / 3), 112px)` —
computed straight from the real available row width (viewport minus both page paddings minus the
two 14px gaps between 3 icons, divided by 3), so the icons grow to fill the row on narrow phones
without ever crossing the page's own side margins. If the icon count or gap ever changes,
recompute this formula (don't just guess a new clamp range); it's independent of the desktop base
value, so changing one doesn't affect the other. **`.instrument-icons{ margin-top: 28px }` is now
the single base value, applying to both breakpoints** — it used to be `12px` on desktop with a
mobile-only override to `28px`; on request ("aumentar o espaçamento... na versão desktop" to match
mobile) the base was raised to `28px` and the now-redundant mobile override was deleted rather than
left duplicated.

## Quick-nav dropdown menu — rebuilt as one shared, data-driven system this session

`quick-nav.js` is now the **single source of truth** for the floating "☰" menu on
`cavaquinho.html`, `bandolim.html`, and `guitarra.html` (not `index.html`, see below). Each of
those 3 HTML files only needs:
```html
<button id="quickNavToggle" class="quick-nav-toggle visible" ...>☰</button>
<div id="quickNavPanel" class="quick-nav-panel" hidden></div>
<script src="quick-nav.js"></script>
```
The script builds the entire panel DOM at runtime from a `PAGES` array (id, label, href,
`sections: [{id, label}, ...]`). **There is no more hand-authored submenu HTML in any page** — to
rename/add/remove a section link (e.g. when bandolim's sections 03-06 eventually get built), edit
`PAGES` in `quick-nav.js`, not the HTML files.

Accordion behavior (confirm you understand this before touching it, it went through several
correction rounds):
- Opening the menu always shows the **current page's own** subtitles pre-expanded — `expandedId`
  initializes to `document.body.dataset.page` fresh every time the script runs (page load or
  bfcache-style reopen), it is **not** persisted from a previous page's state.
- **A single click on any title now both expands its subtitles (if it has any) and navigates
  immediately** — `handleTitleClick()` used to require a second click on an already-expanded
  title to navigate (first click only expanded); that two-click requirement was removed on
  explicit request ("Não deve mais ser necessário clicar uma segunda vez"). Navigation is: scroll
  to the top of the current page (no reload) if it's the page you're already on, otherwise a full
  navigation to that page's `.html`. Because `expandedId` re-initializes to the arriving page's own
  `data-page` on load (previous bullet), **the destination page's menu reopens with that same title
  already expanded** without any extra state needing to be passed across the navigation — this
  falls out of the existing init logic, don't add sessionStorage/URL-param plumbing to replicate it.
- Clicking a visible subtitle link navigates straight to `page.html#sectionId`.

**Real bug fixed this session:** `.quick-nav-submenu{ display:flex; ... }` had no `[hidden]`
override, so setting the DOM `hidden` property in JS had **no visual effect at all** — Cavaquinho's
and Bandolim's subtitle lists were both rendered open, always, everywhere, regardless of the
`expandedId` state. Fixed with `.quick-nav-submenu[hidden]{ display:none; }`, mirroring the
already-correct `.quick-nav-panel[hidden]{ display:none; }` rule. **If you add any new element
that's shown/hidden via the `hidden` DOM property while also having its own `display` set in an
author rule, it needs this same explicit `[hidden]` override** — author `display` always beats the
UA default `[hidden]{display:none}`, regardless of selector specificity.

Other established behavior, don't regress:
- **Stays open across full navigation** until the user clicks outside, presses Escape, or clicks
  the toggle again — implemented via `sessionStorage.setItem('quickNavOpen','1')` right before
  navigating (both on a title-navigate and a subtitle click), read back on load to auto-reopen.
  Cleared on any of the three close paths.
- **Fixed width:** `.quick-nav-panel{ width:240px; max-width:calc(100vw - 40px); }` — explicit ask
  so the panel doesn't visibly resize when switching between Cavaquinho's 6-item list and
  Bandolim's 2-item one. Don't go back to intrinsic/shrink-to-fit width.
- **`index.html` has no dropdown at all** — removed on explicit request. Because it still shares
  the `quickNavOpen` sessionStorage key with the other 3 pages, it keeps one tiny inline script
  (`sessionStorage.removeItem('quickNavOpen')` on load) so a menu left open on another page
  doesn't leak back open on a later visit after passing through the home page. Don't delete that
  line without reconsidering the leak.
- **No more mobile-only restriction anywhere.** Guitarra's dropdown briefly had a `.mobile-only`
  class + a `@media(min-width:621px){display:none}` rule; that was explicitly superseded in favor
  of identical behavior on every page at every breakpoint. Neither the class nor that media rule
  exist anymore — don't reintroduce a per-page visibility difference for this menu without being
  asked again.
- Title buttons are real `<button type="button">`s (`cursor:pointer`, not the old `cursor:default`)
  with `aria-expanded` kept in sync with their submenu's actual visible state, plus a
  `.quick-nav-page-btn[aria-expanded="true"]` highlight alongside `:hover`.

## "Página em construção" banner (`bandolim.html` top + all of `guitarra.html`)

Both pages currently show, stacked *inside* `<header class="cover">`, above everything else:
```html
<div class="toc-separator" aria-hidden="true"></div>
<h1 style="margin-top: 28px;">Página em construção</h1>
<div class="toc-separator" aria-hidden="true"></div>
```
On `guitarra.html` this is the page's entire content (no sections exist yet). On `bandolim.html`
it sits **above** the real, working sections 01-02 — added on explicit request while sections
03-06 are still unbuilt. This is intentional, not leftover debug/placeholder content accidentally
left in — don't strip it without confirming with the user, and don't confuse it with the
page-level `data-page`/eyebrow "current page" markers (unrelated, both still correct/functional
underneath the banner).

## Cavaquinho (`cavaquinho.html`) — complete, all 6 sections

### Conventions established through iteration — don't casually undo

- **Font sizing:** everything in `<style>` is `rem`, root is `html{font-size:16px}` with
  `@media(max-width:620px){html{font-size:19.2px}}` (mobile +20%). Don't use CSS `zoom` — tried
  it, it doesn't reflow media queries/viewport correctly and causes overflow. `.eyebrow` is
  deliberately fixed-`px`-but-fluid (see the site-wide section above — it moved from a flat `12px`
  to a `clamp()` this session, but it's still *not* rem-based / immune to the root-font-size
  mobile bump, on purpose). `.chord-name` still scales with the root like everything else, it's
  just a deliberately smaller base value (`1.15rem`, down from `1.6rem`) after user feedback it
  was too big — don't bump it back up.
- **Text alignment:** paragraphs and `h1/h2/h3` are left-aligned at all widths (the mobile media
  query used to force-center headings; that override was removed on request). `.fret-caption`
  still centers at **all** widths (unrelated exception). Cover `h1`/`.eyebrow` always centered
  (separate, explicit exception, untouched by the above).
- **Typography (Combo C, global — applies at all widths, not just desktop):** `body` =
  `'Gill Sans Nova', 'Gill Sans', Corbel, 'Trebuchet MS', ui-sans-serif, sans-serif`. `h1/h2/h3`
  and `.chord-name` = `'Hoefler Text', 'Iowan Old Style', Palatino, 'Palatino Linotype',
  'Book Antiqua', Georgia, serif`. `.card, .technique` = `Optima, Candara, 'Segoe UI', sans-serif`
  — deliberately **inherited** (selector is `.card, .technique`, *not* `.card *, .technique *`) so
  the existing mono "badge" accents inside cards (`.note-btn`, `.readout`, `.formula-steps .deg`,
  `.formula-example .notes`, `.root-btn`, `.pill.example`, `.technique h4`) keep winning via their
  own more-specific/explicit rules, regardless of source order — don't reintroduce the `*` form,
  it forces mono back onto everything including `.chord-name`. `.tooltip::after` (the popup
  bubble, not the inline trigger term) and `footer` = `Palatino`/`'Book Antiqua'`/Georgia serif,
  italic. All system fonts, no `@font-face`/network loads — user explicitly wants zero added page
  weight. This was rolled out to desktop first with a mobile-only restoration layer, then that
  restoration block was deleted on request so the font is a single global definition, identical on
  every viewport — don't reintroduce a per-breakpoint font override unless asked.
- **Cascade bug, now fixed everywhere:** the old blanket `.card *` rule (equal specificity to
  `.chord-name`, declared later in source) used to silently force `.chord-name` to monospace
  despite its own serif rule. Fixed by the `.card, .technique` inheritance-based rule above.
- **Tooltip trigger styling:** `.tooltip` has **no `font-weight`** and a **solid** (not dotted)
  `border-bottom` — the underline alone marks a tooltip. Words that are *genuinely* meant to be
  bold and happen to be tooltips (`<strong class="tooltip">`) stay bold via the `<strong>` tag
  itself, not via `.tooltip` — don't re-add `font-weight` to the class.
- **Tooltips** (`.tooltip`, `.piano-tooltip`): opened via **one delegated `document` click
  listener** (`e.target.closest(...)`), not per-element listeners — required so the
  runtime-generated fret-caption tooltip works without re-init. Anchored left (`left:0`), never
  centered; `--tip-shift` custom property is computed on hover/focus/click-open to clamp the
  bubble inside the viewport with a **12px safety margin from screen edges**. Mutually exclusive;
  Escape/outside-click closes all.
- **Interval trainer control layout:** DOM order is `Semitom, Tom, −, +, Limpar`. `.mag-btn`/
  `.dir-btn` share one rule with explicit `min-width:5.5rem; height:2.375rem` so all four are
  pixel-identical regardless of label length. `.dir-btn[data-dir="down"]` gets
  `margin-left:18px` **only inside `@media(min-width:621px)`**.
- **The reset button is text now, not a pill:** `Reiniciar` → `Limpar`, bare `<button
  class="reset-interval-btn">`, no pill/border look, right-aligned on both breakpoints by
  *different* mechanisms (desktop `margin-left:auto`, mobile `justify-self:end` in its own grid
  row) — don't let these two merge.
- **Disabled dir-btn no longer changes the cursor** — stays `pointer` even when `disabled`; only
  gray fill + `opacity:.6` communicate the blocked state.
- **Semitom/Tom no longer trigger a step by themselves** — `applyStep()` (moves `stepCount`, only
  called from `.dir-btn`) is split from `magButtonGuidance()` (readout-only, called from
  `.mag-btn`, never touches `stepCount`). Keep that separation if you touch this flow. Both now
  delegate the actual message text to a shared `describeCurrentStep()` (built from whatever
  `stepCount` already holds): `applyStep()` calls it after moving `stepCount`; `magButtonGuidance()`
  calls it instead of its old no-op whenever a step is already in progress (`stepCount !== 0`), so
  switching Semitom↔Tom mid-interval **re-expresses the same already-applied distance in the newly
  picked unit instantly** (e.g. 1 semitom becomes "0,5 tom" the moment Tom is clicked) without
  moving the note or replaying audio — explicit user request ("a mensagem de feedback deve mudar
  instataneamente para refletir a escolha nova"). If `stepCount === 0` (no step applied yet),
  `magButtonGuidance()` still falls through to the old direction-prompt guidance text.
- **Interval trainer +/- buttons are natively `disabled`** at the strip's ends (not just visually
  blocked) via `updateDirButtons()`, falling back to magnitude 1 (semitom) when no magnitude is
  chosen yet so a button is never disabled prematurely.
- **Interval trainer ("Tons e semitons" section, note: page kicker for this section on both
  cavaquinho and bandolim now reads "02 · Distância", not "Tons e semitons" — that rename lives in
  the `<p class="kicker">` text and in `quick-nav.js`'s `PAGES` data, not in the `<h2>`, which
  still literally says "Tons e semitons" inside the section):** `+`/`−` always **flash** (momentary
  `.active`, 220ms). `Semitom`/`Tom` are a **persistent** toggle once a note is picked, but
  **flash** before a note is picked. Steps are **cumulative** (clamped to strip ends) — a
  non-cumulative "single step" mode was built and explicitly reverted, don't reintroduce it.
- **Chord builder (`#construtor`):** starts with **no pre-selection**; shows what's still missing
  until all three (root/quality/forma) are picked, then auto-plays sound on every change (no
  "listen" button). "Visualizar acorde no piano" is a **switch** (`role="switch"`), not a hover
  tooltip. Markers in the main chord diagram (`buildSvg`) are **pills** (`rx=10`), not circles —
  this does **not** apply to the separate Barra/Escadinha/Pirete technique-card previews
  (`buildShapeSvg`), which still use plain circles.
- **Spacing is fluid, not stepped:** structural spacing uses `clamp(min, vw, max)` — `section`
  padding `clamp(46px,6vw,62px)`, `.card` padding `clamp(22px,3.2vw,28px) clamp(24px,3.6vw,30px)`,
  `.cover` bottom padding `clamp(34px,4.5vw,44px)` (top is now flat `0`, see site-wide section
  above). Every `min` equals the old fixed value, so mobile never regressed — if you add a new
  spacing rule, follow the same pattern.
- **Heading line-height is `1.25`** on `h1,h2,h3` (not the body's `1.6`).
- **Note-button grids: fixed size everywhere, no `flex-grow`.** `.strip`, `.root-grid-row`, mobile
  `.root-grid` all use `flex:0 0 40px` with `justify-content:center` on the container — growing
  was explicitly banned (`as boxes de cada nota deverá ter, obrigatoriamente, o mesmo tamanho de
  todas as outras`). Desktop (`min-width:621px`) instead uses `display:grid;
  grid-template-columns:repeat(12,1fr)` on all three note-grids for edge-to-edge fill. **Never**
  reintroduce `flex-grow` on these buttons.
- **The chromatic strip is 12 boxes, not 13** — no repeated trailing Dó. `STRIP_MAX =
  STRIP_NOTES.length - 1` follows automatically if the strip content ever changes; keep
  `STRIP_NOTES`/`STRIP_FREQS`/`STRIP_SHARP` the same length as each other.
- **`#construtor` builder is a 12-column CSS Grid on desktop** (`display:contents` trick to lift
  note/quality/forma buttons into one shared grid), plain flex-column stack on mobile. Don't add
  `grid-column` to individual note buttons — the 12-vs-12 count match is what makes
  auto-placement work.
- **`.result-grid`'s two-column layout is `:has()`-driven, not JS-driven** — no class toggling
  needed when a chord gets selected/cleared.
- **Mobile builder labels are LEFT-aligned** (briefly right-aligned, explicitly reverted).
- Qualidade buttons say **"Acorde maior"/"Acorde menor"**, not "Maior"/"Menor".
- **Section order:** "O cavaquinho" (anatomy) before "Afinação" (tuning).
- **All em dashes (`—`) replaced with hyphens (`-`)** site-wide, including in JS-generated
  strings.
- **`#cavaquinhoCard` only plays on an actual drag** — a plain tap with <30px movement does
  nothing, don't reintroduce a click-to-play fallback.
- **Audio unlock:** `audioCtx` created **eagerly at script load**, not lazily — plus a near-silent
  oscillator "priming" blip on first interaction to cut mobile Safari/Android latency. Don't
  revert to lazy `if (!audioCtx) audioCtx = new AudioContext()`.
- **Resource links (`#recursos`):** entire padded box is clickable (`display:block` on the `<a>`),
  not just the text — larger mobile tap target.

### Known open requests — not yet implemented

1. Replace "Já, já falaremos dos acordes menores." with "Cada uma delas possui sua própria forma
   para montar acordes menores." (section `#formas`). Still present verbatim as of this session.
2. Fretboard diagrams should never show a casa past 12 — `base = minFret - 1` has no ceiling.
3. **Bug:** Sol menor + Barra shows "não é possível" (`fMajor===0` blocks) but is actually playable
   at casas 11-12 (`fMajor+12` instead of blocking).

### Domain facts (verified — re-derive, don't guess, before touching)

Tuning Sol-Sol-Si-Ré → `OPEN=[7,7,11,2]` (C=0), `OPEN_FREQS=[196.00,196.00,246.94,146.83]`,
`FRET_MAX=12`. Barra/Escadinha/Pirete × maior/menor each have their own derived fret-offset
formula per string in `renderFret()`. User's "corda 1-4" naming is reversed vs. the code array.

### Style

PT-PT, informal "tu". Some UI prompts ("Selecione…") were typed verbatim by the user in formal
register — leave as-is, don't fix to "tu".

## Bandolim (`bandolim.html`) — sections 01-02 of 6 built, "em construção" banner above them

Shares `styles.css`, `audio-engine.js`, and now `quick-nav.js` with the other pages — changes to
any shared file affect all 4 pages, check the others still render correctly after touching them.

### Hard rule from the user — don't reintroduce cavaquinho parallels

`bandolim.html`'s prose must read as **100% independent** of `cavaquinho.html` — explicit
rejection of drafts that compared the two instruments ("diferente do cavaquinho...", etc.). Should
make sense to someone who never opens `cavaquinho.html`. Applies to future sections too.

### Bandolim is a melodic instrument — don't force a chord-shapes structure onto it

Unlike cavaquinho (strummed/rasgueado, `#formas`/`#construtor` built around 3 movable chord
shapes — Barra/Escadinha/Pirete), bandolim is tuned in fifths like a violin and is primarily
**melodic** (palheta, scales, trémulo) — chords are secondary. **When building `#formas` (04), do
not clone the Barra/Escadinha/Pirete pattern.** Direction agreed but **not yet implemented** —
confirm with the user before committing to it:
- **03 (`#acorde`)**: reconsider renaming away from "Acordes" — natural next step for a melodic
  instrument is **building scales** (maior/menor from tons e semitons), not chord formulas.
  Whatever this section becomes, update its `quick-nav.js` `PAGES` label to match (don't leave it
  mismatched — this is the same caution the old doc had about the HTML kicker, but the label now
  lives in `quick-nav.js`, not inline HTML).
- **04 (`#formas`, "Técnica")**: pega da palheta, palhetada alternada, trémulo, posições da mão
  esquerda/escalas. Not chord shapes.
- **05 (`#construtor`, "Prática")**: probably an interactive scale/position visualizer (tónica +
  modo → notes highlighted), not a chord builder.
- **06 (`#recursos`)**: same link-list style as cavaquinho's, bandolim/mandolin-specific resources.

### `#afinacao` (01 · Introdução) — what was built

Same visual format as cavaquinho's section 01 (kicker, `<h2>`, parts-row + text, a "duas notas"
card, then an `<h2>Afinação</h2>` with a `.grid2` of two cards) but content is bandolim-specific:
- Cabeça: 8 tarraxas, in 4 pares (ordens).
- Braço: 17-24 casas (not 12-17 like cavaquinho).
- Corpo: caixa de ressonância.
- "Duas notas" card: strings come in 4 unison-tuned pairs (always play both together); palheta
  only, never fingerstyle.
- Afinação: **Sol - Ré - Lá - Mi (G3-D4-A4-E5)**, perfect fifths, same as a violin — ascending
  low-to-high, **not re-entrant** like cavaquinho's G-G-B-D.

Icon: `./icons/bandolim.png` (a PNG, not hand-drawn SVG like cavaquinho's instrument diagram),
used twice — once in the descriptive parts-row, once inside `#bandolimCard` (draggable
"arrasta para dedilhar" card). `.strings-diagram` (small clickable open-strings diagram) is still
real inline SVG.

**`#bandolimCard` drag-to-strum does NOT call the global `playStrum()`/`playStrumReverse()`** —
those live in `audio-engine.js` with cavaquinho's frequencies hardcoded. Instead a local
`BANDOLIM_OPEN_FREQS = [196.00, 293.66, 440.00, 659.25]` array + the generic freq-agnostic
`playStrumSequence(freqs)` is used, in a small dedicated IIFE (first `<script>` after
`audio-engine.js`).

### `#tons` (02 · Distância — kicker/menu label; `<h2>` still says "Tons e semitons") — copy-pasted verbatim from cavaquinho.html, on request

Pure music theory (piano SVG, chromatic strip/interval trainer, tooltip system), instrument-
independent, so copied as-is including its JS (`NOTE_DATA`, `mod12`, `createButtonGrid`, the
strip/interval-trainer state machine, tooltip delegation) — **the one place in `bandolim.html`
intentionally identical to cavaquinho**, not a "no parallels" rule violation. The two copies are
now independent (no shared code, no automatic sync) — if cavaquinho's `#tons` changes, consider
whether bandolim's needs the same fix.

### Script structure in `bandolim.html` (bottom of `<body>`, in order)

1. `<script src="quick-nav.js"></script>` (new this session)
2. `<script src="audio-engine.js"></script>`
3. IIFE: `#bandolimCard` drag-to-strum.
4. IIFE: everything from `#tons` (click delegation, NOTE_DATA constants, `createButtonGrid`, strip/
   interval trainer, tooltip accessibility system). Natural place to extend for future sections
   03-05 needing the same constants/helpers.

(The old doc listed a 4th "original quick-nav toggle" IIFE here — that per-page inline script was
**deleted this session**, replaced by the shared `quick-nav.js` include at the top. Don't
reintroduce a duplicate inline toggle script.)

### Shared `styles.css` rules specific to bandolim (verify cavaquinho.html still looks right if touched)

- `.instrument-diagram svg, .instrument-diagram img{...}` (extended from SVG-only) so the PNG icon
  sizes the same way the old SVGs did.
- `.instrument-parts-row` is an **alias** of `.cavaquinho-parts-row` (identical rules, both
  selectors listed together everywhere) so bandolim's markup doesn't carry a cavaquinho-named
  class. Update both together if tweaked.
- `#bandolimCard` sits alongside `#cavaquinhoCard` in the `cursor:ew-resize`/`touch-action` rule
  and the `strumHint` entrance-animation rule.

### Not yet done

1. Sections 03-06 — see the melodic-instrument direction above; get explicit sign-off on the 03
   rename before building it.
2. Visual verification of `#afinacao`'s PNG icon aspect ratio inside `.instrument-diagram`
   (`max-width:170px`/`113px`) has historically been unreliable to check in-session (no working
   screenshot tool at the time this was first noted) — confirm it still renders correctly if this
   area is touched again.

## Guitarra (`guitarra.html`) — placeholder, created this session

No real content yet — just the "Página em construção" banner (see the shared section above) and
footer. Has the shared quick-nav toggle/panel/script like cavaquinho and bandolim (no
mobile-only restriction, see the quick-nav section above for why that was removed). `data-page=
"guitarra"`. Instrument icon is `icons/guitar.png` (the only guitar-related asset that exists —
there's no `guitarra.png`). When this page eventually gets real sections, add its
`quick-nav.js` `PAGES` entry's `sections` array and give the header the standard
`.staff`/`.eyebrow`/`.toc-separator` structure matching the other 3 pages (currently present) —
the "em construção" `<h1>` + extra `.toc-separator` should be removed at that point, not left
alongside real content.

## Index / home (`index.html`) — hero only, no dropdown menu

Single `<header class="cover">` with the "Meet Cordas" intro + the instrument-icon row (see the
dedicated Instrument-icons section above for the whole animation/click/sizing system). No
`<section>`s, no quick-nav dropdown (explicitly removed — see quick-nav section above for the
`sessionStorage` cleanup this required). `data-page="index"`.
