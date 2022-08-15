import * as simple from "./simple.js";
import * as scran from "scran.js";

export function load(file, path) {
    let handle = new scran.H5Group(file, path);

    if (handle.attributes.indexOf("delayed_type") == -1) {
        throw new Error("expected a 'delayed_type' attribute");
    }
    let type = handle.readAttribute("delayed_type");

    if (type.values[0] == "operation") {
        if (handle.attributes.indexOf("delayed_operation") == -1) {
            throw new Error("expected a 'delayed_operation' attribute");
        }
        let op = handle.readAttribute("delayed_operation");

    } else if (type.values[0] == "array") {
        if (handle.attributes.indexOf("delayed_array") == -1) {
            throw new Error("expected a 'delayed_array' attribute");
        }
        let arr = handle.readAttribute("delayed_array");

        if (arr.values[0] == "dense array") {
            return simple.load_dense_array(handle);
        } else if (arr.values[0] == "sparse matrix") {
            return simple.load_csparse_matrix(handle);
        } else {
            // TODO: see if a fallback exists.
        }

    } else {
        throw new Error("unknown value for the 'delayed_type' attribute");
    }
}
