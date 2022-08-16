import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize(); });
afterAll(async () => { await utils.terminate() });

test("unary arith loader works for scalars", () => {
    const path = utils.testdir + "/test-unary-arith.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "unary arithmetic");

    ghandle.writeDataSet("method", "String", null, "+");
    ghandle.writeDataSet("value", "Float64", null, 1.1);
    ghandle.writeDataSet("side", "String", null, "right");

    let dhandle = ghandle.createGroup("seed");
    let NR = 11;
    let NC = 13;
    let content = utils.dump_dense(dhandle, NR, NC);
    utils.validate(path, "foo");

    // Let's try loading it in.
    {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map(x => x + 1.1);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map(x => x + 1.1);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);

        mat.free();
    }

    // Mutating it to a negative on the left side.
    {
        let mhandle = ghandle.open("method");
        mhandle.write("-");

        let shandle = ghandle.open("side");
        shandle.write("left");

        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map(x => 1.1 - x);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map(x => 1.1 - x);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);

        mat.free();
    }
})

test("unary arith loader works for vectors on rows", () => {
    const path = utils.testdir + "/test-unary-arith.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "unary arithmetic");

    ghandle.writeDataSet("method", "String", null, "*");
    ghandle.writeDataSet("along", "Uint8", null, 0);
    let shandle = ghandle.createDataSet("side", "String", []);
    shandle.write("left");

    let dhandle = ghandle.createGroup("seed");
    let NR = 11;
    let NC = 13;
    let content = utils.dump_dense(dhandle, NR, NC);

    let values = [];
    for (var r = 0; r < NR; ++r) {
        values.push(r + 1);
    }
    ghandle.writeDataSet("value", "Float64", null, values);
    utils.validate(path, "foo");

    // Let's try loading it in.
    {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map((x, i) => x * values[i]);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map((x, i) => x * values[i]);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);

        mat.free();
    }

    // Mutating it to a negative on the left side.
    {
        let mhandle = ghandle.open("method");
        mhandle.write("/");

        let shandle = ghandle.open("side");
        shandle.write("right");

        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map((x, i) => x / values[i]);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map((x, i) => x / values[i]);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);

        mat.free();
    }
})

test("unary arith loader works for vectors on columns", () => {
    const path = utils.testdir + "/test-unary-arith.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "unary arithmetic");

    ghandle.writeDataSet("method", "String", null, "*");
    ghandle.writeDataSet("along", "Uint8", null, 1);
    let shandle = ghandle.createDataSet("side", "String", []);
    shandle.write("left");

    let dhandle = ghandle.createGroup("seed");
    let NR = 11;
    let NC = 13;
    let content = utils.dump_dense(dhandle, NR, NC);

    let values = [];
    for (var c = 0; c < NC; ++c) {
        values.push(c);
    }
    ghandle.writeDataSet("value", "Float64", null, values);
    utils.validate(path, "foo");

    // Let's try loading it in.
    {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map((x, i) => x * values[0]);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map((x, i) => x * values[NC - 1]);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);

        mat.free();
    }

    // Mutating it to a negative on the left side.
    {
        let mhandle = ghandle.open("method");
        mhandle.write("-");

        let shandle = ghandle.open("side");
        shandle.write("right");

        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map((x, i) => x - values[0]);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map((x, i) => x - values[NC - 1]);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);

        mat.free();
    }
})

test("unary arith loader works with no values", () => {
    const path = utils.testdir + "/test-unary-arith.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "unary arithmetic");

    ghandle.writeDataSet("method", "String", null, "+");
    ghandle.writeDataSet("side", "String", null, "none");

    let dhandle = ghandle.createGroup("seed");
    let NR = 11;
    let NC = 13;
    let content = utils.dump_dense(dhandle, NR, NC);
    utils.validate(path, "foo");

    {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);
    }

    // Works with negation.
    let mhandle = ghandle.open("method");
    mhandle.write("-");
    utils.validate(path, "foo");

    {
        let mat = chihaya.load(path, "foo");
        expect(mat.numberOfRows()).toBe(NR);
        expect(mat.numberOfColumns()).toBe(NC);

        let expected_first = content.slice(0, NR).map(x => -x);
        expect(Array.from(mat.column(0))).toEqual(expected_first);
        let expected_last = content.slice(NR * (NC - 1), NR * NC).map(x => -x);
        expect(Array.from(mat.column(NC - 1))).toEqual(expected_last);
    }
})
