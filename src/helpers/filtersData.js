const { remote } = require('electron')
const main = remote.require('./main')
const Path = require('path')
const DATATIME = require('../helpers/getDataTime');
const storage = require('./functionStorage');
const fs = require('fs');
const ws = require('../utils/websocket');

const http = require('../utils/http')

exports.filterFileNotExists = async (data, video, basepath) => {
    let filterV,
        validateFile = true,
        pathVideo,
        count = 0
    try {
        data.filter(function (e, i) {
            if (e['file_name'] == video) {
                if (data.length < i + 2) {
                    filterV = data[0]['file_name']
                } else {
                    filterV = data[i + 1]['file_name']
                }
                count++
            }
        })

        pathVideo = Path.resolve(basepath, `${filterV}`)
        validateFile = await main.fileExists(pathVideo)
        while (!validateFile) {
            let filt
            data.filter(async function (e, i) {
                if (e['file_name'] == filterV) {
                    if (data.length < i + 2) {
                        filt = data[0]['file_name']
                    } else {
                        filt = data[i + 1]['file_name']
                    }
                    count++
                }
            })
            pathVideo = Path.resolve(basepath, `${filt}`)
            validateFile = await main.fileExists(pathVideo)
            filterV = filt
        }
        return [filterV, count]
    } catch (error) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].file_name == video) {
                if (data.length < i + 2) {
                    filterV = data[0]['file_name']
                } else {
                    filterV = data[i + 1]['file_name']
                }
            }
        }
        return [filterV, 1]
    }
}

exports.filterVideos = async (data, basepath) => {
    const pathVideos = Path.resolve(basepath, "alac-player", "media")
    let notVideos = []

    for (let i = 0; i < data.length; i++) {
        const e = data[i];
        const pathVideo = Path.resolve(pathVideos, `${e.file_name}`)
        const validateFile = await main.fileExists(pathVideo)
        if (!validateFile) {
            notVideos.push(e)
        }
    }

    return notVideos

}

exports.searchDataVideo = async () => {
    let id, pRow, pColumn, dataMedia, validate, verify_position,
        countVerify = 0, countValidate = 0, countGlobal = 0, entra = false, validate_RepitSame = false;
    let pRowActual, pcolumnActual;
    let data_storage = [];
    let initNumber = 0;
    const maxRows = parseInt(JSON.parse(localStorage.getItem('maxRows')));
    pRowActual = parseInt(JSON.parse(localStorage.getItem('pRowActual')));
    pcolumnActual = parseInt(JSON.parse(localStorage.getItem('pcolumnActual')));
    pRow = pRowActual
    pColumn = pcolumnActual
    dataMedia = await searchData(pRow, pColumn)
    validate = await validateHour(dataMedia)
    verify_position = await validateNoRepit(pColumn, dataMedia.mediaId)
    try {
        verify_position;
        //console.log("verify_position",verify_position)
    } catch (error) {
        //console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
    }
    global_played = await validateNoRepitColumn(dataMedia.mediaId)


    while (!validate || !verify_position || !global_played) {
        // rest++

        pRow = parseInt(JSON.parse(localStorage.getItem('pRow')))

        if (!entra) {
            await setRowStorage(pRow)
        }

        pColumn = parseInt(JSON.parse(localStorage.getItem('pColumn')))
        // console.log(pRow, pColumn)
        dataMedia = await searchData(pRow, pColumn)
        validate = await validateHour(dataMedia)
        if (!entra) {
            verify_position = await validateNoRepit(pColumn, dataMedia.mediaId);
            global_played = await validateNoRepitColumn(dataMedia.mediaId)
        }
        if (!validate) {
            countValidate++
        }

        if (!global_played) {
            countGlobal++
        }

        if (countValidate >= maxRows) {
            initNumber++
            // console.log(initNumber)
            if (initNumber > (maxRows * 2)) {
                entra = true
                const pRowActual = parseInt(JSON.parse(localStorage.getItem('pRowActual')));
                localStorage.setItem("pRow", JSON.stringify(pRowActual))
                await setColumnStorage(pColumn)

            } else {
                entra = true
                verify_position = true
                validate = await validateHour(dataMedia)
                global_played = await validateNoRepitColumn(dataMedia.mediaId)
                if (global_played && validate) {
                    break;
                }
            }
        }

        if (countGlobal >= maxRows) {
            const nSlots = parseInt(JSON.parse(localStorage.getItem('nSlots')))
            if (nSlots == 1) {
                entra = true
                verify_position = true
                global_played = true
                validate = await validateHour(dataMedia)
                if (validate) {
                    break;
                }
            } else {
                // console.log("salto 2")
                validate_RepitSame = await validateRepitSame(dataMedia.categoryContentsID)
                if (validate_RepitSame) {
                    entra = true;
                    const pRowActual = parseInt(JSON.parse(localStorage.getItem('pRowActual')));
                    localStorage.setItem("pRow", JSON.stringify(pRowActual));
                    await setColumnStorage(pColumn);
                } else {
                    // console.log('aquii')
                    entra = true
                    verify_position = true
                    global_played = true
                    validate_RepitSame = true
                    validate = await validateHour(dataMedia)
                    if (validate) {
                        break;
                    }
                }
                // console.log("antes: ", validate_RepitSame)
                // console.log("salto 2")
                // await setColumnStorage(pColumn)
            }

        }

        if (!verify_position) {
            countVerify++
        }

        if (countVerify >= maxRows) {
            entra = true
            verify_position = true
            validate = await validateHour(dataMedia)
            global_played = await validateNoRepitColumn(dataMedia.mediaId)
            if (global_played && validate) {
                break;
            }
        }
    }

    // console.log(dataMedia.mediaId)

    id = JSON.parse(localStorage.getItem('idPanel'))

    const data_mediaId = {
        'mediaId': dataMedia.mediaId,
    };

    const categoryContentsID = {
        'categoryContentsID': dataMedia.categoryContentsID,
    };



    let report = {
        'idContent': dataMedia.contenidoId,
        'content': dataMedia.content_name,
        'idClient': dataMedia.clientId,
        'client': dataMedia.client_name,
        'idPlayer': dataMedia.playlistId,
        'player': dataMedia.playlist_name,
        'idSlot': dataMedia.c_slotId,
        'slot': dataMedia.slot_name,
    };

    await http.createReport(report)

    const isConnect = await http.getStatusExport();

    if (!isConnect) {
        localStorage.setItem('statusUpdate', JSON.stringify(true));
    }

    const statusUpdate = JSON.parse(localStorage.getItem('statusUpdate'));
    if (statusUpdate) {
        if (isConnect) {
            const id = JSON.parse(localStorage.getItem('idPanel'));
            localStorage.setItem('statusUpdate', JSON.stringify(false));
            ws.downloadContentsAutomaticExport(parseInt(id));
        }
    }

    data_storage = JSON.parse(localStorage.getItem('positionsPlayed'));

    data_storage[pcolumnActual].push([data_mediaId]);
    localStorage.setItem('positionsPlayed', JSON.stringify(data_storage));
    const positions = JSON.parse(localStorage.getItem('positionsPlayed'));
    if (positions[pcolumnActual].length > 1) {
        positions[pcolumnActual].shift();
    }

    await storage.setLastPlayed([data_mediaId], [categoryContentsID]);
    await storage.setStorageReportAndPositionsPlayed(positions);
    await setStorage(pRowActual, pColumn)
    //await setStorage(pRowActual, pcolumnActual)
    return dataMedia;

}

