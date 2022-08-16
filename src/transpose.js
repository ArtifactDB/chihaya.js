import * as scran from "scran.js";
import * as utils from "./utils.js";

export function load_transpose(handle, loadFun) {
    let aperm = handle.open("permutation", { load: true }).values;
    let do_it = (aperm[0] == 1 && aperm[1] == 0);

    let output;
    try {
        let shandle = handle.open("seed");
        output = loadFun(shandle);
        if (do_it) {
            scran.transpose(output, { inPlace: true });
        }
    } catch (e) {
        scran.free(output);
        throw e;
    }

    return output;
}
