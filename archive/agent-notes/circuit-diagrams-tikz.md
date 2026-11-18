# Circuit diagrams: TikZ/circuitikz trial

This is an alternative to the schemdraw approach in
[circuit-diagrams.md](circuit-diagrams.md), being trialed for
`potentiometer-multimeter_schem`, `led-resistor-esp32_schem`, and
`esp32-multimeter_schem` (see `examples/potentiometer_multimeter_tikz/`,
`examples/led_resistor_esp32_tikz/`, and `examples/esp32_multimeter_tikz/`).
Not yet the repo's chosen approach — check with the maintainer, and check
which diagrams in `archive/figures/diagrams/` are actually `.tex`-sourced
before assuming this replaced schemdraw everywhere.

Three worked, fully-debugged examples:
- `examples/potentiometer_multimeter_tikz/potentiometer_multimeter.tex` —
  a two-terminal meter badge wired to a potentiometer's wiper.
- `examples/led_resistor_esp32_tikz/led_resistor_esp32.tex` — a
  hand-drawn IC box (two named pin stubs) wired to an LED + resistor
  chain via circuitikz's `led` bipole (not `LED` or `leD` — case and
  exact spelling matter, see gotcha #1).
- `examples/esp32_multimeter_tikz/esp32_multimeter.tex` — the same
  hand-drawn IC box wired straight to a meter badge (no component between
  the pins), combining both of the above patterns; came out right on the
  first full pass except for the margin issue in gotcha #13, found and
  fixed here before it ever reached the other two diagrams' shipped files.

Each has its own `build.sh`. Copy whichever is the closer starting point
for a new diagram — an IC-box one for anything hanging off a
microcontroller pin, the meter-badge one for anything with a multimeter.

## Setup

Uses [circuitikz](https://ctan.org/pkg/circuitikz) (a TikZ library with
proper circuit-symbol bipoles — resistor, potentiometer, meters, etc. —
and the connecting-wire geometry), inside a `standalone` document class so
each diagram is its own self-contained image, not a page fragment.

```latex
\documentclass[tikz,border=4pt]{standalone}
\usepackage{circuitikz}
\usepackage[scaled]{helvet}
\renewcommand{\familydefault}{\sfdefault}
```

Available locally: `pdflatex`/`lualatex`/`xelatex`, `dvisvgm`, `pdf2svg`,
ImageMagick `convert`. circuitikz 1.4.6 confirmed installed
(`kpsewhich circuitikz.sty`).

## Verified gotchas

Each of these produced a silently broken or empty-looking output — not an
error — before being tracked down. Trust them; don't re-derive by trial
and error.

1. **The bipole type name must be the real circuitikz name, not a
   plausible shorthand.** `to[pot, ...]` is *not* a recognized bipole —
   the real name is `to[potentiometer, ...]` (or the alias `pR`). An
   unrecognized type doesn't error; circuitikz just drops the element
   silently (you get "Missing character" warnings about the literal
   letters, and no shape is drawn, and `name=...` doesn't create a usable
   node — see next point). Always grep
   `circuitikz-<version>-body.tex` for the exact bipole name before using
   one you're not 100% sure of (e.g. `grep -n "potentiometer\b"`).

2. **To use a bipole's named anchors later (e.g. a potentiometer's wiper),
   you must name it with `name=` (or `n=`) in the `to[...]` path, and the
   bipole type must be valid** (see #1 — an invalid type silently fails to
   register the name, and you get `Package pgf Error: No shape named
   'X' is known` on the *next* line that tries to use it, which is
   confusing because the error points at the wrong line):
   ```latex
   \draw (A) to[potentiometer, name=POT] (B);
   \draw (POT.wiper) -- ++(0,1);   % the wiper/tap anchor
   ```

3. **`\documentclass[tikz,border=4pt]{standalone}` does NOT reliably crop
   the PDF to content with this TeX Live install** — `pdfinfo` reports a
   full US Letter page (612×792pt) regardless of the actual drawing size,
   with both `pdflatex` and `lualatex`. This looks like it should work
   (standalone's `crop` option is the default, and its internal machinery
   sets `\pdfpagewidth`/`\pdfpageheight` from the measured content box),
   but don't trust it — verify with `pdfinfo file.pdf | grep "Page size"`
   before assuming the PDF is tightly cropped. Workaround: don't rely on
   the PDF's page box at all — go straight to DVI and let `dvisvgm`
   compute the real ink bounding box (see next point), which sidesteps
   the broken PDF cropping entirely.

4. **`dvisvgm --pdf` fails outright on this machine's TeX Live**
   (`ERROR: can't retrieve number of pages from file ...`) — this
   dvisvgm build has no linked PDF support. Don't compile with
   `pdflatex`/`lualatex` for the SVG step. Instead compile with plain
   `latex` (produces a `.dvi`) and run `dvisvgm` directly on the `.dvi` —
   that's dvisvgm's native, fully-supported input format.

