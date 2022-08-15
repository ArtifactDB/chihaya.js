import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await scran.initialize({ localFile: true }); });
afterAll(async () => { await scran.terminate() });

test("dense loaders work as expected", () => {
    const path = utils.testdir + "/test-dense.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "array");
    ghandle.writeAttribute("delayed_array", "String", [], "dense array");

    // Note that we're transposed here, as native = 0.
    // So, the shape is [ncol, nrow].
    let shape = [10, 5];
    let content = [];
    for (var r = 0; r < shape[1]; r++) {
        for (var c = 0; c < shape[0]; c++) {
            content.push(Math.random());
        }
    }

    ghandle.writeDataSet("data", "Float64", shape, content);
    ghandle.writeDataSet("native", "Uint8", [], 0);

    // Now seeing if we can read it.
    let mat = chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(5);
    expect(mat.numberOfColumns()).toBe(10);
    expect(Array.from(mat.column(0))).toEqual(content.slice(0, 5));
    expect(Array.from(mat.column(9))).toEqual(content.slice(45, 50));

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
