import {renderAuth} from './auth.js'
import {renderProfile} from './profile.js'
import {renderPongGame} from './pong_game.js'
import {connectWebSocket} from './socket.js'

"use strict";



function	selectSettings()
{
	document.querySelector("#matchType").value = localStorage.getItem("matchType");
	document.querySelector("#ballColor").value = localStorage.getItem("ballColor");
	document.querySelector("#paddleColor").value = localStorage.getItem("paddleColor");
	document.querySelector("#backgroundColor").value = localStorage.getItem("backgroundColor");
}



function	setupEventHandlers()
{
	document.getElementById("btnFriendlyMatch").onclick = () => { renderPongGame(); connectWebSocket('remote') };
	document.getElementById("btnTournament").onclick = () => { renderPongGame(); connectWebSocket('tournament')};
	document.getElementById("matchType").onclick = () => localStorage.setItem("matchType", document.getElementById("matchType").value);
	document.getElementById("ballColor").onclick = () => localStorage.setItem("ballColor", document.getElementById("ballColor").value);
	document.getElementById("paddleColor").onclick = () => localStorage.setItem("paddleColor", document.getElementById("paddleColor").value);
	document.getElementById("backgroundColor").onclick = () => localStorage.setItem("backgroundColor", document.getElementById("backgroundColor").value);
}


	/*	MAIN FUNCTION	*/
export function	renderHome()
{
	selectSettings();
	setupEventHandlers();
}
