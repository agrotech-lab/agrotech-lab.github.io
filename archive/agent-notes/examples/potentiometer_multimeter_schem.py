"""
Reference schemdraw script — see ../circuit-diagrams.md for the gotchas
this encodes. Regenerates
archive/figures/diagrams/potentiometer-multimeter_schem.svg.

Mirrors the style of the other diagrams in this set: navy color, same
font. Shows an ohmmeter (elm.MeterOhm) measuring resistance between the
potentiometer's wiper (middle leg, elm.Potentiometer's `tap` anchor — the
tip of the arrow pointing into the resistor body) and one of its two end
legs. The meter is placed directly above those two points (same x
coordinates) so both connecting wires are plain verticals with no elbow
needed — unlike the IC-pin diagrams, there's no pin-spacing-vs-chain-length
sizing trick here, just matching x's.

Run with:
    MPLBACKEND=Agg python3 potentiometer_multimeter_schem.py
"""
import schemdraw
schemdraw.use('svg')
import schemdraw.elements as elm

NAVY = '#2c3e50'

with schemdraw.Drawing(file='potentiometer_multimeter_schem.svg') as d:
    d.config(color=NAVY, lw=2.5, fontsize=14, font='Helvetica, Arial, sans-serif')

    pot = elm.Potentiometer().right().length(4).label(
        'potentiometer\n10 kΩ', loc='bottom', ofst=0.3
    )
    d += pot

    # Meter sits directly above the left leg and the wiper tap (same x's),
    # so the connecting wires below are plain verticals.
    meter = elm.MeterOhm().right().at(
        (pot.start[0], pot.tap[1] + 2)
    ).length(pot.tap[0] - pot.start[0]).label(
        'Multimeter\n(resistance mode)', loc='top', ofst=0.3
    )
    d += meter

    left_wire = elm.Line().down().at(meter.start).to(pot.start)
    d += left_wire
    tap_wire = elm.Line().down().at(meter.end).to(pot.tap)
    d += tap_wire

    d += elm.Dot().at(pot.start)
    d += elm.Dot().at(pot.tap)

    # elm.Gap() defaults to a 3-unit-long invisible element, so a label
    # placed on one would center 1.5 units away from the anchor point —
    # use zero-size elm.Label() instead, placed right at the leg.
    d += elm.Label().at((pot.start[0], pot.start[1] - 0.3)).label('leg 1', loc='bottom')
    d += elm.Label().at((pot.tap[0] + 2.0, pot.tap[1] + 0.1)).label(
        'wiper (middle leg)', loc='right'
    )
    d += elm.Label().at((pot.end[0], pot.end[1] - 0.3)).label(
        'leg 2\n(not connected)', loc='bottom'
    )

    # Sanity check before trusting the render — fails loudly instead of
    # silently producing a dangling or shorted wire.
    for wire, target in ((left_wire, pot.start), (tap_wire, pot.tap)):
        gap = wire.end - target
        assert abs(gap.x) < 1e-6 and abs(gap.y) < 1e-6, (
            f'{wire} end {wire.end} does not match target {target}'
        )
