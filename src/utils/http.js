const env = require("./env");
const axios = require("axios");
const dns = require("dns");

let status = false;

async function validateConnect() {
  return navigator.onLine ? status = true : status = false;
}

exports.getStatusExport = async () => {
  await validateConnect()
  return status
}

exports.getPlaylist = async () => {
  try {
    // const url = `${env.urlBase}/playlist`;
    const res = await axios.get(`${env.urlBase}/playlist`);
    return res.data.data;
  } catch (error) {
    const respon = {
      status: "error",
      message: error.message,
    };
    return respon;
  }
}

exports.downloadVideosPlaylist = async (id) => {
  try {
    // const url = `${env.urlBase}/playlist/download/${id}`;
    const res = await axios.get(`${env.urlBase}/playlist/download/${id}`);
    let playlist = res.data;
    return playlist;
  } catch (error) {
    console.log(error);
    const respon = {
      status: false,
      message: error.message,
    };
    return respon;
  }

};

exports.createReport = async (data) => {
  try {
    await axios.post(`${env.urlReport}/create`, data)
  } catch (error) { }
}

exports.addNetworking = async (data) => {
  try {
    await axios.post(`${env.urlBase}/player/newadd`, data)
  } catch (error) { }
}

exports.questionsPanelSync = async (id) => {
  try {
    const res = await axios.get(`${env.urlBase}/sync/question/${id}`);
    let playlist = res.data;
    return playlist;
  } catch (error) {
    const respon = {
      status: false,
      message: error.message,
    };
    return respon;
  }
}

exports.updatePanelSync = async (id) => {
  try {
    const res = await axios.put(`${env.urlBase}/sync/updatePanel/${id}`);
    let playlist = res.data;
    return playlist;
  } catch (error) {
    const respon = {
      status: false,
      message: error.message,
    };
    return respon;
  }
}

exports.postAllDataReport = async (data) => {
  try {
    await axios.post(`${env.urlScreen}/api/video`, data)
  } catch (error) { }
}

exports.getMediaContent = async (id) => {
  try {
    // const url = `${env.urlBase}/playlist`;
    const res = await axios.get(`${env.urlBase}/player/searchid/${id}`);
    return res.data;
  } catch (error) {
    const respon = {
      status: "error",
      message: error.message,
    };
    return respon;
  }
}