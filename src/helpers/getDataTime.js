exports.getFecha = () =>{
    const start = Date.now();
    let d = new Date(start),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

exports.getDay = () =>{
    let dy;
    switch (new Date().getDay()) {
        case 0:
            dy = 7
            break;
        case 1:
            dy = 1
            break;
        case 2:
            dy = 2
            break;
        case 3:
            dy = 3
            break;
        case 4:
            dy = 4
            break;
        case 5:
            dy = 5
            break;
        case 6:
            dy = 6
    }
    return dy
}

exports.getHora = () => {
    // let hoy = new Date(),
    //     hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    // return hora;

    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    if (hour.toString().length === 1) {
      var hour = '0' + hour;
    }
    if (minute.toString().length === 1) {
      var minute = '0' + minute;
    }
    if (second.toString().length === 1) {
      var second = '0' + second;
    }
    let hora = hour + ':' + minute + ':' + second;
    return hora;
}