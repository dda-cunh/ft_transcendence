import {renderAuth} from './auth.js'
import {renderProfile} from './profile.js'
import {renderPongGame} from './pong_game.js'
import {connectWebSocket} from './socket.js'

"use strict";



function	selectSettings()
{
	document.querySelector("#matchType").value = sessionStorage.getItem("matchType");
	document.querySelector("#ballColor").value = sessionStorage.getItem("ballColor");
	document.querySelector("#paddleColor").value = sessionStorage.getItem("paddleColor");
	document.querySelector("#backgroundColor").value = sessionStorage.getItem("backgroundColor");
}



function	setupEventHandlers()
{
	document.getElementById("btnFriendlyMatch").onclick = () => { renderPongGame(); connectWebSocket('remote') };
	document.getElementById("btnTournament").onclick = () => { renderPongGame(); connectWebSocket('tournament')};
	document.getElementById("matchType").onclick = () => sessionStorage.setItem("matchType", document.getElementById("matchType").value);
	document.getElementById("ballColor").onclick = () => sessionStorage.setItem("ballColor", document.getElementById("ballColor").value);
	document.getElementById("paddleColor").onclick = () => sessionStorage.setItem("paddleColor", document.getElementById("paddleColor").value);
	document.getElementById("backgroundColor").onclick = () => sessionStorage.setItem("backgroundColor", document.getElementById("backgroundColor").value);
}


	/*	MAIN FUNCTION	*/
export function	renderHome()
{
	selectSettings();
	setupEventHandlers();
}
