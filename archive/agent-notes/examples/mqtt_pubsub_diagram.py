"""
Summarizes the MQTT publish/subscribe model (broker, clients, topics) as a
single figure for tutorials/MQTT.qmd. Regenerates
archive/figures/diagrams/mqtt-pubsub.svg.

Two publishers (sensors) send messages to the broker on a topic; the broker
fans them out to two subscribers (dashboard, actuator) that subscribed to
that same topic. This is the one idea worth drawing: publishers and
subscribers never talk to each other directly, only through the broker,
keyed by topic.

Run with:
    python3 mqtt_pubsub_diagram.py
"""
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from matplotlib.patches import FancyArrowPatch

NAVY = '#2c3e50'

fig, ax = plt.subplots(figsize=(9.6, 4.2))
ax.set_xlim(-0.1, 9.5)
ax.set_ylim(0, 4.2)
ax.axis('off')


def box(xy, w, h, text, fontsize=11, lw=2):
    x, y = xy
    patch = FancyBboxPatch(
        (x, y), w, h,
        boxstyle='round,pad=0.08,rounding_size=0.1',
        linewidth=lw, edgecolor=NAVY, facecolor='white', zorder=2,
    )
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha='center', va='center',
             fontsize=fontsize, color=NAVY, zorder=3)
    return x, y, w, h


def arrow(p1, p2, label=None, label_dy=0.18):
    a = FancyArrowPatch(
        p1, p2, arrowstyle='-|>', mutation_scale=16,
        linewidth=2, color=NAVY, zorder=1,
    )
    ax.add_patch(a)
    if label:
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        ax.text(mx, my + label_dy, label, ha='center', va='bottom',
                fontsize=9, color=NAVY, style='italic')


# publishers (left)
pub1 = box((0.2, 2.9), 2.1, 0.9, 'Publisher\n(temperature sensor)', fontsize=10)
pub2 = box((0.2, 0.5), 2.1, 0.9, 'Publisher\n(soil moisture sensor)', fontsize=10)

# broker (center)
broker = box((3.6, 1.65), 1.9, 1.1, 'Broker\n(broker.hivemq.com)', fontsize=10.5)

# subscribers (right)
sub1 = box((6.6, 2.9), 2.3, 0.9, 'Subscriber\n(dashboard)', fontsize=10)
sub2 = box((6.6, 0.5), 2.3, 0.9, 'Subscriber\n(irrigation actuator)', fontsize=9.5)

arrow((2.3, 3.35), (3.6, 2.5), 'publish')
arrow((2.3, 0.95), (3.6, 1.95), 'publish')
arrow((5.5, 2.5), (6.6, 3.35), 'subscribe', label_dy=0.28)
arrow((5.5, 1.95), (6.6, 0.95), 'subscribe')

ax.text(4.55, 0.95, 'topic:\nagriculture/field1/#',
        ha='center', va='top', fontsize=9, color=NAVY)

fig.savefig(
    '../../figures/diagrams/mqtt-pubsub.svg',
    transparent=True, bbox_inches='tight', pad_inches=0.15,
)
