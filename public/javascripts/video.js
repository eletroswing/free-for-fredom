var src = document.getElementById("video")
var player = document.getElementById("player")
var topDiv = document.getElementById('top')
var bottom = document.getElementById('bottom')

var play = document.getElementById('play')
var fullscreen = document.getElementById('fullscreen')
var mute = document.getElementById('sound')

var input = document.getElementById('input_component')
var inputFocused = false;

var player_state = {
    paused: false,
    showControls: true,
    isFullScreen: false,
    mute: true,
}

function MuteUnmute(e) {
    player_state.mute = !player_state.mute
    if(player_state.mute) {
        src.muted = true;
        mute.innerHTML = `
        <span class="tooltiptext">Tirar do mudo (m)</span>
        <svg fill="currentColor" width="25" height="25" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1q25cff-1 dSicFr"><path d="M5 7l4.146-4.146a.5.5 0 01.854.353v13.586a.5.5 0 01-.854.353L5 13H4a2 2 0 01-2-2V9a2 2 0 012-2h1zM12 8.414L13.414 7l1.623 1.623L16.66 7l1.414 1.414-1.623 1.623 1.623 1.623-1.414 1.414-1.623-1.623-1.623 1.623L12 11.66l1.623-1.623L12 8.414z"></path></svg>
     
        `
    }
    if(!player_state.mute){ 
        src.muted = false;
        mute.innerHTML = `
        <span class="tooltiptext">Mudo (m)</span>
        <svg  fill="currentColor" width="25" height="25" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1q25cff-1 dSicFr"><g><path d="M9.146 2.853L5 7H4a2 2 0 00-2 2v2a2 2 0 002 2h1l4.146 4.146a.5.5 0 00.854-.353V3.207a.5.5 0 00-.854-.353zM12 8a2 2 0 110 4V8z"></path><path d="M12 6a4 4 0 010 8v2a6 6 0 000-12v2z"></path></g></svg>

       `
    }
}

function PlayPause(e){
    player_state.paused = !player_state.paused
    if(player_state.paused) {
        !src.paused && src.pause()
        play.innerHTML = `
        <span class="tooltiptext">Pausar (espaço/k)</span>
        <svg fill="currentColor" width="25" height="25" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1q25cff-1 dSicFr"><g><path d="M5 17.066V2.934a.5.5 0 01.777-.416L17 10 5.777 17.482A.5.5 0 015 17.066z"></path></g></svg>`
    }
    if(!player_state.paused){ 
        src.paused && video.play()

        src.currentTime = src.buffered.end(0) - 3

        play.innerHTML = `
        <span class="tooltiptext">Reproduzir (espaço/k)</span>
        <svg fill="currentColor" width="25" height="25" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1q25cff-1 dSicFr"><g><path d="M8 3H4v14h4V3zM16 3h-4v14h4V3z"></path></g></svg>`
    }
}

function toggleFullScreen(e) {    
    if (document.fullscreenElement) {
      document.exitFullscreen();
      player_state.isFullScreen = false
    } else if (document.webkitFullscreenElement) {
      // Need this to support Safari
      document.webkitExitFullscreen();
      player_state.isFullScreen = true
    } else if (player.webkitRequestFullscreen) {
      // Need this to support Safari
      player.webkitRequestFullscreen();
      player_state.isFullScreen = true
    } else {
      player.requestFullscreen();
      player_state.isFullScreen = true
    }

    updateFullscreenButton() 

  }
  
  function updateFullscreenButton() {
    if (player_state.isFullScreen) {
        fullscreen.innerHTML = `
        <span class="tooltiptext border">Minimizar (f)</span>
        <svg fill="currentColor" width="25" height="26"  version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1q25cff-1 dSicFr"><g><path d="M8 8V3H6v3H2v2h6zM12 8h6V6h-4V3h-2v5zM12 17v-5h6v2h-4v3h-2zM8 12H2v2h4v3h2v-5z"></path></g></svg>`
    } else {
        fullscreen.innerHTML = `
        <span class="tooltiptext border">Tela Cheia (f)</span>
        <svg fill="currentColor" width="25" height="26" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1q25cff-1 dSicFr"><g><path d="M7 3H2v5h2V5h3V3zM18 8V3h-5v2h3v3h2zM13 17v-2h3v-3h2v5h-5zM4 12H2v5h5v-2H4v-3z"></path></g></svg>`
    }
  }

  function keyboardShortcuts(event) {
    if(inputFocused) return;
    const { key } = event;
    switch (key) {
      case 'k':
        PlayPause();
        break;
      case ' ':
          PlayPause();
          break;
    case 'm':
        MuteUnmute();
        break;
      case 'f':
        toggleFullScreen();
        break;
    }
  }

function handleSimpleClick(e){
  showControls()
}

function exitHandler() {
      if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        player_state.isFullScreen = false
        updateFullscreenButton();
      }
  }  

var ControlTimer;

function hideControls(){
    player_state.showControls = false
    bottom.classList.add("hide");
    topDiv.classList.add("hide");
}


function showControls(){
    player_state.showControls = true;
    bottom.classList.remove("hide");
    topDiv.classList.remove("hide");
}

function SwitchControl() {
    clearTimeout(ControlTimer)
    showControls()
    ControlTimer = setTimeout(() => {
        hideControls()
    }, 2000)
}

ControlTimer = setTimeout(() => {
    hideControls()
}, 2000)

src.addEventListener("canplay", ()=> {
    play.addEventListener('click', PlayPause)
    mute.addEventListener('click', MuteUnmute)
    fullscreen.addEventListener('click', toggleFullScreen)
    document.addEventListener('keyup', keyboardShortcuts);
    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);
    src.addEventListener('dblclick', toggleFullScreen);
    src.addEventListener('click', handleSimpleClick);

    player.addEventListener('mouseleave', SwitchControl)
    player.addEventListener('mouseenter', SwitchControl)
    player.addEventListener('mousemove', SwitchControl)

    input.addEventListener('focusin', () => {inputFocused = true})
    input.addEventListener('focusout', () => {inputFocused = false})
})
