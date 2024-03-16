const env = require("./env");
var socket = require("socket.io-client")(env.urlBase);
const { remote } = require("electron");
const main = remote.require("./main");
const http = require("../utils/http");
const fs = require('fs');
// const DATATIME = require("../helpers/getDataTime");
const home = require("../ui/pages/home/home");
const FILTER = require('../helpers/filtersData')

const Path = require('path');

let socketStatus = false,
  idSocket;


exports.checkStatus = async (id) => {
  socket.on("connect", () => {
    idSocket = socket.id;
    if (id) {
      const data = { id };
      socket.emit("client:identificado", data);
      // console.log('socket identificado', socket.id)
      localStorage.setItem("SocketID", JSON.stringify(idSocket));
      return (socketStatus = true);
    } else {
      // console.log('Conectado al servidor', socket.id)
      return (socketStatus = true);
    }
  });

  socket.on("disconnect", () => {
    // console.log('Desconectado del servidor', idSocket);
    socketStatus = false;
    // console.log(socketStatus)
    return socketStatus;
  });
  // return socketStatus
};

exports.indentificar = (id) => {
  const data = { id };
  socket.emit("client:identificado", data);
  localStorage.setItem("SocketID", JSON.stringify(socket.id));
};

exports.verifySocketListen = () => {
  socket.on("verify:socket:listen", async (data) => {
    const { status, title, message } = data;
    if (status) {
      await main.showMessages(title, message);
    }
  });
};



const resetPlayerSocket = () => {
  socket.on("reset:player:socket", async (data, callback) => {
    const id = JSON.parse(localStorage.getItem("idPanel")),
      option = JSON.parse(localStorage.getItem("ruta")),
      { idPlaylist } = data;

    if (idPlaylist == parseInt(id)) {
      console.log("reset")
      validateContinue(option)
    } else {
      console.log("reset failed")
      statusRestSocket(false, "reset failed");
    }
  });


  socket.on("sincronizacion:starting:player", async (data, callback) => {
    const aData = JSON.parse(data.data);
    const id = JSON.parse(localStorage.getItem("idPanel")),
      option = JSON.parse(localStorage.getItem("ruta"));

    let aDataPlaylistSync = [];
    aDataPlaylistSync = (aData.length > 0) ? aData : [];

    aData.forEach(item => {
      const idPlaylist = item.id;
      if (idPlaylist === parseInt(id)) {
        validateContinue(option, true, aDataPlaylistSync)
      } else {
        statusRestSocket(false, "reset failed");
      }
    });
  });

};
resetPlayerSocket()

const reportPlayerExhibiciones = () => {
  socket.on("add:media:playlistScreen:player", async (data) => {
    const ids = data.listContents
    const dataplaylist = JSON.parse(localStorage.getItem('idPanel'))
    for (let i = 0; i < ids.length; i++) {
      const respPanelSync = await http.getMediaContent(ids[i].idContent);
      let intervalID = setInterval(function() {
        let data_storagea = JSON.parse(localStorage.getItem('lastPlayed'))|| 0;
        if (data_storagea[0].mediaId === respPanelSync.data.id) {
          console.log('¡Aquí está el número buscado!', respPanelSync.data.id);
          clearInterval(intervalID);
           const data = {
            "mediaId" : respPanelSync.data.id,
            "Idplaylist" : dataplaylist
           }
           http.postAllDataReport(data);
           const dataJson = {
              data,
             status: true,
             message: 'Capture finish'
           };
           socket.emit("add:media:playlistScreen:player", dataJson);
        }else{
          console.log('No encuentras!');
        }
      }, 1000);
    }
  });
}
reportPlayerExhibiciones()



function validateContinue(option, sync = false, aDataPlaylistSync = {}) {

  if (option === 'home') {
    home.restHome()
    var intervalIdCallbackHome = setInterval(async () => {
      let verifi = main.verifi();
      if (verifi === true) {
        clearInterval(intervalIdCallbackPlayer);
        statusRestSocket(true, "reset successful");
        clearInterval(intervalIdCallbackHome);
      }
    }, 1000)

  } else if (option === 'player') {

    if (sync) {
      home.loadingSync();
      resetdownloadDataMedia(true, aDataPlaylistSync);
    } else {
      optionPlayer()
    }

  }

}

function optionPlayer() {
  home.demon();
  var intervalIdCallbackPlayer = setInterval(async () => {
    let verifi = main.verifi();
    if (verifi === true) {
      clearInterval(intervalIdCallbackPlayer)
      statusRestSocket(true, "reset successful")
      clearInterval(intervalIdCallbackPlayer)
    }
  }, 1000);
}

function statusRestSocket(status, message) {
  socket.emit("status:player:socket", { status, message });
}

exports.reportErrorMedia = (id, video, err) => {
  const data = { id, mediaFile: video, error: err };
  socket.emit("error:file:media", data);
};

exports.getSocketID = () => idSocket;

const addMediaPlaylist = () => {
  socket.on("add:media:playlist:player", async (data) => {
    console.log("data",data, 1)
    await downloadContents(data, 1)
  });
  
}


