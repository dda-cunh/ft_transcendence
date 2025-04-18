import {renderAuth} from './auth.js'
import {renderProfile} from './profile.js'
import {renderPongGame} from './pong_game.js'
import {connectWebSocket} from './socket.js'

"use strict";


	/*	PAGE RENDERING	*/
function	renderPage()
{
	let	transcendenceApp = document.getElementById("ctrlsRow");

	transcendenceApp.innerHTML = `
				<div class="col-12 col-lg-5 mx-lg-1 my-2 border">
					<div class="row">
						<div class="col-12">
							<h1 class="mt-4">PLAY PONG</h1>
						</div>
					</div>
					<div class="row py-3 my-5 justify-content-center">
						<div class="col-8 col-lg-6 d-grid gap-3 my-5">
							<button id="btnFriendlyMatch" type="button" class="btn btn-lg btn-primary fw-bolder">FRIENDLY MATCH</button>
							<button id="btnTournament" type="button" class="btn btn-lg btn-danger fw-bolder">TOURNAMENT</button>
						</div>
					</div>
				</div>
				<div class="col-12 col-lg-5 mx-lg-1 my-2 px-5 border">
					<h1 class="mt-4">SETTINGS</h1>
					<div class="row my-1 justify-content-center">
						<div class="col col-lg-10 mt-4">
							<h3>GAMEPLAY</h3>
							<div class="input-group py-1">
								<label class="input-group-text bg-dark text-light w-50 text-wrap">Match Type</label>
								<select id="matchType" class="form-select bg-dark text-light text-center">
									<option value="Single Player">Single Player</option>
									<option value="Local Multiplayer">Local Multiplayer</option>
									<option value="Online Multiplayer">Online Multiplayer</option>
								</select>
							</div>
							<div class="input-group py-1">
								<label class="input-group-text bg-dark text-light w-50 text-wrap">Game Type</label>
								<select id="gameType" class="form-select bg-dark text-light text-center">
									<option>Original</option>
									<option>Enhanced</option>
								</select>
							</div>
						</div>
					</div>
					<div class="row mt-3 mb-4 justify-content-center">
						<div class="col col-lg-10">
							<h3>VISUALS</h3>
							<div class="input-group py-1">
								<label class="input-group-text bg-dark text-light w-50 text-wrap">Paddle Color</label>
								<select id="paddleColor" class="form-select bg-dark text-light text-center">
									<option>White</option>
									<option>Yellow</option>
									<option>Red</option>
								</select>
							</div>
							<div class="input-group py-1">
								<label class="input-group-text bg-dark text-light w-50 text-wrap">Ball Color</label>
								<select id="ballColor" class="form-select bg-dark text-light text-center">
									<option>White</option>
									<option>Yellow</option>
									<option>Red</option>
								</select>
							</div>
							<div class="input-group py-1 pb-2">
								<label class="input-group-text bg-dark text-light w-50 text-wrap">Background Color</label>
								<select id="backgroundColor" class="form-select bg-dark text-light text-center">
									<option>Black</option>
									<option>Blue</option>
									<option>Purple</option>
								</select>
							</div>
						</div>
					</div>
				</div>
	`;
}

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



	document.getElementById("btnFriendlyMatch").addEventListener("click", ()=> {renderPongGame(); connectWebSocket('remote')} );
	document.getElementById("btnTournament").addEventListener("click", ()=> connectWebSocket('tournament') ) ;

	document.getElementById("matchType").addEventListener("click", function() { localStorage.setItem("matchType", document.getElementById("matchType").value) });
	document.getElementById("gameType").addEventListener("click", function() { localStorage.setItem("gameType", document.getElementById("gameType").value) });
	document.getElementById("ballColor").addEventListener("click", function() { localStorage.setItem("ballColor", document.getElementById("ballColor").value) });
	document.getElementById("paddleColor").addEventListener("click", function() { localStorage.setItem("paddleColor", document.getElementById("paddleColor").value) });
	document.getElementById("backgroundColor").addEventListener("click", function() { localStorage.setItem("backgroundColor", document.getElementById("backgroundColor").value) });
}


	/*	MAIN FUNCTION	*/
export function	renderHome()
{
	localStorage.setItem("currentView", "home");
	renderPage();
	selectSettings();

	setupEventHandlers();
}