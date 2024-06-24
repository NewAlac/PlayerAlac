const { remote } = require('electron')
const main = remote.require('./main')
const http = require('../../../utils/http')
const ws = require('../../../utils/websocket')
const FILTER = require('../../../helpers/filtersData')
const Path = require('path'),
    cls = require('../../../helpers/functionStorage'),
    fs = require('fs')
const helps = require('../../../utils/env')

let basepath,
    playStart = null,
    run = null,
    loadingHtml = null;
// data_reproduced = [];


async function home() {
    document.body.innerHTML += `
    <div id="close">
            <div class="loading">Loading&#8230;</div>
    </div>
    <div id="demo" class="Bg">
        <div class="Card">
            <header class="App-header">
                <div class="myLogo"></div>
                <h6>Versión ${helps.versionLabel}</h6> 
            </header>
            <div class="frm-group">                
                <div class="md-input">
                    <div class="myList"></div>
                    <input list="brow" class="md-form-control" type="text" id="search_finally"  placeholder="Selecciona una playlist">
                    <datalist id="brow">
                        <option value="">
                    </datalist> 
                </div>
                <div class="md-input uploader">
                    <div class="myCloud"></div>
                    <input id="pathSelect" class="md-form-control" type="text" required="" disabled />
                    <label for="file_1" id="path"></label>
                </div>
                <div class="md-input">                    
                    <input id="download" type="button" class="btn-enter" value="Descargar ▷" />       
                </div>       
            </div>
        </div>
    </div>`;



    function disabled() {
        document.getElementById('download').disabled = true;
        // document.getElementById('play').disabled = true;
    }

    disabled();

    const pathDefault = await main.getPathDownload()
    pathSelect.value = pathDefault

    // http.validateConnect()

    var intervalLoanding = setInterval(async () => {
        let statusConnet = await http.getStatusExport()
        if (statusConnet) {
            clearInterval(intervalLoanding);
            setTimeout(() => {
                loadData()
            }, 2000);
        }
    }, 1000);


    const loading = document.getElementById('close')



    async function loadData() {
        const response = await http.getPlaylist()
        if (response.status == 'error') {
            await main.showMessages(response.status, response.message)
        } else {
            setTimeout(function () {
                loading.innerHTML = "";
                document.getElementById('close').innerHTML = "";
                const close = document.getElementById('close');
                close.innerHTML = "";
                close.classList.remove("content-loading");
            }, 2000);

            const pathSelect = document.getElementById('pathSelect')
            const playlist_select = document.getElementById('search_finally')
            const download = document.getElementById('download')
            const search_3 = document.getElementById('brow')

            pathSelect.value = pathDefault

            const path = document.getElementById('path')
            path.addEventListener('click', async (e) => {
                e.preventDefault()
                const pathS = await main.showSaveDialog()
                pathSelect.value = pathS
            })

            async function read() {
                search_3.innerHTML = ""
                response.forEach(e => {
                    search_3.innerHTML += `<option value="${e.playlistId} - ${e.playlist_name}"  >`;
                    // document.getElementById('download').disabled = true;  
                })
            }

            read();

            playlist_select.addEventListener('change', async (e) => {
                e.preventDefault()
                const id = playlist_select.value
                if (id === undefined || id === "" || id === null || id === 0) {
                    document.getElementById('download').disabled = true;
                } else {
                    document.getElementById('download').disabled = false;
                }

            })

            download.addEventListener('click', async (e) => {
                e.preventDefault()
                const value = playlist_select.value;
                const splitID = value.split(' -');
                const id = splitID[0]
                if (id === undefined || id === "" || id === null || id === 0) {
                    document.getElementById('download').disabled = false;
                } else {
                    loading.innerHTML += `<div class="loading">Loading&#8230;</div>`;
                    document.getElementById('download').disabled = true;
                    const resp = await main.downloadFiles(id, pathSelect.value, null)
                    if (resp.status) {
                        // let json = ""
                        // json = JSON.parse(fs.readFileSync(`${resp.json}`, 'utf-8'))
                        setTimeout(async () => {
                            const files = await main.listVideos()
                            if (files.length != 0) {
                                var intervalId = setInterval(async () => {
                                    const verifi = main.verifi()
                                    if (verifi == true) {
                                        let json = "", data;
                                        json = JSON.parse(fs.readFileSync(`${resp.json}`, 'utf-8'))
                                        basepath = resp.path
                                        data = json.data
                                        await main.showMessages(resp.subtitulo, resp.message)
                                        ws.indentificar(data.idPlaylist)

                                        cls.setsHomeAndPlayer(resp.path, pathSelect.value, id, resp.json, false)

                                        document.getElementById('download').disabled = false;
                                        clearInterval(intervalId);
                                        loading.innerHTML = ""
                                        player(data, basepath, 'home')
                                    }
                                }, 1000);
                            } else {
                                await main.showMessages(resp.subtitulo, "Hubo un error en la descarga de contenido")
                                document.getElementById('download').disabled = false;
                                loading.innerHTML = ""
                            }
                        }, 1500);
                    } else {
                        await main.showMessages(resp.subtitulo, resp.message)
                        document.getElementById('download').disabled = false;
                        loading.innerHTML = ""
                    }
                }
            })
        }
    }
}

