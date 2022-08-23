export var array_overrides = {};
export var operation_overrides = {};

function registerHandler(key, handler, overrides) {
    if (key in overrides) {
        let old = overrides[key];
        if (handler == null){
            delete overrides[key];
        } else {
            overrides[key] = handler;
        }
        return old;
    }

    if (handler !== null) {
        overrides[key] = handler;
    }
    return null;
}

/**
 * Get or set custom handlers for arrays in a **chihaya**-formatted HDF5 file.
 *
 * @param {string} array - Type of the delayed array, matched against the `delayed_array` attribute.
 * @param {?function} handler - Handler function that accepts a HDF5 group handle (corresponding to the array) and returns a ScranMatrix object.
 * If `null`, any custom handler was previously registered will be removed.
 *
 * @return {?function} The previously registered handler function, or `null` if no handler was previously registered.
 */
export function registerArrayHandler(array, handler) {
    return registerHandler(array, handler, array_overrides);
}

/**
 * Get or set custom handlers for delayed operations in a **chihaya**-formatted HDF5 file.
 *
 * @param {string} operation - Type of the delayed operation, matched against the `delayed_operation` attribute.
 * @param {?function} handler - Handler function that accepts:
 *
 * - A HDF5 group handle, corresponding to the delayed operation.
 * - A loader function to be applied to any delayed seeds in the operation.
 * 
 * The handler function should then return a ScranMatrix object.
 * If `null`, any custom handler was previously registered will be removed.
 *
 * @return {?function} The previously registered handler function, or `null` if no handler was previously registered.
 */
export function registerOperationHandler(operation, handler) {
    return registerHandler(operation, handler, operation_overrides);
}
