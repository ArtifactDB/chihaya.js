import * as fs from "fs";
import loadChihaya from "../wasm/final/chihaya.js";
import * as scran from "scran.js";

export const testdir = "hdf5-test-files";
if (!fs.existsSync(testdir)) {
    fs.mkdirSync(testdir);
}

export function purge(path) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

export function dump_dense(handle, nrow, ncol) {
    handle.writeAttribute("delayed_type", "String", [], "array");
    handle.writeAttribute("delayed_array", "String", [], "dense array");

    // Note that we're transposed here, as native = 0.
    // So, the shape is [ncol, nrow].
    let content = [];
    for (var r = 0; r < nrow; r++) {
        for (var c = 0; c < ncol; c++) {
            content.push(Math.random());
        }
    }

    handle.writeDataSet("data", "Float64", [ncol, nrow], content);
    handle.writeDataSet("native", "Uint8", [], 0);

    return content;
}

export function almost_equal(vec1, vec2) {
    if (vec1.length !== vec2.length) {
        return false;
    }

    for (var i = 0; i < vec1.length; i++) {
        let x1 = vec1[i];
        let x2 = vec2[i];
        if (Math.abs(x1 - x2) > (Math.abs(x1) + Math.abs(x2) + 1e-5) * 1e-8) {
            return false;
        }
    }

    return true;
}

var cache = {};

export async function initialize({ localFile = true } = {}) {
    await scran.initialize({ localFile: localFile });

    let options = {};
    if (localFile) {
        options.locateFile = (x) => import.meta.url.substring(7) + "/../../wasm/final/" + x;
    }

    cache.module = await loadChihaya(options);
}

export async function terminate() {
    await scran.terminate();
}

export function validate(path, name) {
    try {
        cache.module.validate(path, name);
    } catch (e) {
        if (typeof e == "number") {
            let err = cache.module.get_error_message(e);
            throw new Error(err);
        } else {
            throw e;
        }
    }
}
