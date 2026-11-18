"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/led-resistor-powersupply_schem.svg.

Mirrors the style of led_resistor_esp32.py: same navy color, same font,
same LED + resistor chain. The ESP32 IC box is replaced with a bench power
supply (elm.SourceV) stretched to length 6 so its two terminals land
exactly on the LED + resistor chain's total length (3 units each = 6) —
same "Working pattern" trick as circuit-diagrams.md, just sizing a
two-terminal element directly instead of an Ic box's pin spacing.

Run with:
    MPLBACKEND=Agg python3 led_resistor_powersupply_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='led_resistor_powersupply_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    source = elm.SourceV().up().length(6).label(
        'power supply\nset to 10 V', loc='right', ofst=0.3
    )
    d += source

    top_arm = elm.Line().left().at(source.end).length(2)
    d += top_arm
    bottom_arm = elm.Line().left().at(source.start).length(2)
    d += bottom_arm

    d += elm.Dot().at(top_arm.end)
    d += elm.LED().at(top_arm.end).down().fill('#f8d7d7').label('LED1\nRed (633 nm)', loc='top', ofst=0.2)
    resistor = elm.Resistor().down().label('R1\n? Ω (not 330 Ω)', loc='top', ofst=0.2)
    d += resistor
    d += elm.Dot().at(bottom_arm.end)

    # Sanity check before trusting the render — fails loudly instead of
    # silently producing a dangling or shorted wire. (Use an epsilon, not
    # ==: schemdraw's coordinates pick up float rounding error.)
    gap = (resistor.end - bottom_arm.end)
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'resistor end {resistor.end} does not match source arm end {bottom_arm.end} '
        '— resize the source length so it matches the component chain length'
    )
