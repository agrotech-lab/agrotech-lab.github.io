FireBeetle 2 ESP32-E: PlatformIO starter
=====================================

Guide: https://agrotech-lab.github.io/tutorials/platformio-vscode.html

Install desktop VS Code and the official PlatformIO IDE extension.
Extract this ZIP and open this folder (the one containing platformio.ini)
with File > Open Folder in VS Code. Allow PlatformIO to finish setup.

Use PlatformIO > Project Tasks > firebeetle > General > Build.
Connect the FireBeetle 2 ESP32-E with a USB data cable, then use Upload.
Open Monitor at 115200 baud. Expected output alternates LED ON / LED OFF.

Or open the PlatformIO Core CLI terminal in this folder:
  pio run -e firebeetle
  pio run -e firebeetle -t upload
  pio device monitor -b 115200

The platform is pinned to platformio/espressif32@8.0.0, whose release
uses Arduino-ESP32 3.3.12. Platform version and Arduino core version
are different numbers. The program needs no extra libraries.

Build verification and hardware limitations are recorded on the guide.
Keep .pio/ out of Git; PlatformIO recreates it. No credentials are needed.
