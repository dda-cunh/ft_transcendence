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
	if (document.querySelector("#userNameDisplay").innerText !== "")
		sessionStorage.setItem("alias", document.getElementById("userNameDisplay").innerText);
	document.querySelector("#tournamentAlias").value = sessionStorage.getItem("alias");
	document.querySelector("#tournamentAlias").onchange = () => sessionStorage.setItem("alias", document.querySelector("#tournamentAlias").value)
}

function checkAlias() {
	if (!sessionStorage.getItem("alias"))
	{
		if (document.querySelectorAll("#userNameDisplay")[0])
			sessionStorage.setItem("alias", document.getElementById("userNameDisplay").innerText);
		else
			sessionStorage.setItem("alias", "incognito");
	}
}

function	setupEventHandlers()
{
	document.getElementById("matchType").onclick = () => sessionStorage.setItem("matchType", document.getElementById("matchType").value);
	document.getElementById("ballColor").onclick = () => sessionStorage.setItem("ballColor", document.getElementById("ballColor").value);
	document.getElementById("paddleColor").onclick = () => sessionStorage.setItem("paddleColor", document.getElementById("paddleColor").value);
	document.getElementById("backgroundColor").onclick = () => sessionStorage.setItem("backgroundColor", document.getElementById("backgroundColor").value);
	document.getElementById("btnFriendlyMatch").onclick = () => { checkAlias(), renderPongGame(); connectWebSocket(sessionStorage.getItem("matchType")) };
	document.getElementById("btnTournament").onclick = () => { checkAlias(), renderPongGame(); connectWebSocket('tournament')};
}


	/*	MAIN FUNCTION	*/
export function	renderHome()
{
	selectSettings();
	setupEventHandlers();
}
