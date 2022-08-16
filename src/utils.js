import * as scran from "scran.js";

export function load_list(handle, { vectorsOnly = true, loadFun = null } = {}) {
    if (handle.attributes.indexOf("delayed_type") == -1) {
        throw new Error("expected a 'delayed_type' attribute to be present for lists");
    }
    if (handle.readAttribute("delayed_type").values[0] != "list") {
        throw new Error("'delayed_type' attribute should be 'list' for lists");
    }

    if (handle.attributes.indexOf("delayed_length") == -1) {
        throw new Error("expected a 'delayed_length' attribute to be present for lists");
    }
    let n = handle.readAttribute("delayed_length").values[0];
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
