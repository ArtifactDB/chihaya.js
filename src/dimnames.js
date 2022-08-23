import { loadHandle } from "./load.js";

export function load_dimnames(handle) {
    // No-op as we don't hold onto dimnames anyway.
    let shandle = handle.open("seed");
    return loadHandle(shandle);
}
