import * as scran from "scran.js";

export function load_list(handle, { vectorsOnly = true, loadFun = null } = {}) {
    if (handle.attributes.indexOf("length") == -1) {
        throw new Error("expected a 'length' attribute to be present for lists");
    }

    let n = handle.readAttribute("length").values[0];
    let output = [];

    try {
        for (var i = 0; i < n; i++) {
            let child = String(i);

            if (child in handle.children) {
                if (vectorsOnly) {
                    let contents = handle.open(child, { load: true }).values;
                    output.push(contents);
                } else {
                    let chandle = handle.open(child);
                    output.push(loadFun(chandle));
                }
            } else {
                output.push(null);
            }
        }
    } catch (e) {
        if (!vectorsOnly) {
            for (const s of output) {
                scran.free(s);
            }
        }
    }

    return output;
}
