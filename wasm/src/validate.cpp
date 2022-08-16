#include "emscripten/bind.h"
#include "chihaya/chihaya.hpp"

void validate(std::string path, std::string name) {
    chihaya::validate(path, name);
    return; 
}

std::string get_error_message(intptr_t ptr) {
  return std::string(reinterpret_cast<std::exception*>(ptr)->what());
}

EMSCRIPTEN_BINDINGS(Bindings) {
  emscripten::function("validate", &validate);
  emscripten::function("get_error_message", &get_error_message);
};

