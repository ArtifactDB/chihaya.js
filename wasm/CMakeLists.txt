cmake_minimum_required(VERSION 3.14)

project(chihaya_wasm
    VERSION 1.0.0
    DESCRIPTION "Validating the chihaya.js test files"
    LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)

# Emscripten downloads the zlib headers for easy inclusion, but only after the
# first use of USE_ZLIB=1. On a pristine system, these headers won't be
# available for creation of the emcc'd object files. As such,we have to arrange
# for them to be downloaded first by calling emcc manually.
include(CheckIncludeFiles)
check_include_files(zlib.h HAVE_ZLIB_H)
if (NOT HAVE_ZLIB_H)
    set(ZLIB_DIR "${CMAKE_CURRENT_BINARY_DIR}/zlib")
    file(MAKE_DIRECTORY ${ZLIB_DIR})
    execute_process(COMMAND touch dummy.cpp WORKING_DIRECTORY ${ZLIB_DIR})
    execute_process(COMMAND ${CMAKE_CXX_COMPILER} dummy.cpp -s USE_ZLIB=1 -o dummy.html WORKING_DIRECTORY ${ZLIB_DIR})
endif()

include(FetchContent)
FetchContent_Declare(
  chihaya
  GIT_REPOSITORY https://github.com/LTLA/chihaya
  GIT_TAG e8d641d0bdf8e205d1a274e105d0e65397361bc4
)
FetchContent_MakeAvailable(chihaya)

FetchContent_Declare(
  h5wasm
  URL https://github.com/kanaverse/libhdf5-wasm/releases/download/v0.3.0_3.1.43/libhdf5-1_12_2-wasm.tar.gz
  URL_HASH SHA256=b2e58b102fe98326c77f1a160025c47a062c1a205818568680d5f5ed78df801c
)
FetchContent_MakeAvailable(h5wasm)

add_executable(
    chihaya_wasm 
    src/validate.cpp
)

target_compile_options(
    chihaya_wasm PUBLIC -O3 -fexceptions
)

target_link_libraries(
    chihaya_wasm
    chihaya
    hdf5-wasm-cpp
)

set_target_properties(chihaya_wasm PROPERTIES 
    OUTPUT_NAME chihaya
    LINK_FLAGS "-O3 --bind -fexceptions -s ALLOW_MEMORY_GROWTH=1 -s MAXIMUM_MEMORY=4GB -s USE_ZLIB=1 -s MODULARIZE=1 -s EXPORT_NAME=loadChihaya -s EXPORT_ES6"
)

# Using the Node FS API for HDF5 access.
set_property(TARGET chihaya_wasm APPEND APPEND_STRING PROPERTY LINK_FLAGS " -s ENVIRONMENT=node -s NODERAWFS=1 -s FORCE_FILESYSTEM=1")
