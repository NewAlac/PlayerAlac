const { app, BrowserWindow, dialog, Notification } = require('electron'),
    os = require('os'),
    http = require('./utils/http'),
    Path = require('path'),
    fs = require('fs'),
    env = require('./utils/env'),
    Axios = require('axios'),
    isDev = require('electron-is-dev'),
    url = require('url'),
    util = require('util'),
    nativeImage = require('electron').nativeImage,
    Store = require('electron-store'),
    store = new Store();
let forceQuit = false;


let mainWindow,
    pathBaseFiles,
    destinationFinal,
    continuee = false,
    resetDemon = false,
    downloadError = false

async function createWindow() {
    let image = nativeImage.createFromPath(__dirname, '../favicon.ico')
    image.setTemplateImage(true)

    let XX = store.get('positioX'),
        YY = store.get('positioY'),
        WW = store.get('width')
        HH = store.get('height')
    if (!XX) XX = 0;
    if (!YY) YY = 0;
    if (!WW) WW = 768;
    if (!HH) HH = 384;
    store.set('positioX', XX)
    store.set('positioY', YY)

    mainWindow = new BrowserWindow({
        width: WW,
        height: HH,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            webSecurity: true,
        },
        x: XX,
        y: YY,
        alwaysOnTop: true,
        closable: false,
        icon: image,
        resizable: false,
        disableAutoHideCursor: true,
        // movable:false,
        frame: false,
    })
    mainWindow.loadURL(url.format({
        pathname: Path.join(__dirname, 'ui/index.html'),
        protocol: 'file',
        slashes: true
    }));
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }


    // mainWindow.setMenu()

    mainWindow.on('close', async (e) => {
        if (!forceQuit) {
            e.preventDefault();
            let choice = await dialog.showMessageBox({
                type: 'question',
                title: 'Confirmar',
                message: '¿Estás seguro de que quiere cerrar el programa?',
                buttons: ['No', 'Yes'],
            })
            if (choice.response === 1) {
                // if (isDev) {
                //     store.delete('positioX');
                //     store.delete('positioY');
                //     store.delete('width');
                //     store.delete('height');
                // }
                process.exit()
                //forceQuit = true;
                //mainWindow.close();
            }
        }
    });
}


async function getSizeWindow() {
    return mainWindow.getSize()
}

async function changeSizeWindow(w, h) {
    mainWindow.setResizable(true)
    mainWindow.setSize(w, h, true)
    store.delete('width')
    store.delete('height')
    store.set('width', w)
    store.set('height', h)
    mainWindow.setResizable(false)
}

async function getPositionWindow() {
    return mainWindow.getPosition()
}

async function changePosition(x, y) {
    store.delete('positioX');
    store.delete('positioY');
    store.set('positioX', x)
    store.set('positioY', y)
    mainWindow.setPosition(x, y, true)
}

function mover(cambio) {
    mainWindow.setMovable(cambio)
}

async function showSaveDialog() {
    const hosname = os.userInfo();
    const defaultPath = Path.join(hosname.homedir, 'Documents')
    let options = {
        defaultPath
    }
    if (!options) options = {};
    if (!('defaultPath' in options) && this.lastSelectedPath_) options.defaultPath = this.lastSelectedPath_;

    const filePath = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
    if (!filePath.canceled == true) {
        const pathSelect = filePath.filePaths[0]
        return pathSelect;
    } else {
        return options.defaultPath
    }
}

async function getPathDownload() {
    const hosname = os.userInfo();
    const defaultPath = Path.join(hosname.homedir, 'Documents')
    const options = {
        defaultPath
    }
    return options.defaultPath
}

function verifi() {
    return continuee
}

function changeVerifi(newVerifi) {
    continuee = newVerifi
}

function getDemon() {
    return resetDemon
}

