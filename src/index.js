const { app, Tray, Menu, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater'); // Importa autoUpdater desde electron-updater
const main = require('./main'); // Ajusta la ruta según la ubicación real de tu archivo main

let tray = null;
let interval1, interval2;

// Configuración de electron-reload
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// Función para crear y configurar la bandeja y el menú contextual
function createTrayAndContextMenu() {
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
            newItem.checked = (item.label === selectedOption);
            return newItem;
        });
        const updatedContextMenu = Menu.buildFromTemplate([
            { label: 'Update Player Interval', type: 'submenu', submenu: updatedSubMenu },
            { type: 'separator' },
            { label: 'Salir', type: 'normal', click: () => app.quit() }
        ]);
        tray.setContextMenu(updatedContextMenu);
    }
}

// Configuración de la aplicación
app.allowRendererProcessReuse = false;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Aplicativo ya está abierto',
            message: 'El aplicativo ya está abierto en otra ventana.',
        });
    });

    app.whenReady().then(() => {
        createTrayAndContextMenu();
        main.createWindow(); // Aquí se llama a createWindow desde el módulo main

        // Configuración de actualización automática
        autoUpdater.checkForUpdatesAndNotify(); // Comprueba actualizaciones y notifica al usuario

        // Manejo de eventos de actualización
        autoUpdater.on('update-available', () => {
            dialog.showMessageBox({
                type: 'info',
                title: 'Actualización disponible',
                message: 'Una nueva versión de la aplicación está disponible. ¿Desea actualizar ahora?',
                buttons: ['Actualizar', 'Cancelar']
            }).then(({ response }) => {
                if (response === 0) {
                    autoUpdater.downloadUpdate(); // Descarga la actualización si el usuario decide actualizar
                }
            });
        });

        autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox({
                type: 'info',
                title: 'Actualización descargada',
                message: 'La actualización se ha descargado completamente. La aplicación se cerrará para aplicar los cambios.',
                buttons: ['Aceptar']
            }).then(() => {
                autoUpdater.quitAndInstall(); // Instala la actualización y reinicia la aplicación
            });
        });

        autoUpdater.on('error', (error) => {
            console.error('Error de actualización:', error.message);
        });
    });
}
