"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/led-resistor-potentiometer-esp32_schem.svg.

"Not-so-good LED dimmer": a series loop from 3V3 through an LED, a fixed
330 ohm resistor, and a potentiometer used as a rheostat -- only its
wiper (not its far outer leg) closes the loop back to GND. The far leg
is left dangling (unconnected), same as the original Fritzing diagram
this replaces.

GND is placed at the same height as the potentiometer's wiper tap, so
the return wire is a single plain horizontal segment instead of a
vertical-then-horizontal dogleg.

2 evenly-spaced IC pins (GND bottom, 3V3 top). The LED+resistor+(half
of the) potentiometer chain down from the 3V3 arm totals 3+3+1.5 = 7.5
units to the wiper tap, so the box height is set to 8.5 -> gap
(8.5-1)/1 = 7.5, landing the GND pin exactly there.

Important: the potentiometer symbol's tap sits at a slight horizontal
offset from its own start/end line, not on it (verified by printing
pot.tap vs pot.start/.end -- don't assume otherwise). That offset is
what keeps the GND wire from running into/crossing the pot's dangling
far leg, which continues further down the *main* line after the tap:
the GND wire only needs to reach the tap's x, not the main line's x, so
it stops short of ever crossing it.

Run with:
    MPLBACKEND=Agg python3 led_resistor_potentiometer_esp32_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='led_resistor_potentiometer_esp32_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    esp32 = elm.Ic(
        size=(3, 8.5),
        pins=[
            # NOTE: slot order is inverted -- first-listed pin ends up at
            # the bottom, not the top. See circuit-diagrams.md.
            elm.IcPin(name='GND', side='left', slot='1/2'),
            elm.IcPin(name='3V3', side='left', slot='2/2'),
        ],
        label='ESP32\nFireBeetle',
    )
    d += esp32

    top_arm = elm.Line().left().at(getattr(esp32, '3V3')).length(2)
    d += top_arm

    d += elm.Dot().at(top_arm.end)
    led = elm.LED().at(top_arm.end).down().fill('#f8d7d7').label(
        'LED1\nred', loc='top', ofst=0.2
    )
    d += led
    resistor = elm.Resistor().down().label('R1\n330 Ω', loc='top', ofst=0.2)
    d += resistor
    pot = elm.Potentiometer().down().label('potentiometer\n10 kΩ', loc='top', ofst=0.2)
    d += pot

    # GND sits at the same height as the tap, so this is a plain
    # horizontal wire from the pin to the tap's x -- it never needs to
    # reach (and so never crosses) the main chain line.
    gnd_wire = elm.Line().at(esp32.GND).to((pot.tap.x, esp32.GND.y))
    d += gnd_wire
    d += elm.Dot().at(pot.tap)

    # Sanity checks before trusting the render -- fail loudly instead of
    # silently producing a dangling or shorted wire.
    gap = gnd_wire.end - pot.tap
    assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
        f'GND wire end {gnd_wire.end} does not match potentiometer tap {pot.tap}'
    )
    # The pot's far (unconnected) leg must stay clear of the GND wire's
    # height -- otherwise it would look wired even though it deliberately
    # isn't.
    clearance = pot.end.y - esp32.GND.y
    assert abs(clearance) > 0.5, (
        f'potentiometer far leg (y={pot.end.y}) is too close to GND '
        f'(y={esp32.GND.y}); adjust the Ic box height'
    )
