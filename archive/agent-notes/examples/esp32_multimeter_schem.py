"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/esp32-multimeter_schem.svg.

Mirrors the style of led_resistor_esp32.py: same ESP32 IC box (A4 / GND
pins), single navy color, same font. The component between the two pin arms
is a single voltmeter (elm.MeterV) instead of an LED + resistor chain, so
the Ic box height is shrunk to 4 (pin gap = 3 units) instead of 7 (pin gap
= 6 units) to match the voltmeter's default 3-unit length — see the
"Working pattern" section in circuit-diagrams.md.

Run with:
    MPLBACKEND=Agg python3 esp32_multimeter_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='esp32_multimeter_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    # Box height (4) is sized so the gap between the two pins equals the
    # voltmeter's length (3 units), so it lands exactly on the second pin
    # with no overshoot/undershoot.
    esp32 = elm.Ic(
        size=(3, 4),
        pins=[
            # NOTE: slot order is inverted — first-listed pin ends up at
            # the bottom, not the top. See circuit-diagrams.md.
            elm.IcPin(name='GND', side='left', slot='1/2'),
            elm.IcPin(name='A4', side='left', slot='2/2'),
        ],
        label='ESP32\nFireBeetle',
    )
    d += esp32

    # Each wire labeled with its probe color and the multimeter port it
    # plugs into (per the steps in the text).
    top_arm = elm.Line().left().at(esp32.A4).length(3).label(
        'red probe\nVΩmA port', loc='top', ofst=0.2
    )
    d += top_arm
    bottom_arm = elm.Line().left().at(esp32.GND).length(3).label(
        'black probe\nCOM port', loc='bottom', ofst=0.2
    )
    d += bottom_arm

    d += elm.Dot().at(top_arm.end)
    meter = elm.MeterV().at(top_arm.end).down().label('Multimeter\nDC Voltage', loc='top', ofst=0.2)
    d += meter
    d += elm.Dot().at(bottom_arm.end)

    # Sanity check before trusting the render — fails loudly instead of
    # silently producing a dangling or shorted wire. (Use an epsilon, not
    # ==: schemdraw's coordinates pick up float rounding error.)
    gap = (meter.end - bottom_arm.end)
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'meter end {meter.end} does not match GND arm end {bottom_arm.end} '
        '— resize the Ic box height so pin spacing matches the component length'
    )
