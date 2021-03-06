/*
 *
 *  * Copyright (c) 2020, Nathan Reed <nreed@linux.com>
 *  *
 *  * SPDX-License-Identifier: MIT
 *
 */

let port;
let ip;
let id;
let volume;
let prevVideoID;
// TODO: URL should really just be in the global context

// ensure that we have addr information
window.onload = () => { getAddrInfoRoutine(); }

/*
 * ensure to send the link for the youtube video
 */
function SendVideoLink() {
    // this leads back to our API
    const url = `http://${ip}:${port}/vidid`;

    // get input url value, and assign it to prev to look at later
    let media = document.getElementById('media-input').value;

    console.log(media, prevVideoID)
    // this is to know if we truly have to recreate the iframe
    prevVideoID = media;

    switch (true) {

        /*
         * normal youtube link domain
         */
        case media.includes("youtube.com"):
            let split = media.split('&')[0].split('v=');
            id = split[1];
            break;

        /*
         * this stims from when someone is getting a youtube from a mobile device,
         * it shortens the link to youtu.be with the video id as the extension of that url
         */
        case media.includes("youtu.be"):
            id = media.split('be/')[1];
            break;

        /*
         * Deny any media we do not support
         */
        default:
            alert("Media Not Available");
            return;

    }

    /*
     * Create and send the request back to our API
     */

    console.log(url, "attempting to send video")

    // finally, send the video ID back to the API
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
            vid: id
        })
    );

    // clear the input field so that we don't have to delete the current url to go to another video
    document.getElementById('media-input').value = "";
    return;
}

function getAddrInfoRoutine() {
    // a little parsing routine for the ip & port combo we get from the cookie
    let cookie = document.cookie.split('; ');
    for (let i = 0; cookie.length; i++) {
        let data = cookie[i];
        console.log(data)

        if (data === undefined) break;

        if (data.includes('port')) {
            // kekw assign to local variable
            port = data.split('=')[1];

        } else if (data.includes('ip_addr')) {
            // kekw do it again
            ip = data.split('=')[1];

        } else if (data.includes('volume')){
            volume = data.split('=')[1];

        } else {
            alert(`altered data: ${data}`);
            console.log(data);
        }
    }
}

function volumeUp() {
    const url = `http://${ip}:${port}/volup`;

    /*
     * Create and send the request back to our API
     */
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
            value: 1
        })
    );
}

function mute() {

    const url = `http://${ip}:${port}/mute`;

    /*
     * Create and send the request back to our API
     */
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
            value: 1
        })
    );
}

function Exit() {

    const url = `http://${ip}:${port}/exit`;

    /*
     * Create and send the request back to our API
     */
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
            value: 1
        })
    );

    // document.body.remove();
}

function volumeDown() {
    const url = `http://${ip}:${port}/voldown`;
    console.log(url)

    /*
     * Create and send the request back to our API
     */
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
            value: 1
        })
    );
}

function Fullscreen() {
    const url = `http://${ip}:${port}/fullscreen`;
    console.log(url, ip, port)
    document.getElementById('fullscreen-button').disabled = true;

    setTimeout(() => {
        document.getElementById('fullscreen-button').disabled = false;
    }, 1000);
    let xhr = new XMLHttpRequest();

    /*
     * Create and send the request back to our API
     */
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
            value: 1
        })
    );
}

function getTotalDuration() {
    const url = `http://${ip}:${port}/total`;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    if (xhr.status == 200) {
        let res = xhr.response;
    }

}

function PlayPause() {
    let media = document.getElementById('media-input').value;

    if (!media) {
        // if we match the video playing then we can attempt to play pause it
        const url = `http://${ip}:${port}/play`;
        let xhr = new XMLHttpRequest();

        /*
        * Create and send the request back to our API
        */
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
                value: 1
            })
        );

    } else if (prevVideoID) {
        if (media !== prevVideoID) {
            console.log(media)
            SendVideoLink();
            return;
        }
        // if we match the video playing then we can attempt to play pause it
        const url = `http://${ip}:${port}/play`;
        let xhr = new XMLHttpRequest();

        /*
        * Create and send the request back to our API
        */
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
                value: 1
            })
        );
    } else if (!prevVideoID) {
        SendVideoLink();
    }
}
