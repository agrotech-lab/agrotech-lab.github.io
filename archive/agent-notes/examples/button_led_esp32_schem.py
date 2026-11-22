"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/button-digitalread-flash_schem.svg.

A4 reads a pushbutton using the internal pull-up (no external resistor
needed), D9 drives an LED through a series resistor to GND.

4 evenly-spaced IC pins (GND, A4, D9, GND) give a uniform gap between
every adjacent pair, sized to match elm.Switch()'s default length (3) so
the button needs no stretching. The LED+resistor chain doesn't fit a
single such gap, so instead of relying on a length match it's built
between explicit .to() endpoints via a midpoint, which adapts to
whatever the actual gap is.

Run with:
    MPLBACKEND=Agg python3 button_led_esp32_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='button_led_esp32_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    # 4 evenly-spaced pins, box height 10 -> gap (10-1)/3 = 3 between
    # every adjacent pair. That matches elm.Switch()'s default length (3)
    # exactly, so the button needs no stretching. The LED+resistor chain
    # (which doesn't fit in a single 3-unit gap) is instead built between
    # explicit .to() endpoints via a midpoint, so it adapts to whatever
    # the actual gap is instead of relying on a length match.
    esp32 = elm.Ic(
        size=(5, 10),
        pins=[
            # NOTE: slot order is inverted -- first-listed pin ends up at
            # the bottom, not the top. See circuit-diagrams.md.
            elm.IcPin(name='GND', anchorname='GND_BOTTOM', side='left', slot='1/4'),
            elm.IcPin(name='A4', side='left', slot='2/4'),
            elm.IcPin(name='D9', side='left', slot='3/4'),
            elm.IcPin(name='GND', anchorname='GND_TOP', side='left', slot='4/4'),
        ],
        label='ESP32\nFireBeetle',
    )
    d += esp32

    # --- Button circuit: A4 <-> GND, internal pull-up (no resistor) ---
    a4_arm = elm.Line().left().at(esp32.A4).length(2)
    d += a4_arm
    gnd_bottom_arm = elm.Line().left().at(esp32.GND_BOTTOM).length(2)
    d += gnd_bottom_arm

    button = elm.Switch().at(a4_arm.end).to(gnd_bottom_arm.end).label(
        'Button', loc='top', ofst=0.2
    )
    d += button
    d += elm.Dot().at(a4_arm.end)
    d += elm.Dot().at(gnd_bottom_arm.end)

    # --- LED circuit: D9 -> resistor -> LED -> GND ---
    d9_arm = elm.Line().left().at(esp32.D9).length(2)
    d += d9_arm
    gnd_top_arm = elm.Line().left().at(esp32.GND_TOP).length(2)
    d += gnd_top_arm

    mid = (d9_arm.end + gnd_top_arm.end) / 2

    resistor = elm.Resistor().at(d9_arm.end).to(mid).label(
        'R1\n330 Ω', loc='top', ofst=0.2
    )
    d += resistor
    led = elm.LED().at(mid).to(gnd_top_arm.end).fill('#f8d7d7').label(
        'LED1\nred', loc='top', ofst=0.2
    )
    d += led

    d += elm.Dot().at(d9_arm.end)
    d += elm.Dot().at(gnd_top_arm.end)

    # Sanity checks before trusting the render.
    gap = button.end - gnd_bottom_arm.end
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'button end {button.end} does not match GND_BOTTOM arm end '
        f'{gnd_bottom_arm.end}'
    )
    gap = led.end - gnd_top_arm.end
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'led end {led.end} does not match GND_TOP arm end {gnd_top_arm.end}'
    )
