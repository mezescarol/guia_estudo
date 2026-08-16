# AGENTS.md — Guia de Estudo (Tuna)

> This folder also holds unrelated tuna (student music group) files — sheet music, recordings
> for "Tanto Mar", etc. This file documents the study-guide pages that live alongside them:
> `cavaquinho.html` (complete, all 6 sections) and `bandolim.html` (in progress, sections 01-02
> of 6 built this session) — pages sharing one external `styles.css` and one `audio-engine.js`,
> each with its own inline `<script>` for page-specific logic (vanilla JS, PT-PT), teaching
> instrument tuning, tons/semitons, and instrument-specific technique, with live Web Audio
> playback and SVG/PNG diagrams. **This folder is a plain directory, not a git repo.**
> Edits in this session were made **directly to the files in this directory** on explicit user
> request — no scratchpad/Artifact-publishing round-trip was used for `bandolim.html` (unlike
> the workflow documented just below for `cavaquinho.html`, which is from an earlier session —
> verify it's still how the user wants `cavaquinho.html` handled before assuming it applies,
> since `bandolim.html` work this session did NOT follow it).

## Cavaquinho (`cavaquinho.html`) — complete, all 6 sections

### File layout — three copies, keep them in sync

| File | Role |
|---|---|
| `<scratchpad>/cavaquinho.html` | **Source of truth.** A fragment — `<title>`+`<style>`+body content, no `<!DOCTYPE>/<html>/<head>/<body>`. Required shape for the Artifact tool, which wraps it automatically. |
| `<scratchpad>/cavaquinho-standalone.html` | Generated from the fragment by wrapping it in a real document (`<!DOCTYPE>`, `<html lang="pt-PT">`, `<meta charset="UTF-8">`, `<meta name="viewport"...>`). Needed because a bare fragment opened directly in a browser has no charset/viewport and renders tiny/garbled. |
| `cavaquinho.html` (this dir, `Tuna/`) | A copy of the standalone version, kept here at the user's request. This is the project's real home — moved out of the unrelated `pi/` ssh-tool repo on request. |

**After every edit, in this order:** edit the fragment → regenerate standalone → copy into this dir → republish the Artifact (same `file_path`, no `url` needed if this session owns it) → send the standalone file to the user. Skipping regeneration is the most common way to ship a broken file (user opens it raw, gets an unstyled/undersized page).

**Cold start (new session, scratchpad is empty):** the scratchpad path above is session-specific and won't exist yet. Treat `cavaquinho.html` in this dir (`Tuna/`) as the fallback source of truth — it's a complete standalone document. To recreate the fragment for Artifact publishing, strip everything from the top through `</head>` and strip the trailing `</body></html>`, leaving `<title>...</title><style>...</style><div class="page">...</div><script>...</script>`.

Regen script (split at `</style>`, wrap, copy):
```bash
SRC=".../scratchpad/cavaquinho.html"; OUT=".../scratchpad/cavaquinho-standalone.html"
awk 'BEGIN{d=0}{if(!d){print;if($0~/<\/style>/)d=1}}' "$SRC" > /tmp/head.txt
awk 'BEGIN{d=0}{if(!d){if($0~/<\/style>/)d=1;next}print}' "$SRC" > /tmp/body.txt
{ echo '<!DOCTYPE html>'; echo '<html lang="pt-PT">'; echo '<head>';
  echo '<meta charset="UTF-8">'; echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  cat /tmp/head.txt; echo '</head>'; echo '<body>'; cat /tmp/body.txt; echo '</body>'; echo '</html>'; } > "$OUT"
cp "$OUT" "Tuna/cavaquinho.html"
```

### Testing

- Serve the scratchpad dir (`python -m http.server`), open via the Browser tool, verify with `javascript_exec` (`getBoundingClientRect`, `getComputedStyle`, SVG `getBBox`). **Not screenshots** — they don't composite in this environment.
- **Environment bug, confirmed repeatedly:** in this Browser pane, `getComputedStyle()` on an element that changed state via a *click/attribute mutation* (background-color, `transform`) can return the stale pre-change value even after a delay — while `classList`, `hidden`, `matches()`, and geometry (`getBoundingClientRect`, `getBBox`) update correctly. Reproduced even on long-working code (`.mag-btn.active`), so it's the pane, not a regression. To verify a CSS rule is genuinely correct, apply the same class/attribute to a **freshly created, freshly appended element** and read its computed style — that reads correctly. Prefer position/geometry assertions over paint-property assertions when testing here.
- `document.documentElement.scrollWidth === clientWidth` at 375px (mobile) and ≥1280px (desktop, **not** the `desktop` resize preset — it has returned narrow/inconsistent widths in this session; pass explicit `width/height`) is the standard no-overflow check used throughout.

