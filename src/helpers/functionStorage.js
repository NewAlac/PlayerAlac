exports.clearStorage = () => {
    const idPanel = JSON.parse(window.localStorage.getItem('idPanel')),
        basePath = JSON.parse(window.localStorage.getItem('basePath')),
        pathMedia = JSON.parse(window.localStorage.getItem('pathMedia'));

    window.localStorage.clear();

    window.localStorage.setItem('pathMedia', JSON.stringify(pathMedia))
    window.localStorage.setItem('basePath', JSON.stringify(basePath))
    window.localStorage.setItem('idPanel', JSON.stringify(idPanel))
}

exports.setPrograms = async (JsonProgram, JsonData, nSlots, maxRows) => {
    window.localStorage.setItem('JSONProgram', JSON.stringify(JsonProgram))
    window.localStorage.setItem('JSONDta', JSON.stringify(JsonData))
    window.localStorage.setItem('nSlots', JSON.stringify(nSlots))
    window.localStorage.setItem('maxRows', JSON.stringify(maxRows))
}

exports.setProgramsActomatic = async (JsonProgram, JsonData, nSlots, maxRows) => {
    this.setPrograms(JsonProgram, JsonData, nSlots, maxRows)
    window.localStorage.setItem('demon', JSON.stringify(false))
    window.localStorage.setItem("validateChange", JSON.stringify(false));
    window.localStorage.setItem('statusUpdate', JSON.stringify(false));
}

exports.setsPositions = async (pColumn, pRow, pcolumnActual, pRowActual) => {
    window.localStorage.setItem("pColumn", JSON.stringify(pColumn))
    window.localStorage.setItem('pRow', JSON.stringify(pRow))
    window.localStorage.setItem('pcolumnActual', JSON.stringify(pcolumnActual))
    window.localStorage.setItem("pRowActual", JSON.stringify(pRowActual))
}

exports.setPositions = (pColumn, pRow) => {
    window.localStorage.setItem("pColumn", JSON.stringify(pColumn))
    window.localStorage.setItem('pRow', JSON.stringify(pRow))
}

exports.setsHomeAndPlayer = (pathMedia, basePath, id, pathJson, demon) => {
    window.localStorage.setItem('pathMedia', JSON.stringify(pathMedia))
    window.localStorage.setItem('basePath', JSON.stringify(basePath))
    window.localStorage.setItem('idPanel', JSON.stringify(id))
    window.localStorage.setItem('pathJson', JSON.stringify(pathJson))
    window.localStorage.setItem('demon', JSON.stringify(false))
    window.localStorage.setItem("validateChange", JSON.stringify(false));
    window.localStorage.setItem('statusUpdate', JSON.stringify(false));
}

exports.setStorageReportAndPositionsPlayed = async (positionsPlayed) => {
    window.localStorage.setItem('positionsPlayed', JSON.stringify(positionsPlayed));
}

exports.setLastPlayed = async (lastPlayed, lastPlayedSame) => {
    window.localStorage.setItem('lastPlayed', JSON.stringify(lastPlayed))
    window.localStorage.setItem('lastPlayedSame', JSON.stringify(lastPlayedSame))
}