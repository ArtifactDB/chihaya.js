#!/bin/bash

set -e
set -u

builddir=build
emcmake cmake -S . -B $builddir -DCMAKE_BUILD_TYPE=Release
(cd $builddir && emmake make)
cp -r $builddir/chihaya.* final
