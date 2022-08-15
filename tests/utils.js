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
