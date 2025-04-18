import {renderAuth} from './auth.js'
import {renderProfile} from './profile.js'
import {renderPongGame} from './pong_game.js'

"use strict";



function	selectSettings()
{
	document.querySelector("#matchType").value = localStorage.getItem("matchType");
	document.querySelector("#gameType").value = localStorage.getItem("gameType");
	document.querySelector("#ballColor").value = localStorage.getItem("ballColor");
	document.querySelector("#paddleColor").value = localStorage.getItem("paddleColor");
	document.querySelector("#backgroundColor").value = localStorage.getItem("backgroundColor");
}



function	setupEventHandlers()
{
	document.getElementById("btnFriendlyMatch").addEventListener("click", ()=> renderPongGame() );
	document.getElementById("btnTournament").addEventListener("click", ()=> alert("This feature has not been implemented yet.") ) ;

	document.getElementById("matchType").addEventListener("click", function() { localStorage.setItem("matchType", document.getElementById("matchType").value) });
	document.getElementById("ballColor").addEventListener("click", function() { localStorage.setItem("ballColor", document.getElementById("ballColor").value) });
	document.getElementById("paddleColor").addEventListener("click", function() { localStorage.setItem("paddleColor", document.getElementById("paddleColor").value) });
	document.getElementById("backgroundColor").addEventListener("click", function() { localStorage.setItem("backgroundColor", document.getElementById("backgroundColor").value) });
}


	/*	MAIN FUNCTION	*/
export function	renderHome()
{
	selectSettings();
	setupEventHandlers();
}
