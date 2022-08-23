# Read delayed matrices in Javascript 

## Overview

This package provides (incomplete) support for reading [**chihaya**](https://github.com/LTLA/chihaya)-formatted delayed matrices into Javascript.
We do so by creating a [`ScranMatrix`](https://jkanche.com/scran.js/ScranMatrix) with delayed operations from the [**tatami**](https://ltla.github.io/tatami) library.
The resulting matrix can then be used for row- or column-level queries in Javascript or into other [**scran.js**](https://jkanche.com/scran.js) functions.
This enables web applications to read delayed matrices generated elsewhere, e.g., via the [R interface](https://github.com/LTLA/chihaya-R) for saving [`DelayedArray`](https://bioconductor.org/packages/DelayedArray).

## Quick start

Usage is fairly simple once the HDF5 file is available.

```js
import * as scran from "scran.js";
import * as chihaya from "chihaya";
await scran.initialize(); // may need localFile: true for old Node.js versions.
let mat = await chihaya.load(path_to_file, name_of_group);
```

This produces a [`ScranMatrix`](https://jkanche.com/scran.js/ScranMatrix.html) that can be queried or used in **scran.js** functions:

```js
let ncols = mat.numberOfColumns();
let first_row = mat.row(0);
let normed = scran.logNormCounts(mat);
```

Note that on browsers, the HDF5 file should be saved to the virtual filesystem using `scran.writeFile()`.

## Supported operations

Support for the **chihaya** specification is not yet complete, so only a subset of delayed operations are recognized:

- Unary arithmetic (i.e., where only one of the operands is a delayed matrix)
- Some of the unary math - `log`, `exp`, `log1p`, `sqrt`, `abs` and `round`.
- Combining by row, column
- Subsetting by row, column
- Transposition
- Dimnames assignment (which is silently ignored)

Similarly, only a subset of arrays are supported:

- Dense arrays in non-native storage
- Compressed sparse column matrices

## Developer notes

This package compiles the **chihaya** C++ library to WebAssembly for testing purposes only.
Building the Wasm binary requires the [Emscripten toolchain](https://emscripten.org) and a recent version of [CMake](https://cmake.org).
Once these are installed, we can simply do:

```sh
./build.sh 
```

Testing usually involves some combination of Node flags to enable Wasm support, see the `package.json` for more details.
