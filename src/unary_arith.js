import * as scran from "scran.js";

export async function load_unary_arithmetic(handle, loadFun) {
    let method = handle.open("method", { load: true }).values[0];
    let side = handle.open("side", { load: true }).values[0];
    let mat;

    if (side == "none") {
        let shandle = handle.open("seed");
        mat = await loadFun(shandle);
        if (method == "-") {
             try {
                 scran.delayedArithmetic(mat, "*", -1, { inPlace: true });
             } catch (e) {
                 scran.free(mat);
                 throw e;
             }
        }

    } else {
        let right = (side == "right");

        let vhandle = handle.open("value", { load: true });
        let val = vhandle.values;
        if (vhandle.shape.length == 0) {
            val = val[0];
        }

        let along = "row";
        if ("along" in handle.children && handle.open("along", { load: true }).values[0] > 0) {
            along = "column";
        }

        let shandle = handle.open("seed");
        mat = await loadFun(shandle);
        try {
            scran.delayedArithmetic(mat, method, val, { right: right, along: along, inPlace: true });
        } catch (e) {
            scran.free(mat);
            throw e;
        }
    }

    return mat;
}
