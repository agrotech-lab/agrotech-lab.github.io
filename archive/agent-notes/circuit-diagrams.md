# Circuit diagrams: use schemdraw, not hand-coded SVG

Hand-coding circuit schematics as raw SVG (manually placing `<polygon>`,
`<polyline>`, `<text>` coordinates) does not scale and is easy to get subtly
wrong (gaps in symbols, wires that don't actually meet, text overlapping
components) without it being obvious from a quick look at the render. Use
Python's [`schemdraw`](https://schemdraw.readthedocs.io) library instead: it
draws correct standard schematic symbols (resistor zigzag, diode/LED
triangle, IC boxes with only the pins you actually want shown, batteries,
switches, sensors, ...) and handles the connecting geometry for you.

A worked, fully-debugged example is in `examples/led_resistor_esp32.py` next
to this file — it reproduces `archive/figures/diagrams/led-resistor-esp32_schem.svg`.
Copy it as a starting point rather than starting from scratch.

## Setup

```python
import schemdraw
schemdraw.use('svg')          # must come before importing elements
import schemdraw.elements as elm
```

Run any script with `MPLBACKEND=Agg python3 your_script.py`. Even with the
SVG backend, schemdraw imports matplotlib under the hood, and without a
non-interactive backend it tries to open a GUI window and hangs forever —
no error, no timeout, it just sits there.

### Why `schemdraw.use('svg')` matters

The default backend is matplotlib's SVG export, which bakes every piece of
text into vector glyph *outlines* (`<path>` elements) instead of real
`<text>` elements. That means: much bigger files, text that isn't
selectable, and styling/fonts that can't be controlled by the page's CSS.
`schemdraw.use('svg')` switches to schemdraw's own lightweight SVG backend,
which emits real `<text>` elements. Always use it for diagrams that will be
embedded in the site.

When picking a font, pass an explicit CSS font stack, not a generic
keyword — `font='Helvetica, Arial, sans-serif'`, not `font='sans-serif'`
(the latter gets written literally as `font-family="sans"` into the SVG,
which is not a valid CSS generic and falls back to the browser's serif
default in some renderers).

## Verified API gotchas

These are not guesses — each one produced a visibly broken diagram that
looked fine at a glance until checked closely. Trust them; don't re-derive
them by trial and error again.

1. **Label `loc` is relative to the element's local frame, not global
   direction**, once the element is rotated. For a `.down()`-oriented
   two-terminal element (`Resistor()`, `LED()`, ...):
   - `loc='top'` → label appears on the global **left**, vertically centered
     on the component.
   - `loc='bottom'` → label appears on the global **right**, vertically
     centered.
   - `loc='left'` / `loc='right'` do *not* mean what you'd guess for a
     rotated element — don't use them here.
   If you're using an orientation other than `.down()`, don't assume by
   analogy — render a two-line throwaway test script with all four `loc`
   values and look at the actual output before building the real diagram.

2. **Two-terminal elements default to 3 drawing units long**, not 1
   (`Drawing.config(unit=...)` controls this, default is 3). This matters
   when you need a wire or component chain to land exactly on a target
   anchor (e.g. a second pin on an IC box): if you don't size the
   containing box so the pin-to-pin spacing equals the chain's total
   length, the chain will silently overshoot past the target (dangling,
   unconnected) or fall short — with no error, and it can look deceptively
   plausible in a quick render (e.g. a wire ending at a resistor's midpoint
   can look like a normal junction).

3. **`elm.Ic(pins=[...])` pin `slot='n/N'` order is inverted**: the
   *first*-listed pin ends up at the bottom of that side, the *last*-listed
   pin ends up at the top. Counterintuitive — verify with a tiny throwaway
   render before relying on it (`elm.IcPin(name='X', slot='1/2')` listed
   first will NOT be the top pin).

4. **Don't trust a quick square-cropped thumbnail** (e.g. macOS
   `qlmanage -t -s N file.svg`) to judge whether wires actually connect —
   it can crop content and create a false impression of a gap (or hide a
   real one). To actually verify a diagram:
   - Render a full-canvas, correct-aspect-ratio PNG via schemdraw's
     matplotlib backend for a quick visual (`d.save('preview.png')` — the
     "FigureCanvasAgg is non-interactive" warnings are harmless and can be
     ignored), separately from the real SVG-backend output you ship.
   - Crop/zoom into every junction at high DPI
     (`d.save('x.png', dpi=300)` then crop with PIL) and look at it
     directly.
   - When in doubt, print each element's `.start` / `.end` coordinates
     (every schemdraw element exposes these as `Point` objects after being
     added to the drawing) and check numerically that they coincide where
     they're supposed to. This catches real bugs — like a return wire that
     exactly retraces a forward wire's coordinates, silently shorting two
     nodes together behind a component — that are easy to miss by eye.

## Working pattern: a loop between two IC pins

For "pin → component → component → pin" (e.g. GPIO → LED → resistor → GND),
draw both pins' wire "arms" first so you have concrete anchor coordinates to
work with, size the IC box so the gap between the two arms' endpoints equals
the component chain's total length, then build the chain and confirm the
last component's `.end` matches the second arm's `.end` *before* rendering:

```python
top_arm = elm.Line().left().at(esp32.PIN_A).length(2)
d += top_arm
bottom_arm = elm.Line().left().at(esp32.PIN_B).length(2)
d += bottom_arm

d += elm.Dot().at(top_arm.end)
d += elm.LED().at(top_arm.end).down().fill('#f8d7d7').label('LED1\nred', loc='top', ofst=0.2)
resistor = elm.Resistor().down().label('R1\n330 Ω', loc='top', ofst=0.2)
d += resistor
d += elm.Dot().at(bottom_arm.end)

assert resistor.end == bottom_arm.end  # sanity check before trusting the render
```
