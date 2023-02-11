var chat = document.getElementById("content")
var form = document.getElementById('input')
var input = document.getElementById('input_component')

var principalNumber = document.getElementById('number')

var title = document.getElementById('title_camera')

var UUIDv4 = new function() {
	function generateNumber(limit) {
	   var value = limit * Math.random();
	   return value | 0;
	}
	function generateX() {
		var value = generateNumber(16);
		return value.toString(16);
	}
	function generateXes(count) {
		var result = '';
		for(var i = 0; i < count; ++i) {
			result += generateX();
		}
		return result;
	}
	function generateVariant() {
		var value = generateNumber(16);
		var variant =  (value & 0x3) | 0x8;
		return variant.toString(16);
	}
    // UUID v4
    //
    //   varsion: M=4 
    //   variant: N
    //   pattern: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
    //
	this.generate = function() {
  	    var result = generateXes(8)
  	         + '-' + generateXes(4)
  	         + '-' + '4' + generateXes(3)
  	         + '-' + generateVariant() + generateXes(3)
  	         + '-' + generateXes(12)
  	    return result;
	};
};
var currentCamera = 'bbbcam1';
var MyCam = {
  'bbbcam1': {
    title: "Principal"
  },
  'bbbcam2': {
    title: "Principal 2"
  },
  'bbbcam3': {
    title: "Mosaico"
  },
  'bbbcam4': {
    title: "Quarto: Deserto"
  },
  'bbbcam5': {
    title: "Quarto: Fundo do mar"
  },
  'bbbcam6': {
    title: "Sala"
  },
  'bbbcam7': {
    title: "Cozinha"
  },
  'bbbcam8': {
    title: "Piscina"
  },
  'bbbcam9': {
    title: "Jardim 1"
  },
  'bbbcam10': {
    title: "Jardim 2"
  },
  'bbbcam11': {
    title: "Varanda"
  },
  'bbbcam12': {
    title: "Confessionário"
  },

}
var socket = io();

var sync = false;

var username;
while (true) {
  username = prompt("Digite um nome:");
  if (username) break;
}
socket.emit("client.username.check", username);

//sync the client
socket.on("server.cansync", () => {
  socket.emit("client.sync", {
    room: MyCam['bbbcam1'].title,
    username: username,
  });
  sync = true;
});

socket.on("server.username.exists", (user) => {
  username = prompt(`${user} já existe! Tente outro:`);
  socket.emit("client.username.check", username);
});

//when receive a chat message
socket.on("server.chat.message", (data) => {
  addMessage(data)
});

//when the room update
socket.on("server.rooom.update", (data) => {
  let camera;
  let users = 0;

  Object.keys(data.roomData).forEach(key => {
    users = users + data.roomData[key]
  })

  principalNumber.innerHTML = `
  <p>${users}</p>`
});

//---------------------------------------------

var video = document.getElementById("video");

var CurrentHLS;

if (Hls.isSupported()) {
  change();
}

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

function sanitizeFunc(string){
  return string
}

function addMessage(data){
  let color = stringToColour(data.owner.username) 
  let id = UUIDv4.generate()
  chat.innerHTML = chat.innerHTML + `
  <div class="message">
    <p id="message"><i id="i ${id}"></i><strong id="strong ${id}" style="color:${color}"></strong>: <b id="b ${id}"></b> </p>
  </div>
  `

  let user = document.getElementById(`strong ${id}`)
  user.innerText = data.owner.username

  let i = document.getElementById(`i ${id}`)
  i.innerText = data.owner.room

  let b = document.getElementById(`b ${id}`)
  b.innerText = data.content.message
  chat.scrollTo(0, chat.scrollHeight);
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  let message = input.value
  input.value = ""
  if(message){
    socket.emit("client.chat.message", message);
  }
})



function change(cam = "bbbcam1") {
  if (CurrentHLS) {
    CurrentHLS.destroy();
  }


  CurrentHLS = new Hls();
  CurrentHLS.loadSource(
    `/api/v1/channels/${cam}`
  );

  currentCamera = cam
  title.innerText = MyCam[cam].title
  socket.emit("client.change.room", MyCam[cam].title);

  CurrentHLS.attachMedia(video);
  CurrentHLS.on(Hls.Events.MANIFEST_PARSED, function () {
    video.play();
  });

}

let buttons = document.querySelectorAll(".button")

buttons.forEach((button) => {
  button.addEventListener('click', handleButtonClick)
})

function handleButtonClick(e){
  if (e.srcElement.dataset.identifier && currentCamera != e.srcElement.dataset.identifier) {
    change(e.srcElement.dataset.identifier)
  }
}
//* console ban in code*/
/*!
 * console-ban v5.0.0
 * (c) 2020-2023 fz6m
 * Released under the MIT License.
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).ConsoleBan={})}(this,(function(e){"use strict";var t=function(){return t=Object.assign||function(e){for(var t,n=1,i=arguments.length;n<i;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},t.apply(this,arguments)},n={clear:!0,debug:!0,debugTime:3e3,bfcache:!0},i=2,o=function(e){return~navigator.userAgent.toLowerCase().indexOf(e)},r=function(e,t){t!==i?location.href=e:location.replace(e)},c=0,a=0,f=function(e){var t=0,n=1<<c++;return function(){(!a||a&n)&&2===++t&&(a|=n,e(),t=1)}},s=function(e){var t=/./;t.toString=f(e);var n=function(){return t};n.toString=f(e);var i=new Date;i.toString=f(e),console.log("%c",n,n(),i);var o,r,c=f(e);o=c,r=new Error,Object.defineProperty(r,"message",{get:function(){o()}}),console.log(r)},u=function(){function e(e){var i=t(t({},n),e),o=i.clear,r=i.debug,c=i.debugTime,a=i.callback,f=i.redirect,s=i.write,u=i.bfcache;this._debug=r,this._debugTime=c,this._clear=o,this._bfcache=u,this._callback=a,this._redirect=f,this._write=s}return e.prototype.clear=function(){this._clear&&(console.clear=function(){})},e.prototype.bfcache=function(){this._bfcache&&(window.addEventListener("unload",(function(){})),window.addEventListener("beforeunload",(function(){})))},e.prototype.debug=function(){if(this._debug){var e=new Function("debugger");setInterval(e,this._debugTime)}},e.prototype.redirect=function(e){var t=this._redirect;if(t)if(0!==t.indexOf("http")){var n,i=location.pathname+location.search;if(((n=t)?"/"!==n[0]?"/".concat(n):n:"/")!==i)r(t,e)}else location.href!==t&&r(t,e)},e.prototype.callback=function(){if((this._callback||this._redirect||this._write)&&window){var e,t=this.fire.bind(this),n=window.chrome||o("chrome"),r=o("firefox");if(!n)return r?((e=/./).toString=t,void console.log(e)):void function(e){var t=new Image;Object.defineProperty(t,"id",{get:function(){e(i)}}),console.log(t)}(t);s(t)}},e.prototype.write=function(){var e=this._write;e&&(document.body.innerHTML="string"==typeof e?e:e.innerHTML)},e.prototype.fire=function(e){this._callback?this._callback.call(null):(this.redirect(e),this._redirect||this.write())},e.prototype.prepare=function(){this.clear(),this.bfcache(),this.debug()},e.prototype.ban=function(){this.prepare(),this.callback()},e}();e.init=function(e){new u(e).ban()}}));

//protect
document.addEventListener('contextmenu', event => event.preventDefault())
ConsoleBan.init({
  redirect: '/disclaimer'
})