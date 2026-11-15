"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates archive/figures/diagrams/led-resistor-esp32_schem.svg.

Run with:
    MPLBACKEND=Agg python3 led_resistor_esp32.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='led_resistor_esp32.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    # Box height (7) is sized so the gap between the two pins equals the
    # LED + Resistor chain's total length (3 units each = 6), so the chain
    # lands exactly on the second pin with no overshoot/undershoot.
    esp32 = elm.Ic(
        size=(3, 7),
        pins=[
            # NOTE: slot order is inverted — first-listed pin ends up at
            # the bottom, not the top. See circuit-diagrams.md.
            elm.IcPin(name='GND', side='left', slot='1/2'),
            elm.IcPin(name='A4', side='left', slot='2/2'),
        ],
        label='ESP32\nFireBeetle',
    )
    d += esp32

    top_arm = elm.Line().left().at(esp32.A4).length(2)
    d += top_arm
    bottom_arm = elm.Line().left().at(esp32.GND).length(2)
    d += bottom_arm

    d += elm.Dot().at(top_arm.end)
    d += elm.LED().at(top_arm.end).down().fill('#f8d7d7').label('LED1\nred', loc='top', ofst=0.2)
    resistor = elm.Resistor().down().label('R1\n330 Ω', loc='top', ofst=0.2)
    d += resistor
    d += elm.Dot().at(bottom_arm.end)

    # Sanity check before trusting the render — fails loudly instead of
    # silently producing a dangling or shorted wire. (Use an epsilon, not
    # ==: schemdraw's coordinates pick up float rounding error.)
    gap = (resistor.end - bottom_arm.end)
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'resistor end {resistor.end} does not match GND arm end {bottom_arm.end} '
        '— resize the Ic box height so pin spacing matches the component chain length'
    )
