#!/bin/bash

set -e
set -u

builddir=build
emcmake cmake -S . -B $builddir -DCMAKE_BUILD_TYPE=Release
(cd $builddir && emmake make)

findir=final
mkdir -p $findir
cp -r $builddir/chihaya.* $findir
