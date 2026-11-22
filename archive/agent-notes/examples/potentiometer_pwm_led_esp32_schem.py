"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/potentiometer-PWM-LED-esp32_schem.svg.

Potentiometer wiper on A4 (ADC input), LED on D9 through a series
resistor to GND — PWM on D9 sets the LED brightness from the
potentiometer reading.

5 evenly-spaced IC pins, bottom to top: GND (pot), A4, 3V3, D9, GND
(LED). Both the potentiometer and the LED+resistor chain are built
between explicit .to() endpoints (not relying on any default element
length), so they stretch to fit whatever the actual pin gap is. That
also means the wiper tap (always at the midpoint of whatever length the
pot stretches to) lands exactly on A4 regardless of gap size, as long as
GND/3V3 stay A4's immediate neighbors in the evenly-spaced pin list.
Box height 13 -> gap (13-1)/4 = 3, chosen just for comfortable label
spacing (a tighter box, e.g. matching potentiometer_esp32_adc_schem.py's
1.5 gap, crams the LED1/R2 labels into each other).

Run with:
    MPLBACKEND=Agg python3 potentiometer_pwm_led_esp32_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='potentiometer_pwm_led_esp32_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    esp32 = elm.Ic(
        size=(5, 13),
        pins=[
            # NOTE: slot order is inverted -- first-listed pin ends up at
            # the bottom, not the top. See circuit-diagrams.md.
            elm.IcPin(name='GND', anchorname='GND_POT', side='left', slot='1/5'),
            elm.IcPin(name='A4', side='left', slot='2/5'),
            elm.IcPin(name='3V3', side='left', slot='3/5'),
            elm.IcPin(name='D9', side='left', slot='4/5'),
            elm.IcPin(name='GND', anchorname='GND_LED', side='left', slot='5/5'),
        ],
        label='ESP32\nFireBeetle',
    )
    d += esp32

    # --- Potentiometer: outer legs to GND/3V3, wiper to A4 ---
    v3_arm = elm.Line().left().at(getattr(esp32, '3V3')).length(2)
    d += v3_arm
    gnd_pot_arm = elm.Line().left().at(esp32.GND_POT).length(2)
    d += gnd_pot_arm

    # loc='top' -> global LEFT for a .down()-oriented element (see the
    # label-loc gotcha in circuit-diagrams.md) -- puts the label clear of
    # the tap wire, which exits to the right.
    pot = elm.Potentiometer().at(v3_arm.end).to(gnd_pot_arm.end).label(
        'R1\n10 kΩ', loc='top', ofst=0.2
    )
    d += pot

    tap_arm = elm.Line().right().at(pot.tap).to(esp32.A4)
    d += tap_arm

    d += elm.Dot().at(v3_arm.end)
    d += elm.Dot().at(gnd_pot_arm.end)
    d += elm.Dot().at(pot.tap)

    # --- LED circuit: D9 -> resistor -> LED -> GND ---
    d9_arm = elm.Line().left().at(esp32.D9).length(2)
    d += d9_arm
    gnd_led_arm = elm.Line().left().at(esp32.GND_LED).length(2)
    d += gnd_led_arm

    mid = (d9_arm.end + gnd_led_arm.end) / 2

    resistor = elm.Resistor().at(d9_arm.end).to(mid).label(
        'R2\n330 Ω', loc='top', ofst=0.2
    )
    d += resistor
    led = elm.LED().at(mid).to(gnd_led_arm.end).fill('#f8d7d7').label(
        'LED1\nred', loc='top', ofst=0.2
    )
    d += led

    d += elm.Dot().at(d9_arm.end)
    d += elm.Dot().at(gnd_led_arm.end)

    # Sanity checks before trusting the render -- fail loudly instead of
    # silently producing a dangling or shorted wire. (Use an epsilon, not
    # ==: schemdraw's coordinates pick up float rounding error.)
    gap = tap_arm.end - esp32.A4
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'tap_arm end {tap_arm.end} does not match A4 pin {esp32.A4} '
        '-- A4 is not at the same height as the wiper tap; check the IC '
        'pin spacing / potentiometer wiper pos'
    )
    gap = led.end - gnd_led_arm.end
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'led end {led.end} does not match GND_LED arm end {gnd_led_arm.end}'
    )
