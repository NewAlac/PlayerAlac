
exports.eliminarObjetosDuplicados = (arr, prop) => {
    let nuevoArray = [];
    let lookup  = {};

    for (let i in arr) {
        lookup[arr[i][prop]] = arr[i];
    }

    for (i in lookup) {
        nuevoArray.push(lookup[i]);
    }
    if(arr.length / 2)

    return nuevoArray;
}