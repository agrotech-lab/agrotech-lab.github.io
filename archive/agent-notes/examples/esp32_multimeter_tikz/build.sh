#!/bin/sh
# Builds esp32_multimeter.svg from the .tex source in this directory.
# See ../../circuit-diagrams-tikz.md for why each step is here (LIBGS,
# --font-format=woff, and --bbox=3pt instead of min are all required, not
# optional -- skipping any one produces a diagram that looks broken or
# subtly wrong, with no error).
set -e
cd "$(dirname "$0")"

latex -interaction=nonstopmode esp32_multimeter.tex
LIBGS=/opt/homebrew/lib/libgs.dylib dvisvgm --bbox=3pt --font-format=woff -o esp32_multimeter.svg esp32_multimeter.dvi
