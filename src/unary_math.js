import * as scran from "scran.js";

export async function load_unary_math(handle, loadFun) {
    let method = handle.open("method", { load: true }).values[0];

    let logbase = null;
    if (method == "log" && "base" in handle.children) {
        logbase = handle.open("base", { load: true }).values[0];
    }

    let shandle = handle.open("seed");
    let mat = await loadFun(shandle);
    try {
        scran.delayedMath(mat, method, { logBase: logbase, inPlace: true });
    } catch (e) {
        scran.free(mat);
        throw e;
    }

    return mat;
}
