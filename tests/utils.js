import * as fs from "fs";

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
