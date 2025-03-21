import {renderAuth} from './auth.js'
import {renderPongGame} from './pong_game.js'

"use strict";

let	app;


	/*	PAGE RENDERING	*/
function	renderPage()
{
	let	transcendenceApp = document.getElementById("mainContainer");

	transcendenceApp.innerHTML = `
			<nav class="navbar navbar-dark shadow">
				<button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
					<span class="navbar-toggler-icon"></span> <!--REPLACE THIS WITH USER PROFILE PICTURE-->
				</button>
				<h1 class="mx-auto">TRANSCENDENCE</h1>
				<div id="navbarCollapse" class="collapse navbar-collapse">
					<div class="navbar-nav ps-4">
						<b class="nav-item">$username</b>
						<a id="profileBtn" href="#" class="nav-item nav-link">Profile</a>
						<a id="friendsBtn" href="#" class="nav-item nav-link">Friends</a>
						<a id="logoutBtn" href="#" class="nav-item nav-link">Logout</a>
					</div>
				</div>
			</nav>
			<div class="container mt-4">
				<div class="row text-center justify-content-center">
					<div class="col-12 col-lg-5 mx-lg-1 mt-4 border">
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
					<div class="col-12 col-lg-5 mx-lg-1 mt-4 px-5 border">
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
				</div>
			</div>
	`;
}

function	selectSettings()
{
	let	settings = app.settings;

	document.querySelector("#matchType").value = settings.gameplay.matchType;
	document.querySelector("#gameType").value = settings.gameplay.gameType;

	document.querySelector("#ballColor").value = settings.visuals.ballColor;
	document.querySelector("#paddleColor").value = settings.visuals.paddleColor;
	document.querySelector("#backgroundColor").value = settings.visuals.backgroundColor;
}

	/*	EVENT HANDLERS	*/
function	logoutUser()
{
	localStorage.removeItem("access");
	localStorage.removeItem("refresh");
	renderAuth(app)
}

function	setupEventHandlers()
{
	document.getElementById("profileBtn").addEventListener("click", ()=> alert("This feature has not been implemented yet.") );
	document.getElementById("friendsBtn").addEventListener("click", ()=> alert("This feature has not been implemented yet.") );
	document.getElementById("logoutBtn").addEventListener("click", logoutUser);
	document.getElementById("btnFriendlyMatch").addEventListener("click", ()=> renderPongGame(app) );
	document.getElementById("btnTournament").addEventListener("click", ()=> alert("This feature has not been implemented yet.") ) ;
}


	/*	MAIN FUNCTION	*/
export function	renderMainMenu(appData)
{
	app = appData;

	renderPage();
	selectSettings();

	setupEventHandlers();
}