async function setRowStorage(pRow) {
    let maxRows = parseInt(JSON.parse(localStorage.getItem('maxRows')))
    if (maxRows - 1 <= pRow) {
        localStorage.setItem("pRow", JSON.stringify(0))
    } else {
        localStorage.setItem("pRow", JSON.stringify(pRow + 1))
    }
}

async function setColumnStorage(pColumn) {
    let nSlots = parseInt(JSON.parse(localStorage.getItem('nSlots')))
    if (nSlots - 1 <= pColumn) {
        localStorage.setItem("pColumn", JSON.stringify(0))
    } else {
        localStorage.setItem("pColumn", JSON.stringify(pColumn + 1))
    }
    // const pRowActual = parseInt(JSON.parse(localStorage.getItem('pRowActual')));
    // console.log(pRowActual)
    // localStorage.setItem("pRow", JSON.stringify(pRowActual))
}

async function setStorage(pRow, pColumn) {
    let maxRows = parseInt(JSON.parse(localStorage.getItem('maxRows'))),
        nSlots = parseInt(JSON.parse(localStorage.getItem('nSlots')));
    if (pColumn >= (nSlots - 1)) {
        localStorage.setItem("pColumn", JSON.stringify(0))
        localStorage.setItem("pcolumnActual", JSON.stringify(0))

        let validateChange = JSON.parse(localStorage.getItem('validateChange'))
        let val = false;
        if (pRow >= (maxRows - 1)) {
            if (validateChange) {
                val = await updateData()
                if (val) localStorage.setItem("validateChange", JSON.stringify(false))
            }
            await demonUpdata()
            localStorage.setItem("pRow", JSON.stringify(0))
            localStorage.setItem("pRowActual", JSON.stringify(0))
        } else {
            if (validateChange) {
                val = await updateData()
                if (val) localStorage.setItem("validateChange", JSON.stringify(false))
            }
            localStorage.setItem("pRow", JSON.stringify(pRow + 1))
            localStorage.setItem("pRowActual", JSON.stringify(pRow + 1))
        }
    } else {
        localStorage.setItem("pColumn", JSON.stringify(pColumn + 1))
        localStorage.setItem("pcolumnActual", JSON.stringify(pColumn + 1))
    }
}

