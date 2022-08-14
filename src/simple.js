import * as scran from "scran.js";

export function load_dense_array(handle, options = {}) {
    let arr = handle.load();
    let shape = handle.shape;

    // By default, fastest changing dimension (i.e. rows) is last in HDF5.
    // TODO: handle the native case with row-major storage.
    let mat = scran.initialize(shape[1], shape[0], arr);

    return mat;
}

export function load_csparse_matrix(handle, { layered = true } = {}) {
    let mat = scran.initializeSparseMatrixFromHDF5(handle.file, handle.name, { layered: layered });

    if (mat.isReorganized()) {
        // Restoring the order, which is easier than carrying a custom order
        // throughout the various delayed layers.
        let new_ids = new Int32Array(mat.numberOfRows());
        mat.identities().forEach((x, i) => {
            new_ids[x] = i;
        });
        scran.subsetRows(mat, new_ids, { inPlace: true });
    }

    return mat;
}
