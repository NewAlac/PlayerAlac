const json = require('../../package.json')
//const ENV = 'DEV'
//const ENV = 'QA'
const ENV = 'PRD'

let _urlBase = 'http://localhost:3000'
let _urlStorage = 'https://storage.googleapis.com';
let _urlScreen = 'http://localhost:5030';
let _Report = ''

if(ENV === 'QA'){
    _urlBase = 'https://alacqapi.alacoohperu.pe'   //Productions
    _urlStorage = 'https://storage.googleapis.com' // Production
    _Report = ''// PRODUCTION AND QA
    
}

if(ENV === 'PRD'){
    _urlBase = 'https://apialacplayer.alacoohperu.pe'   //Productions
    _urlStorage = 'https://storage.googleapis.com' // Production
    _Report = 'https://report.alacoohperu.pe/api/content'// PRODUCTION AND QA
    _urlScreen = 'https://reportimage.alacoohperu.pe'
    
}

exports.urlBase = _urlBase
exports.urlStorage = _urlStorage
exports.urlReport =_Report
exports.urlScreen =_urlScreen

exports.versionLabel = `${json.version} ${ENV}`
exports.version = `${json.version}`