async function searchData(pRow, pColumn) {
    // console.log(pRow, pColumn)
    let data = JSON.parse(localStorage.getItem('JSONProgram')),
        dataMedia;

    for (let i = 0; i < data.length; i++) {
        let e = data[pColumn][pRow]
        if (e) {
            // console.log('dataa:',e)
            dataMedia = e
            break
        }
    }
    return dataMedia
}

async function validateHour(media) {
    let reponse = false;
    try {
        let mediaArray = [];
        mediaArray = media['program'];
        for (let i = 0; i < mediaArray.length; i++) {
            const e = mediaArray[i];
            const hora = DATATIME.getHora()
            if (e.hour_start <= hora && e.hour_end >= hora) {
                reponse = true
            } else {
                reponse = false
            }
            if (reponse) {
                break
            }
        }
        return reponse
    } catch (error) {
        return false;
    }
}

async function validateNoRepit(pColumn, mediaId) {
    if (localStorage.getItem('positionsPlayed')) {
        const data_storage = JSON.parse(localStorage.getItem('positionsPlayed'));
        if (data_storage[pColumn]) {
            const length = data_storage[pColumn].length;
            const latest_position = data_storage[pColumn][length - 1];
            if (latest_position != undefined) {
                if (latest_position[0]['mediaId'] === mediaId) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            console.log("ingresando correccion1")
            main.reloadReset()
        }
    } else {
        console.log("ingresando correccion2")
        main.reloadReset()
    }

}

async function validateNoRepitColumn(mediaId) {
    const data_storage = JSON.parse(localStorage.getItem('lastPlayed'));
    if (data_storage.length > 0) {
        if (data_storage[0]['mediaId'] === mediaId) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

async function validateRepitSame(categoryContentsID) {
    const data_storage = JSON.parse(localStorage.getItem('lastPlayedSame'));
    if (data_storage.length > 0) {
        if (data_storage[0]['categoryContentsID'] === categoryContentsID) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function updateData() {
    try {
        let pathJson = JSON.parse(localStorage.getItem('pathJson')),
            json = "",
            data = "";
        json = JSON.parse(fs.readFileSync(`${pathJson}`, 'utf-8'))
        data = json.data
        let listVideos = [], listProgram = []
        listVideos = data.data
        listProgram = data.program
        if (listVideos.length === 0 || listProgram.length === 0) return false;
        const getnSlots = parseInt(JSON.parse(localStorage.getItem('nSlots')));
        const getPlayed = JSON.parse(localStorage.getItem('positionsPlayed'));
        await getSlotIds(data.nSlots, getnSlots, getPlayed, 2);
        storage.setPrograms(data.program, data.data, data.nSlots, data.maxRows)
        return true
    } catch (error) {
        return false
    }
}

exports.setSlotIds = async (nSoltsNow, nSlots, positionsPlayed, action) => {
    await getSlotIds(nSoltsNow, nSlots, positionsPlayed, action);
}


async function getSlotIds(nSoltsNow, nSlots, positionsPlayed, action) {
    if (action === 1) {
        await forArrayPositions(nSlots, positionsPlayed, 'add');
    } else if (action === 2) {
        // Sumar o resta
        let resultado;
        if (nSoltsNow > nSlots) {
            resultado = nSoltsNow - nSlots;
            await forArrayPositions(resultado, positionsPlayed, 'add');
        } else if (nSoltsNow < nSlots) {
            resultado = nSlots - nSoltsNow;
            await forArrayPositions(resultado, positionsPlayed, 'resta');
        }
    }
}

async function forArrayPositions(resultado, positionsPlayed, operation) {
    for (let i = 0; i < resultado; i++) {
        if (operation === 'add') {
            positionsPlayed.push([]);
        } else {
            positionsPlayed.pop();
        }
    }
    localStorage.setItem('positionsPlayed', JSON.stringify(positionsPlayed))
}

async function demonUpdata() {
    const demonLocal = JSON.parse(localStorage.getItem('demon')),
        hora = DATATIME.getHora();
    if (!demonLocal) {
        if (hora >= "03:00:00" && hora <= "04:00:00") {
            ws.demonDay()
        }
        // if (hora >= "09:00:00" && hora <= "9:30:00") {
        //     ws.demonDay()
        // }
    }

    if (demonLocal) {
        if (hora > "04:30:00" && hora < "05:00:00") {
            localStorage.setItem('demon', JSON.stringify(false))
        }
        // if (hora > "09:30:00" && hora < "11:30:00") {
        //     localStorage.setItem('demon', JSON.stringify(false))
        // }
    }
}