### Conventions established through iteration — don't casually undo

- **Font sizing:** everything in `<style>` is `rem`, root is `html{font-size:16px}` with `@media(max-width:620px){html{font-size:19.2px}}` (mobile +20%). Don't use CSS `zoom` — tried it, it doesn't reflow media queries/viewport correctly and causes overflow. `.eyebrow` is deliberately fixed `px` (immune to root scaling, on purpose). `.chord-name` still scales with the root like everything else, it's just a deliberately smaller base value (`1.15rem`, down from `1.6rem`) after user feedback it was too big — don't bump it back up.
- **Text alignment:** paragraphs and `h1/h2/h3` are left-aligned at all widths (the mobile media query used to force-center headings; that override was removed on request). `.fret-caption` still centers at **all** widths (unrelated exception). Cover `h1`/`.eyebrow` always centered (separate, explicit exception, untouched by the above).
- **Typography (Combo C, global — applies at all widths, not just desktop):** `body` = `'Gill Sans Nova', 'Gill Sans', Corbel, 'Trebuchet MS', ui-sans-serif, sans-serif`. `h1/h2/h3` and `.chord-name` = `'Hoefler Text', 'Iowan Old Style', Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif`. `.card, .technique` = `Optima, Candara, 'Segoe UI', sans-serif` — deliberately **inherited** (selector is `.card, .technique`, *not* `.card *, .technique *`) so the existing mono "badge" accents inside cards (`.note-btn`, `.readout`, `.formula-steps .deg`, `.formula-example .notes`, `.root-btn`, `.pill.example`, `.technique h4`) keep winning via their own more-specific/explicit rules, regardless of source order — don't reintroduce the `*` form, it forces mono back onto everything including `.chord-name` (see next point). `.tooltip::after` (the popup bubble, not the inline trigger term) and `footer` = `Palatino`/`'Book Antiqua'`/Georgia serif, italic. All system fonts, no `@font-face`/network loads — user explicitly wants zero added page weight. This was rolled out to desktop first with a mobile-only restoration layer in `@media (max-width:620px)`, then that restoration block was deleted on request so the font is a single global definition, identical on every viewport — don't reintroduce a per-breakpoint font override unless asked.
- **Cascade bug, now fixed everywhere:** the old blanket `.card *` rule (equal specificity to `.chord-name`, declared later in source) used to silently force `.chord-name` to monospace despite its own serif rule. Fixed by the `.card, .technique` inheritance-based rule above — applies at all widths now.
- **Tooltip trigger styling:** `.tooltip` has **no `font-weight`** and a **solid** (not dotted) `border-bottom` — the underline alone marks a tooltip. `font-weight:700` on the base class used to fake-bold every tooltip span (making them read as a different, lighter/thicker color even though the actual `color` was always inherited correctly from the surrounding paragraph) — removed on request. Words that are *genuinely* meant to be bold and happen to be tooltips (`<strong class="tooltip">`, e.g. "Semitom", "1 tom") stay bold via the `<strong>` tag itself, not via `.tooltip` — don't re-add `font-weight` to the class.
- **Tooltips** (`.tooltip`, `.piano-tooltip`): opened via **one delegated `document` click listener** (`e.target.closest(...)`), not per-element listeners — required so the runtime-generated fret-caption tooltip works without re-init. Anchored left (`left:0`), never centered; `--tip-shift` custom property is computed on hover/focus/click-open to clamp the bubble inside the viewport with a **12px safety margin from screen edges**. The `positionTooltip()` function checks if the tooltip would overflow right and shifts it left; if that would overflow left, it shifts right instead. This ensures the full tooltip bubble stays visible on mobile even when triggered from words at screen extremes (left/right edges). Mutually exclusive; Escape/outside-click closes all.
- **Interval trainer control layout, rewritten from scratch:** DOM order is now `Semitom, Tom, −, +, Limpar` (was `−, ·, Semitom, Tom, ·, [+, Reiniciar stacked]`) — the old `.step-sep` dot spans and `.plus-reset-stack` wrapper are gone entirely, don't reintroduce them. `.mag-btn`/`.dir-btn` share one rule (`.interval-controls .mag-btn, .interval-controls .dir-btn`) with explicit `min-width:5.5rem; height:2.375rem` so all four are pixel-identical regardless of label length ("Semitom" vs "−") — verified 88×38px each at desktop, 106×46px each at mobile. `.dir-btn[data-dir="down"]` gets `margin-left:18px` **only inside `@media(min-width:621px)`** (on top of the base 8px flex gap = 26px total) so Tom and `−` read as two separate click zones once they're adjacent in the new order; this margin must stay desktop-scoped because mobile's grid places `−` in a different cell where the margin would just misalign it.
- **The reset button is text now, not a pill:** renamed **Reiniciar → Limpar**, and it's a bare `<button class="reset-interval-btn">` — `background:none; border:none; color:var(--ink-soft)`, underlines on hover/focus, no pill/border look. It's still a real `<button>` (same click handler, same behavior) so semantics/keyboard access are unchanged, only the paint changed. **Right-aligned on both breakpoints, by different mechanisms** — desktop: `margin-left:auto` pushes it to the flex container's far right edge (verified flush with the card's right edge, same x as the note-grid's own right edge). Mobile: `justify-self:end` in its own grid row (`margin-left:0` overrides the desktop auto so it doesn't fight the grid). Don't let these two rules merge; they use different layout systems.
- **Disabled dir-btn no longer changes the cursor** — `cursor:not-allowed` was removed from `.interval-controls .dir-btn:disabled` on request ("o feedback do botão já deve ser suficiente"); cursor stays `pointer` (inherited from the base rule) even when disabled. Only the gray fill + `opacity:.6` communicate the blocked state now.
- **Environment gotcha hit again while verifying the disabled-button gray fill:** `getComputedStyle()` on the *live* toggled button kept reporting the old `--paper-raised` background even seconds after `disabled` flipped true. Per the pane bug already documented below, applying `.dir-btn` + `disabled` to a **freshly created, freshly appended** button showed the correct `--line` gray immediately — confirms it's the pane's stale-computed-style bug, not a real CSS bug. Don't chase this pattern again; go straight to the fresh-element check.
- **Semitom/Tom no longer trigger a step by themselves** — clicking a magnitude button used to call the same `applyStep()` as the direction buttons, so if a direction was already active, changing magnitude would silently re-apply an extra step (a "phantom" up/down triggered by what's supposed to be a size-only control). Fixed by splitting `applyStep()` (still the only thing that moves `stepCount` and plays a note — called only from the `.dir-btn` click handler) from a new `magButtonGuidance()` (called only from the `.mag-btn` click handler) that *only* updates the readout for the two incomplete states ("Selecione primeiro uma nota" / "Escolha o sentido que vamos percorrer") and never touches `stepCount`. Verified: pick Fá, Semitom, `+` → "Fá#"; then click Tom alone → message unchanged (no phantom step); click `+` again → correctly jumps using the *new* Tom magnitude ("Sol#", 1.5 tons total). If you touch this flow again, keep that separation — anything bound to `.mag-btn` must never be able to move `stepCount`.
- **Interval trainer +/- buttons natively `disabled` at the strip's ends, not just visually blocked:** `updateDirButtons()` sets `dirUpBtn.disabled`/`dirDownBtn.disabled` based on `(current + stepCount) ± (stepMagnitude || 1)` vs `[0, STRIP_MAX]` — falls back to magnitude 1 (semitom, the most permissive test) when no magnitude is chosen yet, so a button is never disabled prematurely; re-evaluates live as the magnitude toggle changes (verified: at Lá#, `+` is enabled with Semitom but disables the instant you switch to Tom, and re-enables switching back). Called after every state change that could affect it: `setCurrent`, end of `applyStep`, the mag-btn handler, and reset. Native `disabled` (not just a CSS class) means the browser itself blocks the click/keyboard activation — don't reintroduce a "blocked" click path guarded only by styling. Styled via `.interval-controls .dir-btn:disabled` (gray `--line` bg/border, `--ink-soft` text, `cursor:not-allowed`, `opacity:.6`).
- **The "Chegaste ao topo/início da escala" readout message was removed** (used to append to the interval-trainer message when a step was blocked) — now redundant since the button that would have caused it is disabled before the click can happen. The `blocked` boolean in `applyStep()` still exists and still guards `stepCount` from changing, kept as a defensive no-op safety net; just don't re-add user-facing text to that branch, the disabled button *is* the feedback now.
- **Interval trainer ("Tons e semitons"):** buttons are `+`/`−` flanking `Semitom`/`Tom`. `+`/`−` always **flash** (momentary `.active`, 220ms). `Semitom`/`Tom` are a **persistent** toggle once a note is picked, but **flash** like `+`/`−` before a note is picked (dual-mode is intentional). Steps are **cumulative** (each click adds, clamped to strip ends) — a non-cumulative "single step" mode and a "second message showing the reversal pivot" were both built and explicitly reverted; don't reintroduce either. Guidance strings when incomplete: "Selecione primeiro uma nota" / "Escolha entre semitom e tom também" / "Escolha o sentido que vamos percorrer: + ou -".
- **Chord builder (`#construtor`, "Construindo acordes no cavaquinho"):** starts with **no pre-selection** (root/quality/forma all `null`); shows what's still missing until all three are picked, only then renders + auto-plays sound (no "listen" button — sound is automatic on every subsequent change via `playChordDots`). Mobile: Nota/Qualidade/Forma stack vertically, each group's wrapper is **shrink-wrapped to content** (not stretched) so the label's left edge naturally lines up with its button row's first button — don't replace with manual width math. "Visualizar acorde no piano" is a **switch** (`role="switch"`, sliding knob), not a hover tooltip: cream/left = off, soft green/right = on; left-aligned on desktop, right-aligned on mobile. In the main chord diagram (`buildSvg`, driven by `#construtor`), markers are **pills** (`rx=10` rounded rect), not circles, and barred groups use a widened rect (`±16px`, not `±9px`) so labels like "Sol#" don't clip. **This does not apply** to the separate Barra/Escadinha/Pirete technique-card previews (`buildShapeSvg`) — those still use plain circles (`r=6`) and the old narrower bar offset; only `buildSvg` was changed.
- **Spacing is fluid, not stepped:** structural spacing uses `clamp(min, vw, max)` so it scales continuously with the real viewport instead of jumping at a breakpoint — `.page` padding `clamp(20px,5vw,48px)` sides / `clamp(80px,10vw,100px)` bottom, `section` padding `clamp(46px,6vw,62px)`, `.card` padding `clamp(22px,3.2vw,28px) clamp(24px,3.6vw,30px)`, `.cover` padding `clamp(56px,7vw,72px)` top. Every `min` equals the old fixed value, so mobile never regressed — if you add a spacing rule, follow the same pattern rather than adding a new media-query step. Verified no horizontal overflow at 320/375/600/834/1280.
- **Heading line-height is `1.25` on `h1,h2,h3`** (was inheriting body's `1.6`). Multi-line headings — "As 3 formas de tocar cada acorde", "Construindo acordes no cavaquinho", the cover's "Meet Cavaquinho" — read as one block instead of two loose lines. Don't remove it; the body's 1.6 is for running prose only.
- **Stacked-box gaps on mobile were deliberately widened:** `.technique-grid` gap 20px under 700px (from 14px) and `.grid2` gap 20px under 620px (from 18px) — the coloured technique boxes and the paired cards were touching too closely once stacked.
- **Note-button grids: fixed 40px size everywhere, no growing, wrapped rows centered.** `.note-btn` (`.strip`) and `.root-btn` inside `.root-grid-row` (`#montarRootGrid`) both use `flex: 0 0 40px; min-width:40px; padding:8px 4px; font-size:0.8125rem;` — **grow is `0`, not `1`.** Their containers (`.strip`, `.root-grid-row`, and the mobile-only flex mode of `.root-grid`) all have `justify-content:center`. This was a deliberate change from an earlier version that used `flex:1 0 40px` (grow enabled): growing made box width depend on how many items shared a row, so a half-empty last row got *wider* boxes than a full row — explicitly banned ("as boxes de cada nota deverá ter, obrigatoriamente, o mesmo tamanho de todas as outras"). **Never reintroduce flex-grow on these buttons** — if a future request wants them to visually fill more of the card on wide screens, scale the fixed basis itself (e.g. `clamp(40px, Xvw, Ypx)`), never `flex-grow`, or unequal-row-width regresses. Verified: every row of every one of the three grids centers on the container's own centerline, including a lone last item (e.g. 1 leftover note alone on strip's 3rd mobile row).
- **`.root-grid-row`/`#montarRootGrid` (`#acorde`, "Construtor de acordes" / "Seleciona o acorde que queres montar.") now mirrors `#rootGrid`'s desktop grid technique** — `@media (min-width:621px){ .root-grid-row{ display:grid; grid-template-columns:repeat(12,1fr); gap:3px; } }`. This makes it fill the card edge-to-edge on desktop instead of staying at the fixed 40px/centered mobile size, so it matches `#rootGrid` pixel-for-pixel (both verified at 47px boxes, same left edge 331/right edge 934 at 1280px, same 40px/1-row at the 621px floor). **Why not just re-enable `flex-grow` here** (simpler-looking fix): grow was explicitly banned elsewhere in this file because it makes box width depend on sibling count, breaking equal-size-across-wrapped-rows — mobile *does* wrap this grid to 2 rows, and the grow ban must stay in effect there. So the fix is scoped: mobile keeps the unscoped fixed-40px-centered flex rule untouched; only `@media (min-width:621px)`, where this grid is provably always 1 row (12 items, and there's always enough desktop width), gets the grid-fill treatment. Don't merge these into one rule.
- **`.root-grid`/`#rootGrid` (the `#construtor` builder's Nota column) has two totally different layout systems depending on breakpoint** — desktop (`@media min-width:621px`) uses the 12-column CSS Grid described below (never wraps, 12 items = 12 columns exactly, so the "centered wrapping" rule above doesn't apply there by construction). Mobile (`@media max-width:620px`) overrides `.root-grid` to `display:flex; flex-wrap:wrap; justify-content:center;` — the same fixed-size-centered system as the other two grids (`.builder-controls .root-btn` mobile rule also got `flex:0 0 40px; min-width:40px;` added for this). Don't let these two rules bleed into each other.
- **The chromatic strip is 12 boxes now, not 13** — it used to repeat the first note at the end (Dó...Si,Dó) to show the octave closing; that trailing Dó was removed on request, along with the interval trainer's upper bound (`STRIP_MAX = STRIP_NOTES.length - 1`, so it now naturally caps at Si/index 11 — verified "Chegaste ao topo da escala" fires from Si with no way further up). `STRIP_NOTES`, `STRIP_FREQS`, `STRIP_SHARP` must stay the same length as each other — if the strip's content ever changes again, trim/extend all three together, `STRIP_MAX` will follow automatically, no other code references a literal 13 or 12.
- **All three 12-note grids (`.strip`, `.root-grid-row`/`#montarRootGrid`, `.root-grid`/`#rootGrid`) now share one desktop rule and one mobile rule** — desktop (`@media min-width:621px`) is `display:grid; grid-template-columns:repeat(12,1fr); gap:3px;` (verbatim on `.strip` and `.root-grid-row`; `#rootGrid` does the same thing but via the `display:contents`-into-`.builder-controls` indirection described above, for the Qualidade/Forma alignment). Verified pixel match desktop: all three at 47px/box at 1280px, 40px/1-row at the 621px floor. Mobile (unscoped base rules) is `display:flex; flex-wrap:wrap; justify-content:center;` with `flex:0 0 40px` buttons — wraps to `strip`=6+6, `montarRootGrid`/`rootGrid`=6+6 (12 divides evenly by 6, so no more lonely-leftover-note row like the old 13-box strip's 6+6+1). **When adding a fourth note-grid anywhere on the page, apply this exact same pair of rules** rather than inventing a new layout — that's the established pattern now.
- **`#construtor` builder layout is a 12-column CSS Grid on desktop (`@media min-width:621px`), plain flex-column stack on mobile (unchanged):** the HTML wrapper divs got `.builder-nota`/`.builder-qualidade`/`.builder-forma` classes. On desktop these (and `.root-grid`, and the two `.quality-toggle`s inside them) get `display:contents`, so their children — the 12 note buttons, the 2 quality buttons, the 3 forma buttons — become direct items of one `repeat(12,1fr)` grid on `.builder-controls`. Placement: notes = row 2, one column each (auto-placed, untouched `grid-column`); Qualidade label+buttons = row 3/4, columns 1-7 (2 buttons × 3 cols each); Forma label+buttons = row 3/4, columns 7-13 (3 buttons × 2 cols each). This is why every Qualidade/Forma button edge lands exactly on a note-column boundary (verified: the note6/note7 seam sits at the same x as the Qualidade/Forma seam). **Don't add `grid-column` to the note buttons** — the 12-vs-12 count match is what makes auto-placement land them 1-per-column; if the note count ever changes this breaks silently. This grid only has 12 slots to divide (unlike the 13-box chromatic strip — see below), so unlike that one, it fits on one line all the way down to the 621px mobile boundary with zero wrapping, because `1fr` columns shrink to exactly fit rather than refusing below a flex min-width floor.
- **`.result-grid`'s two columns are `:has()`-driven, not JS-driven:** when `#degreeList` is empty (nothing selected yet, the "Escolhe a nota, a qualidade e a forma..." placeholder state), `.result-grid:has(#degreeList:empty) .chord-result-info{ grid-column:1/-1 }` and `...chord-result-diagram{ display:none }` make the message span the full card width instead of wrapping inside the narrow left column, and hide the empty right column entirely. The moment JS populates `#degreeList` (a chord is fully selected), both rules stop matching automatically and the normal 2-column layout returns — no class toggling needed in JS, don't add any.
- **Mobile builder labels ("Nota"/"Qualidade"/"Forma") are LEFT-aligned, not right** — this was briefly right-aligned (`align-items:flex-end` + `text-align:right` on `.builder-controls .readout`) then explicitly reverted on request. `.builder-controls` mobile is now `align-items:stretch` (each stacked group spans the card's full content width) with no `.readout` text-align override, so the default left/`start` alignment applies and everything — labels, the (now-centered) note grid's *container*, and Qualidade/Forma's button rows — anchors to the same left edge as the card's own padding. Don't reintroduce the right-aligned version; it was a deliberate, confirmed reversal, not a bug.
- **"Barra" touching the card's left edge with no margin was a real bug**, caused by the old right-aligned mobile layout — fixed as a side effect of the left-align reversion above. Verified: every left edge (Nota/Qualidade/Forma labels, "Barra") now sits at the same x as the card's own content edge (~1px of the card's padding, matching everything else on the page).
- **Qualidade/Forma seam has a deliberate 14px `margin-right` on "Acorde menor"** (`.builder-qualidade .quality-toggle button:nth-child(2)`) so it doesn't touch "Barra" — this breaks pixel-alignment at that one seam on purpose (the note6/note7 boundary no longer lines up with the Qualidade/Forma boundary); every other edge (outer left/right, the internal Maior/Menor and Barra/Escadinha/Pirete seams) is still exactly on-grid. Don't try to "fix" this by re-aligning it to the grid — the gap was requested specifically because the two groups read as glued together without it.
- Qualidade buttons say **"Acorde maior"/"Acorde menor"**, not "Maior"/"Menor" — matches the wording already used in the `#acorde` section's major/minor toggle. Verified this fits without clipping even at the narrowest desktop width (621px, ~125px button).
- **Do not confuse `#rootGrid` (this builder's Nota column) with `.strip`/`#strip` (chromatic strip, "Tons e semitons") or `.root-grid-row`/`#montarRootGrid` (piano root selector, "Construtor de acordes" `#acorde`)** — three visually similar but structurally different note-button grids. All three now render at matching box size/padding/font, but `#rootGrid` uses CSS Grid (desktop) for exact sub-alignment with Qualidade/Forma, while the other two use flex-wrap (see the note-button-grid entry above this one).
- **"Afinação" note-name groups don't break mid-phrase:** in the tuning paragraph, `<strong>Sol - Sol - Si - Ré</strong>` and `<span>(G - G - B - D).</span>` both carry inline `white-space:nowrap`, so each stays a single unbroken run — if it doesn't fit at the end of a line, the *whole* group wraps to the next line together rather than splitting between notes. Verified with `getClientRects().length === 1` on both down to 320px, no overflow. If more note-name groups get added to this paragraph later, apply the same `white-space:nowrap` pattern rather than leaving them to wrap freely.
- **Section order:** "O cavaquinho" (anatomy) comes **before** "Afinação" (tuning) — swapped from the original draft on request.
- **All em dashes (`—`) were replaced with hyphens (`-`)** site-wide, including in JS-generated strings — keep new prose consistent with that.
- **`#cavaquinhoCard` (the draggable instrument diagram, "toca para dedilhar") only plays on an actual drag now** — the `pointerup` handler used to fall back to `playStrum()` when `Math.abs(deltaX) < 30` (i.e. a plain tap/click with no real movement); that fallback was removed on request (`return;` with no call), so a tap that doesn't move at least 30px does nothing. Movement past the threshold still plays forward (`deltaX > 0`) or reverse (`deltaX < 0`) exactly as before. Don't reintroduce a click-to-play path here — drag-only was the explicit ask.
- **Audio unlock (first-click latency fix):** `audioCtx` is created **eagerly at script load** (`var audioCtx = new (window.AudioContext||window.webkitAudioContext)();`), not lazily inside `getAudioCtx()` on first use like before — the heavy hardware/driver init this triggers happens while the page is just sitting there, not at the moment the user taps a string. A separate `unlockAudio()` is bound with `{capture:true, once:true, passive:true}` to `pointerdown`/`touchstart`/`mousedown`/`keydown` on `document`, so the *earliest* interaction anywhere on the page (not necessarily the string/key itself) kicks off `resume()` a beat sooner via the capture phase (fires before the target element's own bubble-phase click handler). **Audio context priming:** on the first `unlockAudio()` call, a near-silent zero-gain oscillator blip plays for 1ms to warm up the audio hardware — this dramatically reduces latency on subsequent clicks/taps on iOS Safari and some Android browsers. The blip is inaudible (0 volume) and happens only once. This was reported as a real, noticeable delay on mobile specifically — don't revert to lazy `if (!audioCtx) audioCtx = new AudioContext()` inside `getAudioCtx()`, that's the exact pattern that caused it. Don't remove the oscillator priming from `unlockAudio()` unless the user confirms latency is no longer an issue.
- **Resource links (section 06, "Conteúdo extra"):** the `.resource-links` list items have links styled with `display:block; padding:12px; text-decoration:none; border-radius:4px` so the entire padded box is clickable/tappable, not just the text. Hover/focus adds a background color change (`var(--line)`) and underline. This makes the hit target much larger on mobile and improves UX for tap interactions.

### Known open requests — not yet implemented

1. Replace "Já, já falaremos dos acordes menores." with "Cada uma delas possui sua própria forma para montar acordes menores." (section `#formas`).
2. Fretboard diagrams should never show a casa past 12 — currently `base = minFret - 1` has no ceiling, so high chords can render casas 13/14 instead of truncating at the neck end.
3. **Bug:** Sol menor + Barra shows "não é possível" (`fMajor===0` blocks). It's actually playable at casas 11–12: when `fMajor===0`, use `fMajor+12` instead of blocking (`dots2` becomes `[12,12,11,12]`).

### Domain facts (verified — re-derive, don't guess, before touching)

Tuning Sol-Sol-Si-Ré → `OPEN=[7,7,11,2]` (C=0), `OPEN_FREQS=[196.00,196.00,246.94,146.83]`, `FRET_MAX=12`. Barra/Escadinha/Pirete × maior/menor each have their own derived fret-offset formula per string in `renderFret()`. User's "corda 1–4" naming is reversed vs. the code array.

### Style

PT-PT, informal "tu". Some UI prompts ("Selecione…") were typed verbatim by the user in formal register — leave as-is, don't fix to "tu".

## Bandolim (`bandolim.html`) — in progress, sections 01-02 of 6 built

Single file, edited directly in this directory (no scratchpad copy, no Artifact publish step
this session). Shares `styles.css` and `audio-engine.js` with `cavaquinho.html` — changes to
either shared file affect both pages, so check `cavaquinho.html` still renders correctly after
touching them. The nav skeleton (header, quick-nav panel with all 6 anchors) already existed
before this session; sections `#afinacao` (01) and `#tons` (02) were built and are functional;
`#acorde` (03), `#formas` (04), `#construtor` (05), `#recursos` (06) are still just anchors with
no `<section>` behind them yet.

### Hard rule from the user — don't reintroduce cavaquinho parallels

`bandolim.html`'s prose must read as **100% independent** of `cavaquinho.html` — the user
explicitly rejected drafts that compared the two instruments ("diferente do cavaquinho...",
etc.). The page should make sense to someone who never opens `cavaquinho.html`. This applies to
future sections too, not just the ones already built.

### Bandolim is a melodic instrument — don't force a chord-shapes structure onto it

Also explicit from the user: unlike the cavaquinho (which is strummed/rasgueado and built its
whole `#formas`/`#construtor` pair around 3 movable chord shapes - Barra/Escadinha/Pirete), the
bandolim is tuned in fifths like a violin and is primarily a **melodic** instrument (palheta,
scales, trémulo) - chords are secondary, not the throughline. **When building `#formas` (04),
do not clone the Barra/Escadinha/Pirete pattern or center it on chords.** The direction agreed
in conversation (not yet implemented, confirm with the user before committing to it):
- **03 (`#acorde`)**: reconsider renaming away from "Acordes" - the natural next step after
  tons/semitons for a melodic instrument is **building scales** (maior/menor from tons e
  semitons), not chord formulas. The quick-nav label still says "03 · Acordes" - update it
  together with whatever this section actually becomes, don't leave a mismatched label.
- **04 (`#formas`, "Técnica")**: pega da palheta, palhetada alternada, trémulo (the
  instrument's signature sustain technique - same physical reasoning as the cavaquinho's fast
  ADSR decay, notes die fast so tremolo re-triggers them), posições da mão esquerda/escalas.
  Not chord shapes.
- **05 (`#construtor`, "Prática")**: probably an interactive scale/position visualizer on the
  fretboard (tónica + modo → notes highlighted), not a chord builder.
- **06 (`#recursos`)**: same link-list style as cavaquinho's, bandolim/mandolin-specific
  resources (trémulo, escalas, choro repertoire).

### `#afinacao` (01 · Introdução) - what was built

Same visual format as cavaquinho's section 01 (kicker, `<h2>`, parts-row + text, a "duas notas"
card, then an `<h2>Afinação</h2>` with a `.grid2` of two cards) but content is bandolim-specific,
not copy-pasted text:
- Cabeça: 8 tarraxas, in 4 pares (ordens).
- Braço: 17-24 casas (not 12-17 like cavaquinho).
- Corpo: caixa de ressonância.
- "Duas notas" card: strings come in 4 unison-tuned pairs (always play both together); played
  with palheta only, never fingerstyle.
- Afinação: **Sol - Ré - Lá - Mi (G3-D4-A4-E5)**, perfect fifths, same as a violin - ascending
  low-to-high, **not re-entrant** like the cavaquinho's G-G-B-D (worth remembering if a future
  section needs per-string fret math: no special-casing needed here, string N+1 is always a
  clean 5th above string N).

**Icon swap (this session's specific ask):** the user asked to use `./icons/bandolim.png`
instead of a hand-drawn instrument SVG (cavaquinho.html draws its instrument by hand in inline
SVG `<path>`s - nobody attempted that for the bandolim, the PNG was used instead). The PNG is
used **twice**, both times inside `.instrument-diagram` wrappers: once in the descriptive
parts-row, once inside `#bandolimCard` (the draggable "arrasta para dedilhar" card). The
separate `.strings-diagram` (the small 4-line clickable open-strings diagram) is still a real
inline SVG, not a PNG - only the full-instrument illustration was swapped for the icon.

**`#bandolimCard` drag-to-strum - do NOT call the global `playStrum()`/`playStrumReverse()`
here.** Those two functions live in the shared `audio-engine.js` and have the cavaquinho's open
frequencies hardcoded (`[196.00, 196.00, 246.94, 146.83]`) - calling them from bandolim.html
would play the wrong instrument's notes. Instead there's a small dedicated IIFE (first
`<script>` block after `audio-engine.js` in `bandolim.html`) with a local
`BANDOLIM_OPEN_FREQS = [196.00, 293.66, 440.00, 659.25]` array, using the generic
`playStrumSequence(freqs)` (also shared, but freq-agnostic) instead. If a future section needs
to play the bandolim's open strings again, reuse `BANDOLIM_OPEN_FREQS` or extract it to a wider
scope rather than re-deriving the numbers.

### `#tons` (02 · Tons e semitons) - copy-pasted verbatim from cavaquinho.html, on request

This section (piano SVG, chromatic strip/interval trainer, tooltip system) is pure music theory
with no instrument-specific content, so it was copied as-is from `cavaquinho.html`'s `#tons`
section and its supporting JS (`NOTE_DATA`/`NOTES`/`FREQS`/`SHARP`, `mod12`, `createButtonGrid`,
the whole strip/interval-trainer state machine, the tooltip delegation logic) - **this is the
one place in `bandolim.html` that's intentionally identical to cavaquinho, because the theory
itself is instrument-independent, not because of the "no parallels" rule being broken.** If
`cavaquinho.html`'s `#tons` section or its JS changes later, consider whether the same fix
applies here too (they're now two independent copies, not shared code - no automatic sync).

### Script structure in `bandolim.html` (bottom of `<body>`, in order)

1. `<script src="audio-engine.js"></script>`
2. IIFE: `#bandolimCard` drag-to-strum (self-contained, only needs `#bandolimCard` in the DOM).
3. IIFE: everything from `#tons` (global `.string-key`/`.piano-key` click delegation, the
   NOTE_DATA constants, `createButtonGrid`, the chromatic strip/interval trainer, the tooltip
   accessibility system). **This is the natural place to extend when building sections 03-05** -
   any future scale-builder or fretboard visualizer will likely need the same constants/helpers
   already declared here rather than a fourth overlapping IIFE.
4. IIFE: the original quick-nav toggle (pre-existing before this session, untouched).

### Shared `styles.css` changes made this session (verify cavaquinho.html still looks right)

- `.instrument-diagram svg{...}` was SVG-only; extended to `.instrument-diagram svg,
  .instrument-diagram img{...}` so the PNG icon sizes the same way the old SVGs did.
- Added `.instrument-parts-row` as an **alias** of `.cavaquinho-parts-row` (identical rules,
  both selectors listed together everywhere that class appears) so `bandolim.html`'s markup
  doesn't carry a cavaquinho-named class. If the parts-row layout is tweaked later, update both
  selectors together or they'll drift.
- Added `#bandolimCard` alongside `#cavaquinhoCard` in the `cursor:ew-resize`/`touch-action`
  rule and the `strumHint` entrance-animation rule, so the draggable card gets the same
  affordance/animation cavaquinho's does.

### Not yet done / open for the next agent

1. Sections 03-06 (`#acorde`, `#formas`, `#construtor`, `#recursos`) - see the melodic-instrument
   direction above; get explicit user sign-off on the 03 rename before building it.
2. Quick-nav submenu labels still read "03 · Acordes" / "04 · Técnica" verbatim from the
   cavaquinho-derived skeleton - revisit once 03's actual content/name is decided.
3. **Visual verification of `#afinacao` has NOT happened.** The Browser tool in this session
   could only render `bandolim.html` as a static snapshot (file is outside the tool's project
   folder) and couldn't screenshot or run `javascript_exec` against it - so the PNG icon's actual
   rendered size/aspect ratio inside `.instrument-diagram` (`max-width:170px`/`113px`) and the
   drag-to-strum interaction have only been verified by reading code, not by seeing them render.
   Confirm in a real browser before considering section 01 finished.
4. `icons/bandolim.png`'s intrinsic dimensions/aspect ratio were never inspected - if it renders
   oddly cropped or stretched at the diagram sizes, that's the first thing to check.
