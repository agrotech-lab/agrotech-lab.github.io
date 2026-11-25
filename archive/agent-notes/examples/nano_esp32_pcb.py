"""Draw the class PCB's FireBeetle socket positions for the Nano wiring guide.

Run: MPLBACKEND=Agg python3 archive/agent-notes/examples/nano_esp32_pcb.py
Requires schemdraw. Geometry comes from the exported KiCad drill positions.
Contact numbers are counted from the left in the component-side view; they
are NOT KiCad U1 pad numbers. Upper contact n = U1 pad (33-n); lower n = pad n.
The ten selected contacts were checked against soldering_board_1.kicad_pcb.
"""
import json
from pathlib import Path

import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

ROOT = Path(__file__).resolve().parents[3]
data = json.loads((ROOT / 'archive/hardware/soldering-board-1/board-dimensions.json').read_text())
contacts = [h for h in data['drilled_holes'] if abs(h[2] - 1.2) < .001]
rows = {
    'Upper': sorted((h for h in contacts if h[1] > 45), key=lambda h: h[0]),
    'Lower': sorted((h for h in contacts if h[1] < 45), key=lambda h: h[0]),
}
assert len(rows['Upper']) == 14 and len(rows['Lower']) == 18
selected = {'Upper': {2, 3, 4, 5, 7, 8}, 'Lower': {12, 13, 15, 16}}
ink, muted, blue = '#253e4a', '#61727b', '#176f8c'
d = schemdraw.Drawing(show=False)
d.config(inches_per_unit=.14, fontsize=14, font='Helvetica, Arial, sans-serif', color=ink, lw=1.5)

def label(text, x, y, size=14, color=ink):
    d.add(elm.Label().at((x, y)).label(text, fontsize=size, color=color))

# This is a locator for the socket area, not the whole PCB outline.
d.add(elm.Rect(corner1=(8, 29), corner2=(70, 63), fill='#f6f9fa', color='#bccbd2'))
label('FireBeetle socket area · component side', 39, 69, 18)
label('SHT31 / plant logo / thermistor / photoresistor above this area', 39, 65, 13, muted)
label('OLED / button / LEDs below this area', 39, 23, 13, muted)
label('USB end', 14, 49, 12, muted)
d.add(elm.Arrow().at((17, 46)).to((10, 46)).color(muted))
label('FireBeetle removed', 43, 49, 17)
label('Blue contacts: connect the ten jumpers in the table', 43, 45, 12, blue)
label('Count small contacts from left to right in each row', 43, 41.5, 12, muted)

for name, holes in rows.items():
    upper = name == 'Upper'
    y = holes[0][1]
    label(name + ' row', 18 if upper else 13, y + (4 if upper else -4), 13)
    for index, (x, y, _) in enumerate(holes, 1):
        active = index in selected[name]
        d.add(elm.Dot(radius=.78).at((x, y)).color(blue if active else '#b5c1c7').fill(blue if active else '#ffffff'))
        label(str(index), x, y + (3 if upper else -3), 12, blue if active else muted)
    # Bold, enlarged dot colour is also explained in text/table, not sole cue.
    for x, yy, diameter in data['drilled_holes']:
        if abs(diameter - 2) < .001 and abs(yy - y) < .3:
            d.add(elm.Dot(radius=1).at((x, yy)).color('#9daeb8').fill('#ffffff'))

label('Larger mounting holes are not contacts. Numbers here are row positions, not GPIO numbers.', 39, 18.5, 12, muted)
# Schemdraw's text extents do not include the full glyph height. Extend the
# canvas with a white line to keep the top/bottom text clear of SVG clipping.
d.add(elm.Line().at((7, 15)).to((7, 72)).color('#ffffff').linewidth(.1))
output = ROOT / 'archive/figures/diagrams/nano-esp32-pcb-sockets.svg'
d.save(str(output), transparent=False)
print(output)