exports.restHome = async () => {
    await downloadDemon()
}

async function player(data, basepath, option) {
    localStorage.setItem('ruta', JSON.stringify('player'))
    document.body.innerHTML = ""
    document.body.innerHTML += `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta http-equiv='X-UA-Compatible' content='IE=edge'>
            <title>Alac OohPerú - Alac Player Perú</title>
            <meta name='viewport' content='width=device-width, initial-scale=1'>            
            <style>
                body{
                    margin:0px;
                    padding:0px;
                    overflow:hidden
                    cursor: none;
                    background-color: #000;
                }        
                .content-video{
                    width: 100%;
                    height: max-content;
                }        
                video{
                    object-fit: fill;
                    position: absolute; 
                    right: 0px; 
                    left:0px;
                    top: 0px;
                    bottom: 0px;
                    min-width: 100%; 
                    min-height: 100%;
                    width: 100%; 
                    height: 100vh; 
                    z-index: -100;
                    background-size: cover;
                    overflow: hidden;
                }
                .flot{
                    z-index: 100000;
                    display: flex;
                    position: absolute;
                    background-color: #17a2b8;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    width: 43%;
                    height: auto;
                    margin: auto;
                    text-align: center;
                    align-items: center;
                }
                .padre{
                    position: relative;
                }
                .videoplay{
                    position: absolute;
                }
                
                .modal-dialog {
                    max-width: 500px;
                    margin: 3.3rem auto;
                }
                .hide-menu:active{
                    visibility: hidden;
                }
                .div-oculto{
                    position: absolute;
                    z-index: 1000000;
                    color: transparent;
                    cursor: pointer;
                    top: 0;
                    height: 100px;
                }
                .div-oculto:hover, .div-oculto:focus{
                    display: block;
                    transition: 0.2s;
                    visibility: visible;
                }
                .drag{
                    -webkit-app-region: drag 
                }
            </style>
        </head>
            <body>
                <div id="close" class="content-loading">
                    <div class="content-text">
                        <span>Cargando...</span>
                    </div>
                    <div class="loading">Loading&#8230;</div>                    
                </div>
                <div class="padre">
                    <div class="div-oculto" id="aparecerDiv">mostrar</div>
                    <div id="flot" class="btn-group btn-group-lg dropup floating-action-button flot">
                        <button id="mover" type="button" class="btn btn-info btn-fab btn-raised drag">
                            <i class="demo-icon icon-arrows-alt-solid"></i> 
                        </button>
                        <button type="button" class="btn btn-info btn-fab btn-raised drag">
                            <i class="demo-icon icon-expand-alt-solid"></i>
                        </button>
                        <button type="button" class="btn btn-info btn-fab btn-raised" data-toggle="modal"
                            data-target="#modalReset">
                            <i class="demo-icon icon-redo-solid"></i>
                        </button>        
                        <button type="button" class="btn btn-info btn-fab btn-raised" data-toggle="modal"
                            data-target="#exampleModalLabel">
                            <i class="demo-icon icon-cogs-solid"></i>
                        </button>
                        <button id="eliminarElemento" type="button" class="btn btn-info btn-fab btn-raised">
                            <i class="demo-icon icon-times-solid"></i>
                        </button>
                    </div>

                    <div class="modal fade" id="exampleModalLabel" tabindex="-1" role="dialog"
                        aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Player Settings</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <h5>Tamaño de Ventana</h5>
                                    <div class="dflex row">
                                        <div class="form-group col-sm-6">
                                            <label for="iwidth">Ancho de la ventana</label>
                                            <input class="form-control" type="text" name="iwidth" id="ww">
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="iheight">Altura de la ventana</label>
                                            <input class="form-control" type="text" name="iheight" id="hh">
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="iwidth">Posición eje X</label>
                                            <input class="form-control" type="text" name="iwidth" id="xx">
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="iheight">Posición eje Y</label>
                                            <input class="form-control" type="text" name="iheight" id="yy">
                                        </div>   
                                        <label id="message_error" style="color: red; padding-left: 15px;"><label>
                                                                          
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                                    <button id="cambio" type="button" data-dismiss="modal" class="btn btn-primary">Guardar cambios</button>
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <div class="modal fade" id="modalReset" tabindex="-2" role="dialog" aria-labelledby="modalReset"
                        aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Resetear cambios</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <h5>Esta acciónes restablecera todo los archivos</h5>
                                </div>
                                <div class="modal-footer">
                                    <button id= "resetTotal" type="button" class="w-15 btn btn-danger">Reset Total</button>
                                    <button id= "reset" type="button" class="w-60 btn btn-success">Actualizar player</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button id="freezeButton">Freeze App</button>
                    <div class="content-video">
                        <video id="reproductor" autoplay="true"></video>
                        <div id="divHtml" class="hide"></div>                  
                    </div>
                </div>
            </body>
        </html>
    `

    const sizeWindow = await main.getSizeWindow()
    const positionWindow = await main.getPositionWindow()

    const resetTotal = document.getElementById('resetTotal')
    const reset = document.getElementById('reset')
    var reproductor = document.getElementById('reproductor')
    let divHtml = document.getElementById('divHtml')
    const ww = document.getElementById('ww')
    const hh = document.getElementById('hh')
    const xx = document.getElementById('xx')
    const yy = document.getElementById('yy')
    const cambio = document.getElementById('cambio')
    const eliminarElemento = document.getElementById('eliminarElemento')
    const aparecerDiv = document.getElementById('aparecerDiv')
    const message_error = document.getElementById('message_error')
    const mover = document.getElementById('mover')

    var def = document.getElementById("flot");
    def.style.display = "none";
    def.style.visibility = "hidden";

    if (sizeWindow || positionWindow) {
        ww.value = sizeWindow[0]
        hh.value = sizeWindow[1]
        xx.value = positionWindow[0]
        yy.value = positionWindow[1]
    }

    if (option === 'player') {

        var intervalId = setInterval(async () => {
            const verifi = main.verifi()
            if (verifi == true) {
                const pathJson = JSON.parse(localStorage.getItem('pathJson'))
                let data;
                json = JSON.parse(fs.readFileSync(`${pathJson}`, 'utf-8'))
                data = json.data
                let listVideos = [], listProgram = []
                listVideos = data.data
                listProgram = data.program
                if (listVideos.length === 0 || listProgram.length === 0) {
                    return home();
                }
                cls.setProgramsActomatic(data.program, data.data, data.nSlots, data.maxRows);
                document.getElementById('close').innerHTML = "";
                const close = document.getElementById('close');
                close.classList.remove("content-loading");
                clearInterval(intervalId);
                localStorage.setItem('demon', JSON.stringify(false))
                localStorage.setItem("validateChange", JSON.stringify(false));
                //initPlayer
                init()
            }
        }, 3000);
    } else {
        setTimeout(function () {
            document.getElementById('close').innerHTML = "";
            const close = document.getElementById('close');
            close.classList.remove("content-loading");
            //initPlayer
            init()
        }, 2000);
    }

    document.getElementById('freezeButton').addEventListener('click', () => {
        // Simulate a long-running process
        let now = Date.now();
        while (Date.now() - now < 40000) {  // 10 seconds
            // Busy wait to simulate the app being non-responsive
        }
    });

    eliminarElemento.addEventListener('click', (e) => {
        e.preventDefault()
        var capa = document.getElementById("flot");
        capa.style.display = "none";
        capa.style.visibility = "hidden";
    })

    aparecerDiv.addEventListener('click', (e) => {
        e.preventDefault()
        var capa = document.getElementById("flot");
        capa.style.display = "block";
        capa.style.visibility = "visible";
    })

    cambio.addEventListener('click', async (e) => {
        e.preventDefault()
        var w = parseInt(ww.value),
            h = parseInt(hh.value),
            x = parseInt(xx.value),
            y = parseInt(yy.value)
        if (w == null || w <= 0 || h == null || h <= 0) {
            message_error.innerHTML = ''
            message_error.innerHTML += `las medidas tienen que ser mayor a 0`
        } else {
            await main.changeSizeWindow(w, h)
            await main.changePosition(x, y)
        }
    })

    async function init() {
        if (option === 'home') {
            await cls.setPrograms(data.program, data.data, data.nSlots, data.maxRows)
        }
        await cls.setsPositions(0, 0, 0, 0)
        await cls.setLastPlayed([], [])

        await FILTER.setSlotIds(0, data.nSlots, [], 1);
        const dataMedia = await FILTER.searchDataVideo()
        reproductor.volume = 0.00;
        run(dataMedia);
    }

    reproductor.addEventListener('ended', async (e) => {
        const dataMedia = await FILTER.searchDataVideo()
        run(dataMedia);
    })

    run = async (dataMedia, val = false, div = null) => {
        let media = dataMedia.file_name
        let mediaPlay = Path.resolve(basepath, `${media}`);
        let data = {}
        if (dataMedia.media_type != 'html') {
            data.playerId = dataMedia.playlistId
            data.nameVideo = dataMedia.content_name
            playStart(mediaPlay)
        } else {
            loadingHtml(dataMedia, mediaPlay, media)
        }
        if (val) {
            cleanHtml(div)
        }
    }

    playStart = (videoplay) => {
        try {
            reproductor.src = ""
            reproductor.src = videoplay;
            reproductor.load();
            const playPromise = reproductor.play();

            if (playPromise !== null) {
                playPromise.catch(() => { /* discard runtime error */ })
            }

        } catch (error) {
        }
    }

    loadingHtml = async (dataHml, mediaPlay, media) => {

        try {
            let time = parseInt(dataHml.duration),
                html = ""
            html = fs.readFileSync(`${mediaPlay}`, 'utf8');
            divHtml.innerHTML = ""
            divHtml.innerHTML = html
            time = time + 2

            setTimeout(() => {
                let timeIntervalId = setInterval(async () => {
                    time--
                     if (time <= 0) {
                        clearInterval(timeIntervalId)
                        const dataMedia = await FILTER.searchDataVideo()
                        //divHtml.innerHTML = ""
                        run(dataMedia, true, divHtml);
                    } else {
                    }
                }, 1000);
            }, 1500)
        } catch (error) {
            let getVideo = [],
                data = JSON.parse(localStorage.getItem('JSONDta')),
                basePath = JSON.parse(localStorage.getItem('basePath'))

            for (let i = 0; i < data.length; i++) {
                const e = data[i]
                if (e['file_name'] === media) {
                    getVideo.push(e)
                    break
                }
            }
            await main.downloadVideoError(getVideo, basePath)
            const dataMedia = await FILTER.searchDataVideo()
            run(dataMedia)
        }
    }

    function cleanHtml(div) {
        div.innerHTML = ""
    }
    reproductor.addEventListener("error", async (e) => {
        e.preventDefault()
        let getVideo = [],
            videoNoFound = reproductor.src.split('/media/')[1],
            data = JSON.parse(localStorage.getItem('JSONDta')),
            basePath = JSON.parse(localStorage.getItem('basePath'))

        for (let i = 0; i < data.length; i++) {
            const e = data[i]
            if (e['file_name'] === videoNoFound) {
                getVideo.push(e)
                break
            }

        }
        await main.downloadVideoError(getVideo, basePath)
        const dataMedia = await FILTER.searchDataVideo()
        run(dataMedia)
    });



    reset.addEventListener('click', async (e) => {
        activateDemon()
    })

    resetTotal.addEventListener('click', async (e) => {
        await redirectHome();
    })
}

