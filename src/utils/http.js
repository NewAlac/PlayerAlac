const env = require("./env");
const axios = require("axios");

let status = false;

async function validateConnect() {
  try {
    status = navigator.onLine;
    return status;
  } catch (error) {
    console.error('Error validating connection:', error.message);
    return false;
  }
}

exports.getStatusExport = async () => {
  try {
    await validateConnect();
    return status;
  } catch (error) {
    console.error('Error getting status export:', error.message);
    return false;
  }
}

exports.getPlaylist = async () => {
  try {
    const res = await axios.get(`${env.urlBase}/playlist`);
    return res.data.data;
  } catch (error) {
    console.error('Error getting playlist:', error.message);
    return {
      status: "error",
      message: error.message,
    };
  }
}

exports.downloadVideosPlaylist = async (id) => {
  try {
    const res = await axios.get(`${env.urlBase}/playlist/download/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error downloading videos playlist:', error.message);
    return {
      status: "error",
      message: error.message,
    };
  }
}

exports.createReport = async (data) => {
  try {
    await axios.post(`${env.urlReport}/create`, data);
  } catch (error) {
    console.error('Error creating report:', error.message);
  }
}

exports.addNetworking = async (data) => {
  try {
    await axios.post(`${env.urlBase}/player/newadd`, data);
  } catch (error) {
    console.error('Error adding networking:', error.message);
  }
}

exports.questionsPanelSync = async (id) => {
  try {
    const res = await axios.get(`${env.urlBase}/sync/question/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error syncing questions panel:', error.message);
    return {
      status: "error",
      message: error.message,
    };
  }
}

exports.updatePanelSync = async (id) => {
  try {
    const res = await axios.put(`${env.urlBase}/sync/updatePanel/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error updating panel sync:', error.message);
    return {
      status: "error",
      message: error.message,
    };
  }
}

exports.postAllDataReport = async (data) => {
  try {
    await axios.post(`${env.urlScreen}/api/video`, data);
  } catch (error) {
    console.error('Error posting all data report:', error.message);
  }
}

exports.getMediaContent = async (id) => {
  try {
    const res = await axios.get(`${env.urlBase}/player/searchid/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error getting media content:', error.message);
    return {
      status: "error",
      message: error.message,
    };
  }
}
