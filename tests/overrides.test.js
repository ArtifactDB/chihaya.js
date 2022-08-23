import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as simple from "../src/simple.js";
import * as transpose from "../src/transpose.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize(); });
afterAll(async () => { await utils.terminate() });

test("array overrides work as expected", () => {
    const path = utils.testdir + "/test-dense.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");

    let NR = 5;
    let NC = 10;
    let content = utils.dump_dense(ghandle, NR, NC);
    utils.validate(path, "foo");

    let tripped = [];
    let old = chihaya.registerArrayHandler("dense array", handle => {
        tripped.push(handle.name);
        return simple.load_dense_array(handle);
    });
    expect(old).toBe(null);

    // Now seeing if we can read it.
    try {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);
        expect(tripped[0]).toBe("foo");
        mat.free();
    } finally {
        chihaya.registerArrayHandler("dense_array", old);
    }
})

test("operation overrides work as expected", () => {
    const path = utils.testdir + "/test-transpose.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "transpose");
    ghandle.writeDataSet("permutation", "Int32", null, [1, 0]);

    let shandle = ghandle.createGroup("seed");
    let NR = 12;
    let NC = 11;
    let content = utils.dump_dense(shandle, NR, NC);
    utils.validate(path, "foo");

    let tripped = [];
    let old = chihaya.registerOperationHandler("transpose", (handle, loader) => {
        tripped.push(handle.name);
        return transpose.load_transpose(handle, loader);
    });
    expect(old).toBe(null);

    try {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NC);
        expect(mat.numberOfColumns()).toBe(NR);
        expect(tripped[0]).toBe("foo");
        mat.free();
    } finally {
        chihaya.registerOperationHandler("transpose", old);
    }
})
