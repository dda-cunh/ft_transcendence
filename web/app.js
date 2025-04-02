import {renderAuth} from './auth.js'
import {renderHome} from './home.js'
import {renderProfile} from './profile.js'
import {renderFriends} from './friends.js'
import {renderEditProfile} from './edit_profile.js'
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

//	console.log(await response.json());

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
					<a id="friendsMgmtBtn" href="#" class="nav-item nav-link">Manage Friends</a>
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

					<a href="#"><img id="userPfp" src="management/media/${imgSrc}" class="img-fluid rounded-circle" alt="User Profile Picture"></a>

				</div>
				<div class="col-12 col-lg-8 d-grid border rounded">
					<div class="row h-auto">
						<div class="col d-flex justify-content-end align-items-start">
							<!--EDIT PROFILE BTN (CHG DISPLAY NAME, CHG MOTTO, CHG PFP)-->
							<button id="editProfileBtn" type="button" class="btn btn-sm btn-outline-light mx-2 my-2"><i class="bi-pencil-fill"></i></button>
							<!--SETTINGS BTN (CHG PASSWD, DELETE ACCOUNT)-->
							<button id="acctSettingsBtn" type="button" class="btn btn-sm btn-outline-light my-2"><i class="bi-gear-fill"></i></button>
						</div>
					</div>
					<div class="flex-row flex-fill align-middle">
						<div class="col py-auto d-flex justify-content-center">
							<!--USERNAME-->
							<h1 id="userNameDisplay" class="display-1"><a href="#" class="link-light link-underline link-underline-opacity-0 link-opacity-75-hover">${userName}</a></h1>
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
			<div id="ctrlsRow" class="row mt-4 text-center d-flex justify-content-center">
			</div>
	`
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

	document.getElementById("editProfileBtn").addEventListener("click", ()=> renderEditProfile() );
	document.getElementById("acctSettingsBtn").addEventListener("click", ()=> renderAcctSettings() );

	document.getElementById("userPfp").addEventListener("click", ()=> renderProfile() );
	document.getElementById("userNameDisplay").addEventListener("click", ()=> renderProfile() );

	document.getElementById("homeBtn").addEventListener("click", () => renderHome() );
	document.getElementById("profileBtn").addEventListener("click", () => renderProfile() );
	document.getElementById("friendsMgmtBtn").addEventListener("click", () => renderFriends() );
	document.getElementById("logoutBtn").addEventListener("click", () => logoutUser());
}


export async function	App()
{
	await renderPage();
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
		case ("accountSettings"):
			renderAcctSettings();
			break ;
		case ("editProfile"):
			renderEditProfile();
			break ;	
	}
}
