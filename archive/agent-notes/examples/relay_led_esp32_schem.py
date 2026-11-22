"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/relay-led-esp32_schem.svg.

ESP32 (landscape) above a relay module (also drawn as a plain labeled
box, same style as the ESP32 -- this is a teaching diagram, not a true
relay schematic symbol), filled light blue to set it apart now that
there are two stacked rectangles. The control side (GND, IN1, VCC) sits
on the relay's TOP edge, facing the ESP32 directly above it, so the
three connecting wires are short and perfectly vertical; IN1 is in the
middle, matching the real module's silkscreen order. The switched side
(NO, COM, NC) sits on the relay's BOTTOM edge -- the "other side" --
with COM in the middle. Only COM and NO are wired, to a simple load
loop: a 3.3V battery, a 330 ohm resistor, and an LED. NC is drawn (shown
on the box, matching the real module) but deliberately left
unconnected -- it's not used in this circuit.

Key trick for the straight, non-crossing vertical wires: give both IC
boxes the SAME width. schemdraw positions side='top'/side='bottom' pins
left-to-right (unlike side='left'/'right', which is inverted -- see the
slot-order gotcha below) at x = 0.5 + i * (width - 1) / (n - 1) measured
from the box's own left edge (verified empirically, not documented).
With equal widths and matching pin order (GND, A4/IN1, VIN/VCC each
left-to-right) on both boxes, the x-coordinates land exactly on top of
each other with zero extra alignment work. Note the ESP32's own pin
order had to be reshuffled (GND, A4, VIN) to keep matching the relay's
(GND, IN1, VCC) -- the two boxes' pin orders must mirror each other,
not just share a width.

Placing the relay box itself: elm.Ic(...).at(point) puts the box's
bottom-left CORNER at that point (verified empirically) -- not its
center, not its first pin. That's what makes the same-width trick work:
both boxes share the same x origin (0), so same-side pins share x.

Run with:
    MPLBACKEND=Agg python3 relay_led_esp32_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'
LIGHT_BLUE = '#d6ecf7'

with schemdraw.Drawing(file='relay_led_esp32_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    esp32 = elm.Ic(
        size=(10, 3),
        pins=[
            elm.IcPin(name='GND', side='bottom', slot='1/3'),
            elm.IcPin(name='A4', side='bottom', slot='2/3'),
            elm.IcPin(name='VIN', side='bottom', slot='3/3'),
        ],
        label='ESP32\nFireBeetle',
    ).at((0, 0))
    d += esp32

    relay = elm.Ic(
        size=(10, 2),
        pins=[
            elm.IcPin(name='GND', side='top', slot='1/3'),
            elm.IcPin(name='IN1', side='top', slot='2/3'),
            elm.IcPin(name='VCC', side='top', slot='3/3'),
            elm.IcPin(name='NO', side='bottom', slot='1/3'),
            elm.IcPin(name='COM', side='bottom', slot='2/3'),
            elm.IcPin(name='NC', side='bottom', slot='3/3'),
        ],
        label='Relay',
    ).at((0, esp32.GND.y - 3)).fill(LIGHT_BLUE)
    d += relay

    # Control side: ESP32 -> relay, straight down (same-width trick, see
    # docstring -- these are plain vertical lines, no horizontal offset).
    gnd_wire = elm.Line().down().at(esp32.GND).to((relay.GND.x, relay.GND.y))
    d += gnd_wire
    in1_wire = elm.Line().down().at(esp32.A4).to((relay.IN1.x, relay.IN1.y))
    d += in1_wire
    vcc_wire = elm.Line().down().at(esp32.VIN).to((relay.VCC.x, relay.VCC.y))
    d += vcc_wire

    # Switched side: relay -> battery/resistor/LED loop. Two arms drop
    # from NO/COM to the same height, then the chain is built between
    # explicit .to() endpoints via two interior division points (same
    # trick as button_led_esp32_schem.py's midpoint, generalized to 3
    # segments), so it fills the gap exactly regardless of its size. NC
    # is left completely alone -- no arm, no wire.
    no_arm = elm.Line().down().at(relay.NO).length(2)
    d += no_arm
    com_arm = elm.Line().down().at(relay.COM).length(2)
    d += com_arm

    gap = com_arm.end.x - no_arm.end.x
    p1 = (no_arm.end.x + gap / 3, no_arm.end.y)
    p2 = (no_arm.end.x + 2 * gap / 3, no_arm.end.y)

    led = elm.LED().right().at(no_arm.end).to(p1).fill('#f8d7d7').label(
        'LED1\nred', loc='bottom', ofst=0.3
    )
    d += led
    resistor = elm.Resistor().right().at(p1).to(p2).label(
        'R1\n330 Ω', loc='bottom', ofst=0.3
    )
    d += resistor
    # .reverse() so the + terminal faces COM: current must leave the
    # battery on the COM side and return via NO through the LED's
    # anode (forward-biased) -- see the LED-vs-battery polarity note
    # above.
    battery = elm.Battery().right().at(p2).to(com_arm.end).reverse().label(
        '3.3V', loc='bottom', ofst=0.3
    )
    d += battery

    d += elm.Dot().at(no_arm.end)
    d += elm.Dot().at(p1)
    d += elm.Dot().at(p2)
    d += elm.Dot().at(com_arm.end)

    # Sanity checks before trusting the render -- fail loudly instead of
    # silently producing a dangling or shorted wire.
    for wire, target in (
        (gnd_wire, relay.GND),
        (in1_wire, relay.IN1),
        (vcc_wire, relay.VCC),
    ):
        gap_pt = wire.end - target
        assert abs(gap_pt.x) < 1e-6 and abs(gap_pt.y) < 1e-6, (
            f'control wire end {wire.end} does not match relay pin {target}'
        )
    gap_pt = battery.end - com_arm.end
    assert abs(gap_pt.x) < 1e-6 and abs(gap_pt.y) < 1e-6, (
        f'battery end {battery.end} does not match COM arm end {com_arm.end}'
    )
