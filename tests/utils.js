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