const validateCambio = () => {
  socket.on("validate:cambios:playlist", async (data) => {
    await downloadContents(data, 1);
  });
}

exports.demonDay = () => {
  const idPlaylist = JSON.parse(localStorage.getItem("idPanel"))
  const data = { idPlaylist, description: "Reset player completo" }
  socket.emit("demonDay:cambios:playlist", data);
}

downloadContentsAutomatic = (idPlaylist) => {
  const data = { idPlaylist, description: "Reset player completo" }
  socket.emit("demonDay:cambios:playlist", data);
}

const returnDemon = () => {
  socket.on("retun:demonDay:playlist", async (data) => {
    await downloadContents(data, 2);
  });
}

exports.downloadContentsAutomaticExport = (id) => {
  downloadContentsAutomatic(id);
}

exports.startSockets = () => {
  initSockets()
}

function initSockets() {
  const ruta = JSON.parse(localStorage.getItem("ruta"));
  if (ruta === "player") {
    addMediaPlaylist()
    validateCambio()
    returnDemon()
    downloadContentsAutomatic()
  }
}


async function downloadContents(data, opt, sync = false, aDataPlaylistSync = {}) {
  const { idPlaylist, description, resp } = data
  const basePath = JSON.parse(localStorage.getItem("basePath"))
  let response = [];
  const listVideos = await FILTER.filterVideos(resp['data'], basePath);
  // valida data es null
  if (resp['data'].length === 0 || resp['program'].length === 0) {
    return await home.resetRedirectHome()
  }
  if (listVideos.length != 0) {
    const option = 1
    response = await main.downloadSockets(basePath, listVideos, resp, option)
    var intervalId = setInterval(async () => {
      const verifi = main.verifi();
      if (verifi == true) {
        await updataData(response, idPlaylist, description, opt);
        clearInterval(intervalId);
      }
    }, 1000);
    // await updataData(response, idPlaylist, description);
  } else {
    if (!sync) {
      const option = 2
      response = await main.downloadSockets(basePath, listVideos, resp, option)
      var intervalId = setInterval(async () => {
        const verifi = main.verifi();
        if (verifi == true) {
          await updataData(response, idPlaylist, description, opt);
          clearInterval(intervalId);
        }
      }, 1000);
      // await 
    } else {
      // Entra a sincronizar
      const option = 2
      response = await main.downloadSockets(basePath, listVideos, resp, option)
      var intervalId = setInterval(async () => {
        const verifi = main.verifi();
        if (verifi == true) {
          const statusSyncPanels = [];
          for (let s = 0; s < aDataPlaylistSync.length; s++) {
            const idPlaylistFor = aDataPlaylistSync[s].id;
            const respPanelSync = await http.questionsPanelSync(idPlaylistFor);
            if (respPanelSync.status) {
              const status_sync = respPanelSync.data[0].status_sync;
              statusSyncPanels.push(status_sync);
            } else {
              //console.log('Log: ', 'Error en la línea 239', respPanelSync);
            }
          }

          const descriptionSync = "Sincronización terminado";
          //console.log(description);
          await http.updatePanelSync(idPlaylist);

          const aStatusCero = statusSyncPanels.filter(e => e === '0');
          console.log(aStatusCero);
          if (aStatusCero.length === 0) {
            console.log('Terminó la sincronización');
            proceedPlayMovie(intervalId, response, idPlaylist, descriptionSync, opt);
          }
          console.log('-------------------------------');
          //console.log("termino",verifi);
          //alert('Entra a sincronizar');
          //await updataData(response, idPlaylist, description, opt);
          //clearInterval(intervalId);
        }
      }, 5000);
    }

  }

}

async function proceedPlayMovie(intervalId, response, idPlaylist, description, opt) {
  clearInterval(intervalId);
  setTimeout(async () => {
    optionPlayer();
    await updataData(response, idPlaylist, description, opt);
    const dataJson = {
      status: true,
      message: 'Sync finish'
    };
    socket.emit("sincronizacion:response:player", dataJson);
  }, 1500);
}

exports.resetPlayer = async () => {
  await resetdownloadDataMedia()
}

async function resetdownloadDataMedia(sync = false, aDataPlaylistSync = {}) {
  const description = "Player actualizado correctamente"
  const idPlaylist = JSON.parse(localStorage.getItem("idPanel"))
  let resp = await http.downloadVideosPlaylist(idPlaylist)

  while (!resp.status) {
    resp = await http.downloadVideosPlaylist(idPlaylist)
  }

  const data = { idPlaylist, description, resp }
  await downloadContents(data, 1, sync, aDataPlaylistSync)
}


async function updataData(resp, id, description, opt) {

  console.log(resp, id, description, opt)
  if (opt == 2) {
    localStorage.setItem('demon', JSON.stringify(true))
  }
  const data = { id, status_playlist: true };
  socket.emit("descarga:completa:contenido", data);
  await main.showMessages(description, description);
  localStorage.removeItem("pathJson");
  localStorage.setItem("pathJson", JSON.stringify(resp.json));
  localStorage.setItem("validateChange", JSON.stringify(true));
}
