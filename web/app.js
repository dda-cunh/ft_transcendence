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
					<a id="friendRequestsBtn" href="#" class="nav-item nav-link">Friend Requests</a>
					<a id="logoutBtn" href="#" class="nav-item nav-link text-light">Logout</a>
				</div>
			</div>
		</nav>
		<div id="appContainer" class="container mt-4">
		</div>
	`;

	const	navLinks = document.querySelectorAll(".nav-item");
	const	menuToggle = document.getElementById("navbarCollapse");
	const	bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
	navLinks.forEach((link) => {
//			link.onclick = () => bsCollapse.toggle();
			link.addEventListener("click", () => bsCollapse.toggle());
		}
	);

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

					<a href="#"><img id="userPfp" src="management/media/${imgSrc}" class="img-fluid rounded-circle" alt="User Profile Picture"></a>

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
							<h1 class="display-1"><a href="#" id="userNameDisplay" class="link-light link-underline link-underline-opacity-0 link-opacity-75-hover">${userName}</a></h1>
						</div>
					</div>
					<div class="row d-flex">
						<div class="col">
							<!--MOTTO-->
							<p class="fst-italic">"${motto}"</p>
						</div>
					</div>
				</div>
			</div>
			<div id="viewRow" class="row mt-4 text-center d-flex justify-content-center">
			</div>
	`
}

async function	renderView()
{
	let viewName;
	viewName = localStorage.getItem("currentView");

	try
	{
		let	response = await fetch(`views/${viewName}.html`);

		if (!response.ok)
			throw new Error(`Error loading view: ${viewName}`);

		let viewHtml = await response.text();
		document.getElementById("viewRow").innerHTML = viewHtml;
	}
	catch(error)
	{
		document.getElementById("viewRow").innerHTML = `<p>${error}</p>`
	}
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

async function	changeView()
{
	await renderView();

	switch (localStorage.getItem("currentView") )
	{
		case ("home"):
			renderHome();
			break ;
		case ("profile"):
			renderProfile();
			break ;
		case ("friend_requests"):

			break ;
		case ("account_settings"):
			renderAcctSettings();
			break ;
	}
}


function	setupEventHandlers()
{
		/*	NAVBAR	*/
	document.getElementById("titleHeader").onclick = function() {
			localStorage.setItem("currentView", "home");
			changeView();
	};

	document.getElementById("homeBtn").onclick = function() {
			localStorage.setItem("currentView", "home");
			changeView();
	};
	document.getElementById("profileBtn").onclick = function() {
			localStorage.setItem("currentView", "profile");
			changeView();
	};
	document.getElementById("friendRequestsBtn").onclick = function() {
			localStorage.setItem("currentView", "friend_requests");
			changeView();
	};
	document.getElementById("logoutBtn").onclick = () => logoutUser();


		/*	PLAYER CARD	*/
	document.getElementById("acctSettingsBtn").onclick = function() {
			localStorage.setItem("currentView", "account_settings");
			changeView();			
	};
	document.getElementById("userPfp").onclick = function() {
			localStorage.setItem("currentView", "profile");
			changeView();
	};
	document.getElementById("userNameDisplay").onclick = function() {
			localStorage.setItem("currentView", "profile");
			changeView();
	};

/*
	const	navLinks = document.querySelectorAll(".nav-item");
	const	menuToggle = document.getElementById("navbarCollapse");
	const	bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
	navLinks.forEach((link) => {
			link.onclick = () => bsCollapse.toggle();
		}
	);
*/
}

export async function	App()
{
	await renderPage();
	setupEventHandlers();

	changeView();
}

/*
	3 - load text from json files
	4 - redo history from scratch
*/
