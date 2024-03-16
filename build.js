// ./build_installer.js

// 1. Import Modules
const env = require('./src/utils/env')
const { MSICreator } = require('electron-wix-msi');
const path = require('path');
const fs = require('fs');

async function initCreateMsi(){

    const pathReleaseBuilds = path.resolve(__dirname, './release-builds')
    // let pathBuild
    const pathBuild = fs.readdirSync(pathReleaseBuilds);
    // 2. Define input and output directory.
    // Important: the directories must be absolute, not relative e.g
    // appDirectory: 
    const APP_DIR = path.resolve(__dirname, pathReleaseBuilds ,pathBuild[0]);
    // outputDirectory: "C:\\Users\sdkca\Desktop\windows_installer", 
    const OUT_DIR = path.resolve(__dirname, './windows_installer');

    const pathImgs = './assets/icons/installer/';
    // 3. Instantiate the MSICreator
    const icon16 = path.resolve(__dirname, pathImgs, '16.png');
    const icon32 = path.resolve(__dirname, pathImgs, '32.png');
    const background = path.resolve(__dirname, pathImgs, 'background.jpg');
    const banner = path.resolve(__dirname, pathImgs, 'banner.jpg');

    const msiCreator = new MSICreator({
        appDirectory: APP_DIR,
        outputDirectory: OUT_DIR,
        
        // Configure metadata
        description: 'Alac Player Desktop App',
        exe: 'Alac-Player',
        name: 'Alac-Player',
        manufacturer: 'Alac OohPerú.',
        version: `${env.version}`,
        language: 2073,
        
    
        // Configure installer User Interface
        ui: {
            chooseDirectory: true,
            images:{
                background: background,
                banner: banner,
                exclamationIcon: icon32,
                infoIcon: icon32,
                newIcon: icon16,
                upIcon: icon16
            }
        },
        arch: "x64"
    });

    // 4. Create a .wxs template file
    msiCreator.create().then(function(){

        // Step 5: Compile the template to a .msi file
        msiCreator.compile();
    });
}

initCreateMsi()