async function downloadFiles(id, path, basePath) {
    try {
        const respuesta = await http.downloadVideosPlaylist(id)
        let listVideos = [], listProgram = []
        // if(basePath){
        //     listVideos = await FILTER.filterVideos(respuesta['data'], basePath)
        //     console.log(listVideos)
        // }else{
        //     listVideos = respuesta.data
        // }
        listVideos = respuesta.data
        listProgram = respuesta.program



        if (listVideos.length != 0 || listProgram.length != 0) {
            const pathBase = Path.join(path, 'alac-player')
            const newDestination = Path.join(path, 'alac-player/media')
            let stat1 = null;
            let stat = null;
            try {
                stat1 = fs.statSync(pathBase);
                stat = fs.statSync(newDestination);
            } catch (err) {
                fs.mkdirSync(pathBase);
                fs.mkdirSync(newDestination);
            }
            if (stat && !stat.isDirectory() && stat1 && !stat1.isDirectory()) {
                throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
            }
            // delete respuesta.data
            // const json = { data: respuesta }            
            // let data = JSON.stringify(json)
            const jsonPath = Path.resolve(pathBase, 'data.json')
            const jsonData = respuesta
            // fs.writeFileSync(dataPath, data)
            continuee = false
            download(listVideos, path, jsonData, jsonPath)

            destinationFinal = newDestination
            pathBaseFiles = pathBase
            const resp = {
                status: true,
                path: newDestination,
                json: jsonPath,
                message: 'Se descargo todo los multimedia',
                subtitulo: 'subtitulo',
            };
            return resp;

        } else {
            continuee = true
            const resp = {
                status: false,
                message: 'La playlist no cuenta con contenidos',
                subtitulo: 'subtitulo',
            };
            return resp;
        }

    } catch (error) {
        continuee = true
        //console.log(error);
        const err = {
            status: false,
            err: error,
            message: 'Hubo un error el la descarga',
            subtitulo: 'subtitulo',
        };
        return err
    }
}

async function download(listVideos, path, jsonData, jsonPath) {
    let contador = 0;
    try {
        for (let i = 0; i < listVideos.length; i++) {
            const e = listVideos[i];
            let folder = e.directory

            const url = `${env.urlStorage}/${folder}/${e.file_name}`

            const downloadPath = Path.resolve(path, 'alac-player/media', `${e.file_name}`)
            const file = fs.createWriteStream(downloadPath)
            let Tprogres = listVideos.length * 0.5,
                progres = 0
            request = Axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            }).then(function (response) {
                response.data.pipe(file)
                file.on('finish', async function () {
                    file.close()
                    progressAndValidate()
                })
            }).catch(function (error) {
                console.log(error.message)
                file.close()
                const newUrl = error.config.url;
                const newfile = fs.createWriteStream(downloadPath)
                requestVideo(newUrl, newfile, (resp) => {
                    while (!resp) {
                        requestVideo(newUrl, newfile, cb)
                    }
                })

            });

            async function progressAndValidate() {
                contador++
                progres = (contador * 10 / Tprogres) / 2
                mainWindow.setProgressBar(progres / 10)
                if (contador >= listVideos.length) {
                    mainWindow.setProgressBar(-1)
                    if (downloadError) {
                        downloadError = false
                        continuee = true
                    } else {
                        descargarJson(jsonData, jsonPath)

                    }

                }
            }

            function requestVideo(urlR, fileR, cb) {
                newRequest = Axios({
                    method: 'GET',
                    url: urlR,
                    responseType: 'stream'
                }).then(function (response) {
                    response.data.pipe(fileR)
                    fileR.on('finish', async function () {
                        progressAndValidate()
                        fileR.close(cb(true))
                    })
                }).catch(function (err) {
                    // console.log(err)
                    cb(false)
                })
            }
        }
    } catch (error) {
        //console.log(error)
    }

}

function descargarJson(jsonData, jsonPath) {
    const json = { data: jsonData }
    let data = JSON.stringify(json)

    fs.writeFile(jsonPath, data, (err) => {
        if (err) showMessages("Error", "Error, al descargar la programación")
        continuee = true
        demon = 0
    });

    // const file = await asyFs.readFile('filename.txt', 'utf8');
    // await asyFs.writeFile(jsonPath, data);
    // continuee = true
    // demon = 0
    // return true
}

async function downloadSockets(p_path, data, jsonNew, option) {
    const pathBase = Path.resolve(p_path, 'alac-player')
    const jsonPath = Path.resolve(pathBase, 'data.json')
    const newDestination = Path.resolve(pathBase, 'media')

    continuee = false
    let stat1 = null;
    let stat = null;
    try {
        stat1 = fs.statSync(pathBase);
        stat = fs.statSync(newDestination);
    } catch (err) {
        fs.mkdirSync(pathBase);
        fs.mkdirSync(newDestination);
    }
    if (stat && !stat.isDirectory() && stat1 && !stat1.isDirectory()) {
        throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
    }

    try {
        if (option == 2) {
            descargarJson(jsonNew, jsonPath)
            const resp = {
                status: true,
                path: newDestination,
                json: jsonPath,
                message: 'Se descargo todo la multimedia',
                subtitulo: 'subtitulo',
            };

            return resp
        } else {
            update = false
            download(data, p_path, jsonNew, jsonPath)
            const resp = {
                status: true,
                path: newDestination,
                json: jsonPath,
                message: 'Se descargo todo la multimedia',
                subtitulo: 'subtitulo',
            };
            return resp
        }
    } catch (error) {
        // console.log(error)
        const resp = {
            status: false,
            err: error,
            message: 'Hubo un error el actualizar playlist',
            subtitulo: 'subtitulo',
        };
        return resp
    }
}

