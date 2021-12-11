/*
 *
 *  * Copyright (c) 2020, Nathan Reed <nreed@linux.com>
 *  *
 *  * SPDX-License-Identifier: MIT
 *
 */


let tag;
let volume;
let scriptTag;
let player;

tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

scriptTag = document.getElementsByTagName('script')[0];
scriptTag.parentNode.insertBefore(tag, scriptTag);

// get window width,height
function getWindowsSize() {
    let h = window.innerHeight;
    let w = window.innerWidth;
    return [w, h];
}

ipcRenderer.on('action-play-video', (_, arg) => {
    // remove present iframe instances
    document.querySelectorAll('iframe').forEach(
        (elem) => {
            elem.parentNode.removeChild(elem);
        }
    );

    // attempt to delete the card to get rid of QR Code staging
    let card = document.getElementById('card');
    if (card) card.remove();

    // start iframe instance
    createYoutubeIFrameInstance(arg);
})


// correct iframe size when we resize the window
window.addEventListener('resize', updateYoutubeIFrameSize);

function updateYoutubeIFrameSize() {
    const size = getWindowsSize();
    const w = size[0];
    const h = size[1];
    if (document.getElementById('player')) {
        document.getElementById('player').width = w;
        document.getElementById('player').height = h;
    }
}

function createYoutubeIFrameInstance(split) {
    const size = getWindowsSize();
    const w = size[0];
    const h = size[1];

    let prediv = document.getElementById('player')
    if (prediv) prediv.remove();

    // create a div for the iframe to attach to 
    let playerdiv = document.createElement('div');
    playerdiv.id = "player";
    document.body.appendChild(playerdiv);

    player = new YT.Player('player', {
        height: h.toString(),
        width: w.toString(),
        videoId: split,
        playerVars: {
            "playsinline": 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });

    // get DOM elements from the youtube iframe
    // player.getIframe().contentWindow.document
    setTimeout(() => {
        player.playVideo();
    }, 700);
}

function onPlayerReady(e) {
    // set initial volume
    e.target.setVolume(50);
}

ipcRenderer.on('volume-up', (_) => {
    // get current volume
    volume = parseInt(window.sessionStorage.getItem('volume'));

    if (document.getElementById('player')) {
        player.setVolume(volume + 10);
        if (volume === 100) return;
        window.sessionStorage.setItem('volume', volume + 10);
    }
});

ipcRenderer.on('volume-down', (_, arg) => {
    // get current volume
    volume = parseInt(window.sessionStorage.getItem('volume'));
    console.log(volume)
    if (document.getElementById('player')) {
        player.setVolume(volume - 10);
        if (volume === 0 ) return;
        window.sessionStorage.setItem('volume', volume - 10);
    }
});


ipcRenderer.on('play', (_, arg) => {
    switch (arg) {
        case 1:
            if (document.getElementById('player')) {
                player.playVideo();
                window.sessionStorage.setItem('isPlaying', '0');
                break;
            }

        case 0:
            if (document.getElementById('player')) {
                player.pauseVideo();
                window.sessionStorage.setItem('isPlaying', '1');
            }
            break;

        default:
            console.error("invalid response from main process", arg);
            break;
    }

});

