import * as scran from "scran.js";
import * as chihaya from "../src/index.js";
import * as utils from "./utils.js";

beforeAll(async () => { await utils.initialize() });
afterAll(async () => { await utils.terminate() });

test("dimname loader works as expected", async () => {
    const path = utils.testdir + "/test-combine.h5";
    utils.purge(path);

    let fhandle = scran.createNewHdf5File(path);
    let ghandle = fhandle.createGroup("blah");
    ghandle.writeAttribute("delayed_type", "String", [], "operation");
    ghandle.writeAttribute("delayed_operation", "String", [], "dimnames");

    let dhandle = ghandle.createGroup("seed");
    let NR = 20;
    let NC = 15;
    let content = utils.dump_dense(dhandle, NR, NC);

    // Adding dimnames.
    let ihandle = ghandle.createGroup("dimnames");
    ihandle.writeAttribute("delayed_type", "String", null, "list");
    ihandle.writeAttribute("delayed_length", "Int32", null, 2);

    let dummy_names = [];
    for (var i = 0; i < NR; i++) {
        dummy_names.push("GENE_" + String(i+1));
    }
    ihandle.writeDataSet("0", "String", null, dummy_names);

    // Checking if we can load it.
    let mat = await chihaya.load(path, "blah");
    expect(mat.numberOfRows()).toBe(NR);
    expect(mat.numberOfColumns()).toBe(NC);

    mat.free();
})