async function downloadVideoError(data, p_path) {
    update = false,
        downloadError = true
    download(data, p_path, null, null)
    // download(listVideos, path, jsonData, jsonPath)
}

async function listVideos() {
    const readdir = util.promisify(fs.readdir);
    try {
        const files = await readdir(pathBaseFiles);
        if (files) {
            const videos = await readdir(destinationFinal);
            return videos
        }
    } catch (error) {
        // console.log(error)
    }

}

async function fileExists(pathVideo) {
    try {
        if (fs.existsSync(pathVideo)) return true
        return false
    } catch (error) {
        // console.log(error)
        return false
    }
}

async function showMessages(subt, body) {
    new Notification({
        title: 'Alac Player Perú',
        replyPlaceholder: "Placeholder",
        subtitle: subt,
        body: body
    }).show()

}

async function validateData() {
    const readdir = util.promisify(fs.readdir);
    const hosname = os.userInfo()
    const basePath = Path.join(hosname.homedir, 'Documents')
    const pathD = Path.join(basePath, 'alac-player')
    const pathVideos = Path.join(pathD, 'media')
    const pathJson = Path.join(pathD, 'data.json')
    try {
        const files = await readdir(pathD);
        if (files) {
            const videos = await readdir(pathVideos)
            let jsonData
            jsonData = JSON.parse(fs.readFileSync(`${pathJson}`, 'utf-8'))
            if (videos.length != 0) {
                resp = {
                    status: true,
                    json: jsonData.data,
                    path: pathVideos,
                    basePath,
                    pathJson,
                }
                return resp
            } else {
                // console.log("entrando que no hay videos")
                return false
            }
        }
        return false

    } catch (error) {
        return false
    }

}

function reloadReset() {
    // continuee = false
    update = true
    demon = 0
    mainWindow.reload()
}


async function demonReset() {
    continuee = false
    // let contado = 1
    let intervalId = setInterval(async () => {
        const reset = await resetProgram()
        // console.log("reset", contado++)
        if (reset) {
            update = false
            continuee = false
            resetDemon = true
            clearInterval(intervalId);
        }
    }, 300);
}

async function resetProgram() {

    const readdir = util.promisify(fs.readdir);
    const lstat = util.promisify(fs.lstat);
    const unlink = util.promisify(fs.unlink);
    const rmdir = util.promisify(fs.rmdir);

    let proms
    let resp = false
    const hosname = os.userInfo();
    const basePath = Path.join(hosname.homedir, 'Documents')
    const dir1 = Path.join(basePath, 'alac-player')
    const dir = Path.join(dir1, 'media')
    // const dir1 = `${hosname.homedir}\\Documents\\alac-player` 
    // const dir = `${hosname.homedir}\\Documents\\alac-player\\videos`  
    try {
        resp = true
        const files = await readdir(dir);
        await Promise.all(files.map(async (file) => {
            try {
                resp = true
                const p = Path.resolve(dir, file);
                const stat = await lstat(p);
                if (stat.isDirectory()) {
                    // console.log("Entro aqui")
                    proms = await resetProgram(p);
                    if (proms) return resp
                } else {
                    proms = await unlink(p);
                    if (proms) return resp
                }
            } catch (err) {
                resp = false,
                    console.error("1", err)
            }
        }))

        if (resp == true) {
            await rmdir(dir);
            const archivos = await readdir(dir1);
            await Promise.all(archivos.map(async (archivo) => {
                try {
                    resp = true
                    let p2 = Path.join(dir1, archivo);
                    let stat2 = await lstat(p2);
                    if (stat2.isDirectory()) {
                        proms = await resetProgram(p2);
                        if (proms) return resp
                    } else {
                        proms = await unlink(p2);
                        if (proms) return resp
                    }
                } catch (err) {
                    resp = false
                    console.error("2", err)
                    return resp
                }
            }))
            continuee = false
            update = true
            demon = 0
            downloadError = false
            await rmdir(dir1);
            // mainWindow.reload()
            return resp
        };
    } catch (err) {
        continuee = false
        update = true
        demon = 0
        // mainWindow.reload()
        resp = false
        // console.error("err", err)
    }

}

module.exports = {
    createWindow,
    validateData,
    showSaveDialog,
    getPathDownload,
    downloadFiles,
    showMessages,
    listVideos,
    resetProgram,
    getSizeWindow,
    changeSizeWindow,
    getPositionWindow,
    changePosition,
    mover,
    verifi,
    changeVerifi,
    fileExists,
    downloadSockets,
    getDemon,
    demonReset,
    reloadReset,
    downloadVideoError
}