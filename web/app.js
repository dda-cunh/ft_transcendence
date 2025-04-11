import {renderAuth} from './auth.js'
import {renderHome} from './home.js'
import {renderProfile} from './profile.js'
import {renderAcctSettings} from './account_settings.js'


"use strict";


async function	get_userData()
{
	let response = await fetch("management/management/user/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + localStorage.getItem("access"),
		}
	});

	return (await response.json());
}

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

async function renderPlayerCard()
{
	let	transcendenceApp = document.getElementById("appContainer");

	let userData = await get_userData();

	let imgSrc = userData.avatar;
	let userName = userData.username;
	let motto = userData.motto;

	transcendenceApp.innerHTML = `
			<div class="row text-center d-flex justify-content-center">
				<div class="col-12 col-lg-2 my-3 mt-lg-0">
					<!--PROFILE PIC-->

					<a href="#"><img id="userPfp" src="management/${imgSrc}" class="img-fluid rounded-circle" alt="User Profile Picture"></a>

				</div>
				<div class="col-12 col-lg-8 d-grid border rounded">
					<div class="row h-auto">
						<div class="col d-flex justify-content-end align-items-start">
							<button id="acctSettingsBtn" type="button" class="btn btn-sm btn-outline-light my-2"><i class="bi-gear-fill"></i></button>
						</div>
					</div>
					<div class="flex-row flex-fill align-middle">
						<div class="col py-auto d-flex justify-content-center">
							<!--USERNAME-->
							<h1 class="display-1"><a href="#" id="userNameDisplay" class="link-light link-underline link-underline-opacity-0 link-opacity-75-hover"></a></h1>
						</div>
					</div>
					<div class="row d-flex">
						<div class="col">
							<!--MOTTO-->
							<p id="mottoDisplay" class="fst-italic"></p>
						</div>
					</div>
				</div>
			</div>
			<div id="ctrlsRow" class="row mt-4 text-center d-flex justify-content-center">
			</div>
	`

	document.getElementById("userNameDisplay").innerText = userName;
	document.getElementById("mottoDisplay").innerText = '"' + motto + '"';
}


async function renderPage() 
{
	renderNavbar();
	await renderPlayerCard();
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

	document.getElementById("acctSettingsBtn").addEventListener("click", ()=> renderAcctSettings() );
	document.getElementById("userPfp").addEventListener("click", ()=> renderProfile() );
	document.getElementById("userNameDisplay").addEventListener("click", ()=> renderProfile() );

	document.getElementById("homeBtn").addEventListener("click", () => renderHome() );
	document.getElementById("profileBtn").addEventListener("click", () => renderProfile() );
	document.getElementById("logoutBtn").addEventListener("click", () => logoutUser());

	const	navLinks = document.querySelectorAll(".nav-item");
	const	menuToggle = document.getElementById("navbarCollapse");
	const	bsCollapse = new bootstrap.Collapse(menuToggle, {toggle: false});
	navLinks.forEach((link) => {
			link.addEventListener("click", () => { bsCollapse.toggle() });
		}
	);

	window.addEventListener("popstate", (event) => {
		alert(event.state);
		if (event.state)
		{
			localStorage.setItem("currentView", event.state);
			location.reload();
		}
	});
}

function setupHistory()
{
	//	if HISTORY IS EMPTY:
	if (window.history.state === null)
		window.history.replaceState(localStorage.getItem("currentView"), null, "");
}


export async function	App()
{
	await renderPage();
	setupEventHandlers();
	setupHistory();

	switch (localStorage.getItem("currentView") )
	{
		case ("home"):
			renderHome();
			break ;
		case("profile"):
			renderProfile();
			break ;
		case ("accountSettings"):
			renderAcctSettings();
			break ;
		case ("editProfile"):
			renderEditProfile();
			break ;	
	}

//	console.log(window.history);
}
