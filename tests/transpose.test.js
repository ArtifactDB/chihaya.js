import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize(); });
afterAll(async () => { await utils.terminate() });

test("transpose loaders work as expected", async () => {
    const path = utils.testdir + "/test-transpose.h5";
    utils.purge(path);

    let fhandle = scran.createNewHdf5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "transpose");
    ghandle.writeDataSet("permutation", "Int32", null, [1, 0]);

    let shandle = ghandle.createGroup("seed");
    let NR = 12;
    let NC = 11;
    let content = utils.dump_dense(shandle, NR, NC);
    utils.validate(path, "foo");

    let mat = await chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NC);
    expect(mat.numberOfColumns()).toBe(NR);
    
    expect(Array.from(mat.row(0))).toEqual(content.slice(0, NR));
    expect(Array.from(mat.row(NC-1))).toEqual(content.slice(NR * (NC - 1), NR * NC));
    mat.free();

    // Except when permutatino is a no-op.
    let phandle = ghandle.open("permutation");
    phandle.write([0, 1]);

    mat = await chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(NC);
    
    expect(Array.from(mat.column(0))).toEqual(content.slice(0, NR));
    expect(Array.from(mat.column(NC-1))).toEqual(content.slice(NR * (NC - 1), NR * NC));
    mat.free();
})