async function redirectHome() {
    run = ""
    playStart = ""
    document.body.innerHTML = ""
    const reset = await main.resetProgram()
    if (reset) {
        document.body.innerHTML = ""
        cls.clearStorage()
        initStart()
    } else {
        document.body.innerHTML = ""
        await main.resetProgram()
        cls.clearStorage()
        initStart()
    }
}

exports.resetRedirectHome = async () => {
    await redirectHome()
}

exports.loadingSync = async () => {
    document.body.innerHTML = ""
    document.body.innerHTML +=
        `
    <div id="close" class="content-loading">
        <div class="content-text">
            <span>Cargando...</span>
        </div>
        <div class="loading">Loading&#8230;</div>                    
    </div>
    
    `;
}

async function loading() {
    document.body.innerHTML = ""
    document.body.innerHTML +=
        `
    <div id="close" class="content-loading">
        <div class="content-text">
            <span>Cargando...</span>
        </div>
        <div class="loading">Loading&#8230;</div>                    
    </div>
    
    `
    await downloadDemon()
}

async function downloadDemon() {
    await ws.resetPlayer()
    var intervalId = setInterval(async () => {
        const verifi = main.verifi()
        if (verifi == true) {
            clearInterval(intervalId)
            initStart()
        }
    }, 1000);

}



async function activateDemon() {
    const id = JSON.parse(localStorage.getItem('idPanel'))
    ws.indentificar(id)
    let cuerpo = document.body
    cuerpo.innerHTML = ""
    run = ""
    playStart = ""
    loading()
}

exports.demon = async () => {
    await activateDemon()
}


exports.demon2 = () => {
    // Lógica de la función demon
  };

async function initStart() {
    const validate = await main.validateData()
    if (validate.status == true) {
        const id = parseInt(validate.json.idPlaylist)
        await ws.checkStatus(id)
        ws.verifySocketListen()
        ws.startSockets()
        cls.clearStorage()

        let option = 'home'

        const isConnect = await http.getStatusExport()
        if (isConnect) {
            option = 'player';
            ws.downloadContentsAutomaticExport(id);
        }
        cls.setsHomeAndPlayer(validate.path, validate.basePath, id, validate.pathJson, false)
        return player(validate.json, validate.path, option)
    } else {
        const id = JSON.parse(localStorage.getItem("idPanel"))
        if (id) {
            ws.checkStatus(id);
        }
        ws.verifySocketListen()
        cls.clearStorage()
        localStorage.setItem('ruta', JSON.stringify('home'))
        home();
    }
}

initStart()