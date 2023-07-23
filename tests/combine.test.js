import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize() });
afterAll(async () => { await utils.terminate() });

test("combine loader works as expected with columns", async () => {
    const path = utils.testdir + "/test-combine.h5";
    utils.purge(path);

    let fhandle = scran.createNewHdf5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "combine");
    ghandle.writeDataSet("along", "Int32", null, 1);

    let lhandle = ghandle.createGroup("seeds");
    lhandle.writeAttribute("delayed_type", "String", null, "list");
    lhandle.writeAttribute("delayed_length", "Int32", null, 2);
    let NR = 20;

    let dhandle1 = lhandle.createGroup("0");
    let NC1 = 5;
    let content1 = utils.dump_dense(dhandle1, NR, NC1);

    let dhandle2 = lhandle.createGroup("1");
    let NC2 = 3;
    let content2 = utils.dump_dense(dhandle2, NR, NC2);
    utils.validate(path, "foo");

    // Checking if we can load it.
    let mat = await chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(NC1 + NC2);

    expect(Array.from(mat.column(0))).toEqual(content1.slice(0, NR));
    expect(Array.from(mat.column(NC1 - 1))).toEqual(content1.slice((NC1 - 1) * NR, NC1 * NR));
    expect(Array.from(mat.column(NC1))).toEqual(content2.slice(0, NR));
    expect(Array.from(mat.column(NC1 + NC2 - 1))).toEqual(content2.slice((NC2 - 1) * NR, NC2 * NR));

    mat.free();
})

test("combine loader works as expected with rows", async () => {
    const path = utils.testdir + "/test-combine.h5";
    utils.purge(path);

    let fhandle = scran.createNewHdf5File(path);
    let ghandle = fhandle.createGroup("foo");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "combine");
    ghandle.writeDataSet("along", "Int32", null, 0);

    let lhandle = ghandle.createGroup("seeds");
    lhandle.writeAttribute("delayed_type", "String", null, "list");
    lhandle.writeAttribute("delayed_length", "Int32", null, 2);
    let NC = 11;

    let dhandle1 = lhandle.createGroup("0");
    let NR1 = 15;
    let content1 = utils.dump_dense(dhandle1, NR1, NC);

    let dhandle2 = lhandle.createGroup("1");
    let NR2 = 13;
    let content2 = utils.dump_dense(dhandle2, NR2, NC);
    utils.validate(path, "foo");

    // Checking if we can load it.
    let mat = await chihaya.load(path, "foo");
    expect(mat.numberOfRows()).toBe(NR1 + NR2);
    expect(mat.numberOfColumns()).toBe(NC);

    expect(Array.from(mat.column(0))).toEqual([ ...content1.slice(0, NR1), ...content2.slice(0, NR2) ]);
    expect(Array.from(mat.column(NC - 1))).toEqual([ ...content1.slice((NC - 1) * NR1, NC * NR1), ...content2.slice((NC - 1) * NR2, NC * NR2) ]);

    mat.free();
})

