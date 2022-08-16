import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize(); });
afterAll(async () => { await utils.terminate() });

test("dense loaders work as expected", () => {
    const path = utils.testdir + "/test-dense.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");

    let NR = 5;
    let NC = 10;
    let content = utils.dump_dense(ghandle, NR, NC);
    utils.validate(path, "foo");

    // Now seeing if we can read it.
    let mat = chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(NC);
    expect(Array.from(mat.column(0))).toEqual(content.slice(0, NR));
    expect(Array.from(mat.column(9))).toEqual(content.slice(NR * (NC - 1), NR * NC));

    mat.free();
})

test("sparse loaders work as expected", () => {
    const path = utils.testdir + "/test-sparse.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "array");
    ghandle.writeAttribute("delayed_array", "String", [], "sparse matrix");

    let NC = 21;
    let NR = 17;
    let x = [];
    let i = [];
    let p = [0];
    let counter = 0;
    for (var c = 0; c < NC; c++) {
        for (var r = 0; r < NR; r++) {
            if (Math.random() < 0.2) {
                x.push(Math.round(Math.random() * 10));
                i.push(r);
                counter++;
            }
        }
        p.push(counter);
    }

    ghandle.writeDataSet("data", "Int32", null, x); 
    ghandle.writeDataSet("indices", "Int32", null, i); 
    ghandle.writeDataSet("indptr", "Int32", null, p); 
    ghandle.writeDataSet("shape", "Int32", null, [NR, NC]); 
    utils.validate(path, "foo");

    // Now seeing if we can read it.
    let mat = chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(NC);

    let first_col = new Array(NR);
    first_col.fill(0);
    for (var v = p[0]; v < p[1]; v++) {
        first_col[i[v]] = x[v];
    }
    expect(Array.from(mat.column(0))).toEqual(first_col);

    let last_col = new Array(NR);
    last_col.fill(0);
    for (var v = p[NC-1]; v < p[NC]; v++) {
        last_col[i[v]] = x[v];
    }
    expect(Array.from(mat.column(NC - 1))).toEqual(last_col);

    mat.free();
})
