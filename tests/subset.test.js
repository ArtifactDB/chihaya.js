import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await scran.initialize({ localFile: true }); });
afterAll(async () => { await scran.terminate() });

test("subset loader works as expected with rows", () => {
    const path = utils.testdir + "/test-subset.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "subset");

    // Adding subsetting information on the rows.
    let ihandle = ghandle.createGroup("index");
    let rowsub = [5, 19, 2, 7, 11];
    ihandle.writeDataSet("0", "Int32", null, rowsub);
    ihandle.writeAttribute("length", "Int32", null, 2);

    let dhandle = ghandle.createGroup("seed");
    let NR = 20;
    let NC = 15;
    let content = utils.dump_dense(dhandle, NR, NC);

    // Checking that we can load it in.
    let mat = chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(rowsub.length);
    expect(mat.numberOfColumns()).toBe(NC);

    let ex_col_first = rowsub.map(r => content[r]);
    expect(Array.from(mat.column(0))).toEqual(ex_col_first);
    let ex_col_last = rowsub.map(r => content[NR * (NC - 1) + r]);
    expect(Array.from(mat.column(NC - 1))).toEqual(ex_col_last);

    mat.free();
})

test("subset loader works as expected with columns", () => {
    const path = utils.testdir + "/test-subset.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "subset");

    // Adding subsetting information on the rows.
    let ihandle = ghandle.createGroup("index");
    let colsub = [1, 3, 5, 10];
    ihandle.writeDataSet("1", "Int32", null, colsub);
    ihandle.writeAttribute("length", "Int32", null, 2);

    let dhandle = ghandle.createGroup("seed");
    let NR = 11;
    let NC = 15;
    let content = utils.dump_dense(dhandle, NR, NC);

    // Checking that we can load it in.
    let mat = chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(colsub.length);

    let firstcol = colsub[0];
    let ex_col_first = content.slice(firstcol * NR, (firstcol + 1) * NR);
    expect(Array.from(mat.column(0))).toEqual(ex_col_first);
    let lastcol = colsub[colsub.length - 1];
    let ex_col_last = content.slice(lastcol * NR, (lastcol + 1) * NR);
    expect(Array.from(mat.column(colsub.length - 1))).toEqual(ex_col_last);

    mat.free();
})

test("subset loader works as expected with both rows and columns", () => {
    const path = utils.testdir + "/test-subset.h5";
    utils.purge(path);

    let fhandle = scran.createNewHDF5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "subset");

    // Adding subsetting information on the rows.
    let ihandle = ghandle.createGroup("index");
    let rowsub = [8, 6, 4, 2, 0];
    ihandle.writeDataSet("0", "Int32", null, rowsub);
    let colsub = [9, 7, 5, 3, 1];
    ihandle.writeDataSet("1", "Int32", null, colsub);
    ihandle.writeAttribute("length", "Int32", null, 2);

    let dhandle = ghandle.createGroup("seed");
    let NR = 10;
    let NC = 10;
    let content = utils.dump_dense(dhandle, NR, NC);

    // Checking that we can load it in.
    let mat = chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(rowsub.length);
    expect(mat.numberOfColumns()).toBe(colsub.length);

    let firstcol = colsub[0];
    let ex_col_first = rowsub.map(r => content[r + firstcol * NR]);
    expect(Array.from(mat.column(0))).toEqual(ex_col_first);
    let lastcol = colsub[colsub.length - 1];
    let ex_col_last = rowsub.map(r => content[r + lastcol * NR]);
    expect(Array.from(mat.column(colsub.length - 1))).toEqual(ex_col_last);

    mat.free();
})
