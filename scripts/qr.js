/*
 *
 *  * Copyright (c) 2020, Nathan Reed <nreed@linux.com>
 *  *
 *  * SPDX-License-Identifier: MIT
 *
 */

const {ipcRenderer} = require('electron');
const os = require('os');
const interfaces = os.networkInterfaces();
const qr = require('qrcode');

/* 
 * This will go out and get the local(private) IP address of the host machine
 * this will be used to create a qrcode with a port to enable the user to control
 * the media displayed on their machine
 */
let addresses = [];
for (let i in interfaces) {
    for (let k in interfaces[i]) {
        let address = interfaces[i][k];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

/* 
 * Setting the ip item for later (in our browsing session)
 * Then assigning it for use in the immmediate future
 */
window.sessionStorage.setItem('ip_addr', addresses[0]);
const ip = window.sessionStorage.getItem('ip_addr')


/*
 * create the qrcode element via the DOM, so the user has access to the phone application page
 */
ipcRenderer.send('post-port', 'post');
const port = ipcRenderer.sendSync('get-port', 'port');
qr.toCanvas(
    "http://" + ip + ":" + port,
    {scale: 20, errorCorrectionLevel: 'H'},
    (err, canvas) => {
        if (err) throw err;
        let container = document.getElementById('card');
        container.appendChild(canvas);
    }
)
