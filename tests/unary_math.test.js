import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize(); });
afterAll(async () => { await utils.terminate() });

test("unary math loader works for most things", async () => {
    const path = utils.testdir + "/test-unary-math.h5";
    utils.purge(path);

    let fhandle = scran.createNewHdf5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "unary math");

    ghandle.writeDataSet("method", "String", null, "sqrt");
    let dhandle = ghandle.createGroup("seed");
    let NR = 7;
    let NC = 8;
    let content = utils.dump_dense(dhandle, NR, NC);
    utils.validate(path, "foo");

    // Let's try loading it in.
    let mat = await chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(NC);

    let expected_first = content.slice(0, NR).map(Math.sqrt);
    expect(utils.almost_equal(mat.column(0), expected_first)).toBe(true);
    let expected_last = content.slice(NR * (NC - 1), NR * NC).map(Math.sqrt);
    expect(utils.almost_equal(mat.column(NC - 1), expected_last)).toBe(true);

    mat.free();
})

test("unary math loader works for log", async () => {
    const path = utils.testdir + "/test-unary-math.h5";
    utils.purge(path);

    let fhandle = scran.createNewHdf5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "unary math");

    ghandle.writeDataSet("method", "String", null, "log");
    let dhandle = ghandle.createGroup("seed");
    let NR = 7;
    let NC = 8;
    let content = utils.dump_dense(dhandle, NR, NC);
    utils.validate(path, "foo");

    // Let's try loading it in.
    {
        let mat = await chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map(Math.log);
        expect(utils.almost_equal(mat.column(0), expected_first)).toBe(true);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map(Math.log);
        expect(utils.almost_equal(mat.column(NC - 1), expected_last)).toBe(true);

        mat.free();
    }

    // Adding a base.
    {
        ghandle.writeDataSet("base", "Float64", null, 10);

        let mat = await chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map(Math.log10);
        expect(utils.almost_equal(mat.column(0), expected_first)).toBe(true);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map(Math.log10);
        expect(utils.almost_equal(mat.column(NC - 1), expected_last)).toBe(true);

        mat.free();
    }
})
