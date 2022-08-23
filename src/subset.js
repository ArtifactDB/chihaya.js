import * as scran from "scran.js";
import * as utils from "./utils.js";
import { loadHandle } from "./load.js";

export async function load_subset(handle) {
    let ihandle = handle.open("index");
    let indices = utils.load_vectors(ihandle);

    let x;
    try {
        x = await loadHandle(handle.open("seed"));

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

