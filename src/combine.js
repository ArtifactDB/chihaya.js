import * as scran from "scran.js";
import * as utils from "./utils.js";

export async function load_combine(handle, loadFun) {
    let along = handle.open("along", { load: true }).values[0];
    let output;

    let shandle = handle.open("seeds");
    let n = utils.check_list(shandle);

    let seeds = [];
    try {
        for (var i = 0; i < n; i++) {
            let chandle = shandle.open(String(i));
            seeds.push(await loadFun(chandle));
        }

        if (along == 0) {
            output = scran.rbind(seeds);
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
