import {renderHome} from './home.js'
import {renderAuth} from './auth.js'
import {renderProfile} from './profile.js'
import {renderFriends} from './friends.js'


"use strict";

	/*	PAGE RENDERING	*/
function renderNavbar()
{
	let	transcendenceApp = document.getElementById("mainContainer");

	transcendenceApp.innerHTML = `
				<nav class="navbar navbar-dark shadow">
			<button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
				<span class="navbar-toggler-icon"></span>
			</button>
			<h1 id="titleHeader" class="mx-auto"><a href="#" class="link-light link-underline link-underline-opacity-0 link-opacity-75-hover">TRANSCENDENCE</a></h1>
			<div id="navbarCollapse" class="collapse navbar-collapse">
				<div class="navbar-nav ps-4">
					<!--ADD HOME BTN-->
					<a id="homeBtn" href="#" class="nav-item nav-link">Home</a>
					<a id="profileBtn" href="#" class="nav-item nav-link">Profile</a>
					<a id="logoutBtn" href="#" class="nav-item nav-link text-light">Logout</a>
				</div>
			</div>
		</nav>
		<div id="appContainer" class="container mt-4">
		</div>
	`;
}

function renderPlayerCard()
{
	let	transcendenceApp = document.getElementById("appContainer");

	transcendenceApp.innerHTML = `
			<div class="row text-center d-flex justify-content-center">
				<div class="col-12 col-lg-2 my-3 mt-lg-0 border rounded-circle">
					<!--PROFILE PIC-->

					<img src="" class="img-fluid rounded-circle" alt="User Profile Picture">

				</div>
				<div class="col-12 col-lg-8 d-grid border rounded">
					<div class="row h-auto">
						<div class="col d-flex justify-content-end align-items-start">
							<!--EDIT PROFILE BTN (CHG DISPLAY NAME, CHG MOTTO, CHG PFP)-->
							<button type="button" class="btn btn-sm btn-outline-light mx-2 my-2"><i class="bi-pencil-fill"></i></button>
							<!--SETTINGS BTN (CHG PASSWD, DELETE ACCOUNT)-->
							<button type="button" class="btn btn-sm btn-outline-light my-2"><i class="bi-gear-fill"></i></button>
						</div>
					</div>
					<div class="flex-row flex-fill align-middle">
						<div class="col py-auto d-flex justify-content-center">
							<!--USERNAME-->
							<h1 id="userNameDisplay" class="display-1"><a href="#" class="link-light link-underline link-underline-opacity-0 link-opacity-75-hover">$USER</a></h1>
						</div>
					</div>
					<div class="row d-flex align-items-end">
						<div class="col">
							<!--MOTTO-->
							<p class="fst-italic">"Some days you are the pidgeon, some days you are the statue. Today it's clearly statue day."</p>
						</div>
					</div>
				</div>
			</div>
			<div id="ctrlsRow" class="row mt-4 text-center d-flex justify-content-center">
			</div>
	`
}


function renderPage() 
{
	renderNavbar();
	renderPlayerCard();
}


	/*	EVENT HANDLERS	*/
function	logoutUser()
{
	localStorage.removeItem("access");
	localStorage.removeItem("refresh");
	localStorage.setItem("currentView", "home");
	renderAuth();
}


function	setupEventHandlers()
{
	document.getElementById("titleHeader").addEventListener("click", () => renderHome());
	document.getElementById("userNameDisplay").addEventListener("click", ()=> renderProfile() );

	document.getElementById("homeBtn").addEventListener("click", () => renderHome() );
	document.getElementById("profileBtn").addEventListener("click", () => renderProfile() );
	document.getElementById("logoutBtn").addEventListener("click", () => logoutUser());
}


export function	App()
{
	renderPage();
	setupEventHandlers();

	switch (localStorage.getItem("currentView") )
	{
		case ("home"):
			renderHome();
			break ;
		case("profile"):
			renderProfile();
			break ;
		case ("friends"):
			renderFriends();
			break ;
	}
}