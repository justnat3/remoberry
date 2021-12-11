/*
 *
 *  * Copyright (c) 2020, Nathan Reed <nreed@linux.com>
 *  *
 *  * SPDX-License-Identifier: MIT
 *
 */

// Modules to control application life and create native browser window
const path = require('path');
const {app, BrowserWindow, ipcMain} = require('electron');
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const expressApp = express();
const cors = require("cors");
const port = 3000;
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1260,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.removeMenu();
    // and load the index.html of the app.
    mainWindow.loadFile('pub/index.html');
    // application port assignment
    ipcMain.on('get-port', (e) => {
        e.returnValue = port;
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

      // set state for play pause
      mainWindow.webContents.executeJavaScript("window.sessionStorage.setItem('isPlaying', 1)", true).then(console.log("Set Playing state"));
      mainWindow.webContents.executeJavaScript("window.sessionStorage.setItem('isFullscreen', 1)", true).then(console.log("Set Fullscreen state"));
      mainWindow.webContents.executeJavaScript("window.sessionStorage.setItem('volume', 100)", true).then(console.log("Set Volume state"));

    // ensure that window does not start in fullscreen
    mainWindow.setFullScreen(false);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
})


/*
 * Serve the mobile folder as static files for the client
 * in the "landing" page for mobile we want to send the client the ip/port for our api in a cookie
 * also serve the volume as a cookie
 */
expressApp.use(express.static('mobile'));
expressApp.use(cors());
expressApp.get('/', (_, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    mainWindow.webContents.executeJavaScript(
        "window.sessionStorage.getItem('ip_addr');",
        true
    )
        .then(ip => {
            res.cookie('ip_addr', ip, {maxAge: 9000000, httpOnly: false});
            res.cookie('port', port, {maxAge: 9000000, httpOnly: false});
            res.sendFile(path.join(__dirname, 'mobile/mobile.html'));
        });
});

/*
 * Play Pause Video
 */
expressApp.post('/play', jsonParser, (_, res) => {

    /*
     * when we start the play sequence we start at 1 so we know if we are playing or not
     * play:   1
     * pause:  0
     */

    mainWindow.webContents.executeJavaScript(
        "window.sessionStorage.getItem('isPlaying');",
        true
    )
        .then(state => {
            switch (state) {
                case "1":
                    mainWindow.webContents.send('play', 1);
                    break;

                case "0":
                    mainWindow.webContents.send('play', 0);
                    break;

                default:
                    console.error('unknown operation');
                    return;
            }
        });

    res.status(200);
    res.end();
});

expressApp.post('/fullscreen', (_, res) => {
    if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
        res.status(200)
        res.end()
    } else {
        mainWindow.setFullScreen(true);
        res.status(200)
        res.end()
    }
});

expressApp.post('/volup', (_, res) => {
    mainWindow.webContents.send(
        'volume-up',
        0
    );
    res.status(200);
    res.end();
});

expressApp.post('/voldown', (_, res) => {
    mainWindow.webContents.send(
        'volume-down',
        0
    );
    res.status(200);
    res.end();
});

expressApp.post('/mute', (_, res) => {
    mainWindow.webContents.send(
        'mute',
        0
    );
    res.status(200);
    res.end();
});

expressApp.post('/exit', (_, res) => {
    res.send(path.join(__dirname, 'mobile/Exit.html'));
    res.status(200);
    res.end();
    mainWindow.close();
});

/*
  * Load the Video
  */
expressApp.post('/vidid', jsonParser, (req, res) => {
    mainWindow.webContents.send(
        'action-play-video',
        req.body.vid
    );
    res.status(200);
    res.end();
});

app.commandLine.appendSwitch('remote-debugging-port', '6000');

expressApp.listen(
    port,
    () => {
        console.log(`Listening on for requests on -> ${port}`);
    })