5. **Without Ghostscript wired up, `dvisvgm` silently drops all PS
   specials and produces a near-empty, wrong-sized SVG** — color fills,
   and in circuitikz's case most of the actual drawing, go through
   PostScript specials. Running plain `dvisvgm file.dvi` logs
   `processing of PostScript specials is disabled (Ghostscript not
   found)` and `WARNING: N PostScript specials ignored`, and the
   resulting SVG reports an obviously-wrong tiny graphic size (e.g. 24pt×
   8pt for a diagram that should be ~300pt wide) — easy to miss if you
   don't check the logged graphic size or actually view the output.
   dvisvgm needs the Ghostscript *shared library* (`libgs.dylib` on
   macOS), not just the `gs` CLI binary on `PATH` — having `gs` findable
   via `which gs` is not sufficient. Fix: point dvisvgm at it explicitly,
   since it isn't found automatically even when installed via Homebrew:
   ```sh
   LIBGS=/opt/homebrew/lib/libgs.dylib dvisvgm --bbox=min -o out.svg in.dvi
   ```
   (find the actual path with `find /opt/homebrew -iname 'libgs*.dylib'`
   if it's not at that exact location). Verify by checking dvisvgm's own
   logged "graphic size" line looks plausible, not just that the command
   exited 0.

6. **Don't trust ImageMagick (`convert`/`magick`) to preview the result**
   — its built-in SVG delegate (MSVG) silently fails to render some path
   data (the potentiometer's resistor zigzag vanished entirely in one
   test render, while the rest of the diagram looked fine), with no
   warning. `qlmanage -t -s 1200 -o . file.svg` (macOS Quick Look,
   WebKit-based) is a better quick check, but WebKit alone isn't enough
   either — see gotcha #11: it will pass a Chrome-breaking font-format bug
   without complaint. Check an actual Chromium render before calling a
   diagram done.

7. **circuitikz's `ammeter`/`ohmmeter`/`voltmeter` bipoles always draw a
   diagonal needle/arrow across the circle** — this is baked into the
   shared `\drawmeteringcircle` macro in the circuitikz source (it's meant
   to look like an analog panel-meter gauge), not something any option
   turns off. If you want a plain "badge" (just a circle with a symbol
   in it, matching this site's other multimeter diagrams), don't use
   those bipoles at all — draw a plain node instead:
   ```latex
   \node[draw, circle, minimum size=1.3cm] (OHM) at (...) {$\Omega$};
   \draw (A) -- (OHM.west);   % attach wires to its anchors directly
   ```

8. **circuitikz draws bipole bodies (resistor/potentiometer zigzags) at
   `bipoles/thickness` (default 2) times the ambient line width** — so at
   `thick` (0.8pt), a zigzag renders at 1.6pt while a plain `\draw` wire
   at the same `thick` setting renders at 0.8pt, visibly thicker than the
   wires connecting to it even though nothing in the code looks
   inconsistent. Set `\ctikzset{bipoles/thickness=1}` so bipole bodies
   match plain wires at the same line width.

9. **A picture-level `scale=` key doesn't commute cleanly with
   circuitikz's bipoles.** Combining `scale=1.4` (plus a matching
   `every node/.append style={scale=1.4}` to keep label text readable)
   with a fixed-size symbol (the meter circle) and coordinates computed
   via `calc` produced visibly diagonal "funnel" wires into the meter
   instead of clean right angles — the scaled coordinate grid and the
   symbol's own absolute-unit geometry disagreed about where the
   connection points actually were. Don't scale the whole picture; size
   things by choosing bigger coordinate spacing directly, and control
   text size with ordinary font-size commands (`\large`, etc.) instead.

10. **The `(A -| B)` calc-library operator takes the x-coordinate from
    the *second* operand and the y-coordinate from the *first*** — i.e.
    `(A -| B)` = `(B`'s x, `A`'s y`)`, the reverse of what reading it
    left-to-right suggests. Verified by an isolated test (`\coordinate
    (R) at (P -| Q);` with `P=(2,0)`, `Q=(0,3)` places `R` at `(0,0)`,
    taking x from `Q` and y from `P`). Getting this backwards doesn't
    error — it just silently collapses two points that were supposed to
    share only one coordinate onto the same point, which looks like a
    rendering bug (wires merging where they shouldn't) rather than a
    logic error. Don't guess the argument order from memory; re-derive it
    with a 3-point throwaway test like the one above if it matters which
    way round it goes. Its mirror, `(A |- B)`, is the complement: x from
    the *first* operand, y from the *second* — i.e. `(A |- B)` =
    (`A`'s x, `B`'s y`)`. Easy mnemonic once verified: the `|` (vertical
    bar, i.e. "constant x") sits next to whichever operand actually
    supplies the x-coordinate. Still verify with a throwaway test rather
    than trusting the mnemonic blind the first time you use it.

11. **`dvisvgm`'s default `--font-format` (`svg`, i.e. the deprecated SVG
    Fonts spec — `<font>`/`<font-face>`/`<glyph>` elements) renders as
    garbled text in Chrome, which dropped SVG Fonts support years ago —
    while looking completely correct in Safari/WebKit (and therefore in
    `qlmanage` thumbnails, gotcha #6's recommended preview tool).** This
    is a dangerous one: the diagram will look fine to you if you preview
    it with `qlmanage` on macOS, and only reveal itself as broken in an
    actual Chrome-based viewer — which is most of this site's real
    audience. Always pass `--font-format=woff` (modern `@font-face`,
    universally supported) and verify with an actual Chromium-based
    render, not just Quick Look:
    ```sh
    LIBGS=... dvisvgm --bbox=min --font-format=woff -o out.svg in.dvi
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        --headless --disable-gpu --screenshot=check.png \
        --window-size=<viewBox-width-pt*4>,<viewBox-height-pt*4> \
        "file://$(pwd)/wrapper.html"
    ```
    (wrap the raw SVG in a minimal HTML file with its `<svg>` tag's
    `width`/`height` attributes forced to `viewBox-size * 4` — i.e. 4px
    per pt — so the screenshot has a known, exact, non-letterboxed pixel
    mapping back to the SVG's own coordinates, which also makes precise
    pixel-level checks like gotcha-hunting for off-center elements
    possible instead of guesswork.) A symptom that initially looked like
    a genuine off-center glyph (the Ω in the meter circle appearing too
    high, in a `qlmanage` render) turned out, on precise re-measurement
    from the raw SVG coordinates, to be centered to within 0.15pt — the
    real, separate bug was `--font-format=svg` rendering the glyph as
    nonsense ("â,,l") in Chrome, not a positioning error at all. Don't
    chase a centering fix before ruling out a renderer/font-format
    problem first.

12. **A bipole's `.west`/`.east`/`.north`/`.south` anchors are the nominal
    bounding box (per `bipoles/<type>/height`/`width`), not the visual
    extent of what actually gets drawn** — a diode's triangle, and to a
    lesser extent a resistor's zigzag, bulge past that nominal box. A
    label placed with plain `\node[left] at (X.west) {...}` (no gap, flush
    against the anchor) visibly overlaps the symbol — confirmed by
    rendering at 6px/pt and cropping tight on the junction (small/default
    previews can hide this). Don't place bipole labels flush against the
    anchor; offset them explicitly, e.g.
    `\node[left] at ($(X.west)+(-0.25,0)$) {...}`, and always check at
    high zoom before trusting a label placement looks right — this isn't
    something a whole-diagram thumbnail reveals.

13. **`--bbox=min` crops with exactly zero margin on every side** — by
    definition it's the tightest possible box around the ink, so whatever
    element is most extreme on a given side (the meter circle's left
    edge, a label's top ascender, ...) ends up flush against the SVG's own
    canvas edge, no breathing room. Easy to miss in a whole-diagram
    preview (a round shape pinned to the frame doesn't obviously read as
    "cropped," since nothing is actually cut off — it's just uncomfortably
    tight), but it looks wrong once the diagram is embedded on a page
    next to other content. `standalone`'s `border=` key doesn't help here
    (gotcha #3: its cropping is broken in this environment and doesn't
    even reach the DVI/dvisvgm path we use). Fix: pass a bare dimension
    instead of the word `min` — `--bbox=3pt` means "tight box plus a 3pt
    margin on all sides," confirmed by the reported graphic size growing
    by exactly `2*3pt` in both dimensions. (Other `--bbox` syntaxes like
    `min,3pt` or `min+3pt` are NOT accepted — dvisvgm errors with "invalid
    bounding box format"; it's a bare margin value or the word `min`, not
    a combination of both.)

## Result

`dvisvgm` with real Ghostscript support, `--font-format=woff` (gotcha
#11), and `--bbox=3pt` instead of `min` (gotcha #13) produces a
properly-cropped, cross-browser SVG with genuine `<text>` elements and a
little breathing room at the edges — comparable to schemdraw's
`svg`-backend output, just via a different toolchain. File size for the
potentiometer/multimeter diagram: ~9KB, using a hand-drawn meter node
(gotcha #7) instead of circuitikz's
`ohmmeter` bipole, `bipoles/thickness=1` (gotcha #8) for uniform line
weight, and no picture-level `scale=` (gotcha #9).
