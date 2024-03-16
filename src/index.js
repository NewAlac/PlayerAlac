const { createWindow } = require('./main')
const { app, Tray, Menu, BrowserWindow, dialog, ipcMain  } = require('electron')
const path = require('path')
const gotTheLock = app.requestSingleInstanceLock();
const customWindow = {};
require('electron-reload')(__dirname);

const main = require("./main");

let tray = null;
let interval1, interval2;


app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, '../favicon.ico'));

    const subMenu = [
        {
            label: '12 Horas',
            type: 'checkbox',
            click: () => {
                clearInterval(interval2);
                if (!interval1) {
                    interval1 = setInterval(main.reloadReset, 12 * 60 * 60 * 1000);
                    updateContextMenu('12 Horas');
                } else {
                    clearInterval(interval1);
                    interval1 = null;
                    updateContextMenu();
                }
            }
        },
        {
            label: '24 Horas',
            type: 'checkbox',
            click: () => {
                clearInterval(interval1);
                if (!interval2) {
                    interval2 = setInterval(main.reloadReset, 24 * 60 * 60 * 1000);
                    updateContextMenu('24 Horas');
                } else {
                    clearInterval(interval2);
                    interval2 = null;
                    updateContextMenu();
                }
            }
        }
    ];

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Update Player Interval', type: 'submenu', submenu: subMenu },
        { type: 'separator' },
        { label: 'Salir', type: 'normal', click: () => app.quit() }
    ]);

    tray.setToolTip('Robot Alac');
    tray.setContextMenu(contextMenu);

    function updateContextMenu(selectedOption = null) {
        const updatedSubMenu = subMenu.map((item) => {
            const newItem = { ...item };
            if (item.label === selectedOption) {
                newItem.checked = true;
            } else {
                newItem.checked = false;
            }
            return newItem;
        });
        const updatedContextMenu = Menu.buildFromTemplate([
            { label: 'Opciones', type: 'submenu', submenu: updatedSubMenu },
            { type: 'separator' },
            { label: 'Salir', type: 'normal', click: () => app.quit() }
        ]);
        tray.setContextMenu(updatedContextMenu);
    }
});


customWindow.close = function () {
    console.log('Cerrando ventana...');
};

app.allowRendererProcessReuse = false

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Aplicativo ya está abierto',
            message: 'El aplicativo ya está abierto en otra ventana.',
        });
    });

    app.whenReady().then(createWindow)
}
