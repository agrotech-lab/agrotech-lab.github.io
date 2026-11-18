"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/potentiometer-esp32-adc_schem.svg.

ESP32 with three pins (3V3, A4, GND) wired to a potentiometer: the two
outer legs to 3V3/GND, the wiper (middle leg) to A4 for reading an analog
voltage divider with the built-in ADC.

Box height (4) is sized so the gap between the outer pins (GND, 3V3)
equals the potentiometer's default length (3 units) — same
pin-spacing-vs-component-length trick as led_resistor_esp32.py, just with
a single Potentiometer element instead of an LED+Resistor chain. With 3
evenly-spaced pins in that box, the middle pin (A4) lands exactly at the
vertical midpoint, which is also exactly where the potentiometer's wiper
tap sits (`wiper pos` defaults to 0.5) — so the wire from the tap to A4
is a plain horizontal line, no bend needed.

Box width is 5 (not the minimal 3 used in the 2-pin diagrams): with the
middle pin (A4) sitting exactly at the box's vertical center, a narrow
box puts the A4 pin label directly on top of the Ic's own centered
"ESP32\\nFireBeetle" label — they run together illegibly. Widening the
box moves the center label away from the pin label (which stays fixed
near the left edge) without affecting the pin y-spacing at all.

Run with:
    MPLBACKEND=Agg python3 potentiometer_esp32_adc_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='potentiometer_esp32_adc_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    esp32 = elm.Ic(
        size=(5, 4),
        pins=[
            # NOTE: slot order is inverted — first-listed pin ends up at
            # the bottom, not the top. See circuit-diagrams.md.
            elm.IcPin(name='GND', side='left', slot='1/3'),
            elm.IcPin(name='A4', side='left', slot='2/3'),
            elm.IcPin(name='3V3', side='left', slot='3/3'),
        ],
        label='ESP32\nFireBeetle',
    )
    d += esp32

    top_arm = elm.Line().left().at(getattr(esp32, '3V3')).length(2)
    d += top_arm
    bottom_arm = elm.Line().left().at(esp32.GND).length(2)
    d += bottom_arm

    # loc='top' -> global LEFT for a .down()-oriented element (see the
    # label-loc gotcha in circuit-diagrams.md) -- puts the label clear of
    # the tap wire, which exits to the right.
    pot = elm.Potentiometer().at(top_arm.end).to(bottom_arm.end).label(
        'R1\n10 kΩ', loc='top', ofst=0.2
    )
    d += pot

    tap_arm = elm.Line().right().at(pot.tap).to(esp32.A4)
    d += tap_arm

    d += elm.Dot().at(top_arm.end)
    d += elm.Dot().at(bottom_arm.end)
    d += elm.Dot().at(pot.tap)

    # Sanity check before trusting the render — fails loudly instead of
    # silently producing a dangling or shorted wire. (Use an epsilon, not
    # ==: schemdraw's coordinates pick up float rounding error.)
    gap = tap_arm.end - esp32.A4
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'tap_arm end {tap_arm.end} does not match A4 pin {esp32.A4} '
        '— A4 is not at the same height as the wiper tap; check the IC '
        'pin spacing / potentiometer wiper pos'
    )
