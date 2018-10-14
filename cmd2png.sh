#!/bin/sh

$1 | convert -background white -fill black \
-font "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf" -pointsize 32 \
-border 10 -bordercolor black \
label:@- out.png
