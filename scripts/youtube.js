let tag; 
let scriptTag;

tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

scriptTag = document.getElementsByTagName('script')[0];
scriptTag.parentNode.insertBefore(tag, scriptTag);

// get window width,height
function getWindowsSize() {
    let h = window.innerHeight;
    let w = window.innerWidth;
    return [w,h];
}

ipcRenderer.on('action-play-video', (_,arg) => {
    // remove present iframe instances
    document.querySelectorAll('iframe').forEach(
        (elem) => {
            elem.parentNode.removeChild(elem);
        }
    );

    console.log('attempt to play video')

    // attempt to delete the card to get rid of QR Code staging
    let card = document.getElementById('card');
    if (card) card.remove();

    // start iframe instance
    createYoutubeIFrameInstance(arg);
})


// correct iframe size when we resize the window
window.addEventListener('resize', updateYoutubeIFrameSize);
function updateYoutubeIFrameSize() {
    let size = getWindowsSize();
    let w = size[0];
    let h = size[1];
    document.getElementById('player').width = w;
    document.getElementById('player').height = h;
}

function createYoutubeIFrameInstance(split) {


    console.log('iframe-instance-start got ', split)
    let size = getWindowsSize();
    let w = size[0];
    let h = size[1];

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
        'playsinline': 1
        },
        // events: {
        //   'onReady': onPlayerReady,
        //   'onStateChange': onPlayerStateChange
        // }
    });
    // get DOM elements from the youtube iframe
    // player.getIframe().contentWindow.document

    setTimeout((e) => {player.playVideo();}, 300)
    
}

ipcRenderer.on('play', (_, arg) => {
    console.log("deciding on: ", arg)
    switch (arg) {
        case 1:
            console.log("Playing video");
            player.playVideo();
            window.sessionStorage.setItem('isPlaying', 0);
            break;
        
        case 0:
            console.log("Pausing video");
            player.pauseVideo();
            window.sessionStorage.setItem('isPlaying', 1);
            break;
        
        default:
            console.error("invalid response from main process", arg);
            break;
    }
    return;
});

ipcRenderer.on('fullscreen', (_, arg) => {
    if (window.sessionStorage.getItem('isPlaying') == 0) {
        console.log("deciding fullscreen on: ", arg)
        switch (arg) {
            case 1:
                console.log("Fullscreen");
                let fcele = document.querySelector("[title='Full screen (f)']").click();
                window.sessionStorage.setItem('isFullscreen', 0);
                break;
            
            case 0:
                console.log("UnFullscreen");
                player.pauseVideo();
                document.getElementsByClassName('ytp-fullscreen-button').click();
                window.sessionStorage.setItem('isFullscreen', 1);
                break;
            
            default:
                console.error("invalid response from main process", arg);
                break;
        }
    }
return;
});

