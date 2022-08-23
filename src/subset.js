import * as scran from "scran.js";
import * as utils from "./utils.js";

export async function load_subset(handle, loadFun) {
    let ihandle = handle.open("index");
    let indices = await utils.load_list(ihandle, { vectorsOnly: true });

    let x;
    try {
        x = await loadFun(handle.open("seed"));

        if (indices[0] !== null) {
            scran.subsetRows(x, indices[0], { inPlace: true });
        }

        if (indices[1] !== null) {
            scran.subsetColumns(x, indices[1], { inPlace: true });
        }

    } catch (e) {
        scran.free(x);
        throw e;
    }

    return x;
}

