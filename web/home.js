import { main } from "./index.js";
import {renderAuth} from './auth.js'
import {renderProfile} from './profile.js'

"use strict";



function	selectSettings()
{
	document.querySelector("#matchType").value = sessionStorage.getItem("matchType");
	document.querySelector("#ballColor").value = sessionStorage.getItem("ballColor");
	document.querySelector("#paddleColor").value = sessionStorage.getItem("paddleColor");
	document.querySelector("#backgroundColor").value = sessionStorage.getItem("backgroundColor");
	if (document.querySelector("#userNameDisplay") && document.querySelector("#userNameDisplay").innerText !== "")
		sessionStorage.setItem("alias", document.getElementById("userNameDisplay").innerText);
	document.querySelector("#tournamentAlias").setAttribute("placeholder", sessionStorage.getItem("alias") );
//	value = sessionStorage.getItem("alias");
	document.querySelector("#tournamentAlias").onchange = () => sessionStorage.setItem("alias", document.querySelector("#tournamentAlias").value)
}

function aliasIsValid(alias)
{
	if (alias.length < 1 || alias.length > 10)
		return false;
	const regex = /^[a-zA-Z0-9_ ]+$/;

	if (!regex.test(alias))
		return (false);
	return (true);
}

function checkAlias()
{
	if (!sessionStorage.getItem("alias"))
	{
		if (document.querySelectorAll("#userNameDisplay")[0])
			sessionStorage.setItem("alias", document.getElementById("userNameDisplay").innerText);
		else
			sessionStorage.setItem("alias", "incognito");
	}
	else if (!aliasIsValid(sessionStorage.getItem("alias")))
		sessionStorage.setItem("alias", document.getElementById("userNameDisplay").innerText);
}

function	setupEventHandlers()
{
	document.getElementById("matchType").onclick = () => sessionStorage.setItem("matchType", document.getElementById("matchType").value);
	document.getElementById("ballColor").onclick = () => sessionStorage.setItem("ballColor", document.getElementById("ballColor").value);
	document.getElementById("paddleColor").onclick = () => sessionStorage.setItem("paddleColor", document.getElementById("paddleColor").value);
	document.getElementById("backgroundColor").onclick = () => sessionStorage.setItem("backgroundColor", document.getElementById("backgroundColor").value);

	document.getElementById("btnFriendlyMatch").onclick = () => { checkAlias(), sessionStorage.setItem("currentView", "game"), sessionStorage.setItem("gameMode", "friendlyMatch"), main() };
	document.getElementById("btnTournament").onclick = () => { checkAlias(), sessionStorage.setItem("currentView", "game"), sessionStorage.setItem("gameMode", "tournament"), main() };
}


	/*	MAIN FUNCTION	*/
export function	renderHome()
{
	selectSettings();
	setupEventHandlers();
}
