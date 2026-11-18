#!/bin/sh
# Builds led_resistor_esp32.svg from the .tex source in this directory.
# See ../../circuit-diagrams-tikz.md for why each step is here (LIBGS,
# --font-format=woff, and --bbox=3pt instead of min are all required, not
# optional — skipping any one produces a diagram that looks broken or
# subtly wrong, with no error).
set -e
cd "$(dirname "$0")"

latex -interaction=nonstopmode led_resistor_esp32.tex
LIBGS=/opt/homebrew/lib/libgs.dylib dvisvgm --bbox=3pt --font-format=woff -o led_resistor_esp32.svg led_resistor_esp32.dvi
