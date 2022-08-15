import * as scran from "scran.js";
import * as utils from "./utils.js";

export function load_combine(handle, loadFun) {
    let along = handle.open("along", { load: true }).values[0];
    let output;

    let shandle = handle.open("seeds");
    let seeds = utils.load_list(shandle, { vectorsOnly: false, loadFun: loadFun });
    console.log(seeds);
    try {
        if (along == 0) {
            throw new Error("delayed row binding is not yet supported");
        } else {
            output = scran.cbind(seeds);
        }
    } finally {
        // Don't need the individual entities once loaded.
        for (const s of seeds) {
            scran.free(s);
        }
    }

    return output;
}

