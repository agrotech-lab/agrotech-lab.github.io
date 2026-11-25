# Class PCB with an Arduino Nano ESP32

The Nano section in `tutorials/soldering-and-wires.qmd` connects a Nano on a
breadboard to the **empty** FireBeetle U1 footprint. Never insert the Nano in
that footprint; the two boards do not share a pin layout. USB powers the Nano;
its 3V3 and GND supply the class PCB. Do not connect a second controller or
feed the PCB from VUSB/VBUS/VIN.

The diagram uses `examples/nano_esp32_pcb.py` (schemdraw), taking the actual
drilled-hole coordinates from `board-dimensions.json`. It is a component-side
view: SHT31/logo above, OLED/button/LEDs below, FireBeetle USB end left. Row
positions count small contacts left to right, excluding the four larger
FireBeetle mounting holes. Upper has 14 contacts, lower has 18.

Verified against `soldering_board_1.kicad_pcb` on 2026-11-25:

| Nano label | PCB net | Row position | KiCad U1 pad |
|---|---|---|---|
| 3V3 | +3V3 | Upper 2 | 31 |
| GND | GND | Upper 3 | 30 |
| A5 | SCL | Upper 4 | 29 |
| A4 | SDA | Upper 5 | 28 |
| A3 | A3 | Upper 7 | 26 |
| A2 | A2 | Upper 8 | 25 |
| D7 | Net-(U1-D7) | Lower 12 | 12 |
| D6 | Net-(U1-D6) | Lower 13 | 13 |
| D3 | Net-(U1-D3) | Lower 15 | 15 |
| D2 | Net-(U1-D2) | Lower 16 | 16 |

J1 (OLED) and J2 (SHT31) share 3V3/GND/SCL/SDA in pad order 1/2/3/4.
R5 pulls A2 up to 3V3, TH1 goes from A2 to GND. R6 pulls A3 up to 3V3,
R2 goes from A3 to GND. SW2 connects D7 to GND, with R7 pulling it up.
PCB LEDs D1/D2/D3 are driven HIGH through R1/R3/R4 from D6/D3/D2 respectively.
Resistor values are generic in the source: the check sketch reports raw ADC
values, not a fabricated thermistor temperature or light calibration.

Arduino pin names are crucial. The Nano's raw GPIO numbers differ from
FireBeetle; use D6/D3/D2/D7 and A2/A3, not bare integers. `Wire.begin()` defaults
to Nano A4/SDA and A5/SCL. Some older course examples use A4 for an analog
sensor; the new section explicitly tells students to adapt those examples.
The Arduino IDE instructions select **Arduino ESP32 Boards by Arduino**.

The sketch compiled with PlatformIO's `arduino_nano_esp32` board and Arduino
core 2.0.17. The locally installed Espressif Arduino core 3.1.3 failed inside
its own pin-remapping headers; do not confuse that with the Arduino-maintained
board package linked in the lesson. Browser checks covered desktop, 390/320 px,
the assembly controls, fullscreen/blackout, no-WebGL fallback, downloads and links.

The guide and sketch have not been tested on a physical assembled lab board.
Confirm actual kit values, module pin order, header orientation and soldering
before a lab test. The viewer's component bodies are illustrative, not fit data.

The viewer import, GLB URL and image/download URLs carry `v=sht31-purple-1` to
refresh older cached placeholder models. Bump these together when changing
the assembly assets. Preserve the near/far camera planes (5/1000) to avoid
copper and solder-mask depth artifacts.
