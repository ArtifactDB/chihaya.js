import * as scran from "scran.js";

export function load_dense_array(handle) {
    let dhandle = handle.open("data", { load: true });
    let arr = dhandle.values;
    let shape = dhandle.shape;

    // By default, fastest changing dimension (i.e. rows) is last in HDF5.
    // TODO: handle the native case with row-major storage.
    let mat = scran.initializeDenseMatrixFromDenseArray(shape[1], shape[0], arr);

    return mat;
}

var create_layered = true;

export function sparseLayered(layered = null) {
    if (layered == null) {
        return create_layered;
    } else {
        let old = create_layered;
        create_layered = layered;
        return old;
    }
}

export function load_csparse_matrix(handle) {
    let raw = scran.initializeSparseMatrixFromHDF5(handle.file, handle.name, { layered: sparseLayered() });
    let mat = raw.matrix;

    if (raw.row_ids !== null) {
        // Restoring the order, which is easier than carrying a custom order
        // throughout the various delayed layers.
        let new_ids = new Int32Array(mat.numberOfRows());
        raw.row_ids.forEach((x, i) => {
            new_ids[x] = i;
        });
        scran.subsetRows(mat, new_ids, { inPlace: true });
    }

    return mat;
}
