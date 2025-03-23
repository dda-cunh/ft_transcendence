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
					<a id="profileBtn" href="#" class="nav-item nav-link">Profile</a>
					<a id="friendsBtn" href="#" class="nav-item nav-link">Friends</a>
					<a id="logoutBtn" href="#" class="nav-item nav-link text-light">Logout</a>
				</div>
			</div>
		</nav>
		<div id="appContainer" class="container mt-4">
		</div>
	`;
}


	/*	EVENT HANDLERS	*/
function	logoutUser()
{
	localStorage.removeItem("access");
	localStorage.removeItem("refresh");
	localStorage.setItem("currentView", "home");
	renderAuth()
}

function	setupEventHandlers()
{
	document.getElementById("titleHeader").addEventListener("click", () => renderHome());
	document.getElementById("profileBtn").addEventListener("click", () => renderProfile() );
	document.getElementById("friendsBtn").addEventListener("click", () => renderFriends() );
	document.getElementById("logoutBtn").addEventListener("click", () => logoutUser());
}


export function	renderApp()
{
	renderNavbar();
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