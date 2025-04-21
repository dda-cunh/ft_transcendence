import {renderAuth} from './auth.js'
import {renderHome} from './home.js'
import {renderProfile} from './profile.js'
import {renderFriendRequests} from './friend_requests.js'
import {renderAcctSettings} from './account_settings.js'


"use strict";


async function	getUserData()
{
	let response = await fetch("management/management/user/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + sessionStorage.getItem("access"),
		}
	});

	return (await response.json() );
}

	/*	PAGE RENDERING	*/
async function renderNavbar()
{
	let	navbarContainer = document.getElementById("mainContainer");

	try
	{
		let response = await fetch("views/navbar.html");

		if (!response.ok)
			throw new Error("Error loading navbar");

		let navbarHtml = await response.text();

		navbarContainer.innerHTML = navbarHtml;

		const	navLinks = document.querySelectorAll(".nav-item");
		const	menuToggle = document.getElementById("navbarCollapse");
		const	bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
		navLinks.forEach((link) => {
				link.addEventListener("click", () => bsCollapse.toggle());
		} );
	}
	catch (error)
	{
		navbarContainer.innerHTML = `<p>${error}</p>`;
	}
}

async function renderPlayerCard()
{
	let	playerCardContainer = document.getElementById("appContainer");

	try
	{
		let response = await fetch("views/player_card.html");

		if (!response.ok)
			throw new Error("Error loading player card");

		let playerCardHtml = await response.text();
		playerCardContainer.innerHTML = playerCardHtml;

		let userData = await getUserData();

		let imgSrc = userData.avatar;
		let userName = userData.username;
		let motto = userData.motto;

		let pfp = document.getElementById("userPfp");

		pfp.src = `management/media/${imgSrc}`;
		document.getElementById("userNameDisplay").innerText = userName;
		document.getElementById("mottoDisplay").innerText = `"` + motto + `"`;

		let pfpHeight = document.getElementById("pfpContainer").offsetHeight;
		pfp.style.height = `${pfpHeight}px`;
		pfp.style.width = `${pfpHeight}px`;
	}
	catch (error)
	{
		playerCardContainer.innerHTML = `<p>${error}</p>`;
	}
}

async function	renderView()
{
	let viewName = localStorage.getItem("currentView");
	let viewRow = document.getElementById("viewRow");

	try
	{
		let	response = await fetch(`views/${viewName}.html`);

		if (!response.ok)
			throw new Error(`Error loading view: ${viewName}`);

		let viewHtml = await response.text();
		viewRow.innerHTML = viewHtml;
	}
	catch(error)
	{
		viewRow.innerHTML = `<p>${error}</p>`;
	}
}

async function renderPage() 
{
	await renderNavbar();
	await renderPlayerCard();
}


	/*	EVENT HANDLERS	*/
function	logoutUser()
{
	sessionStorage.removeItem("access");
	sessionStorage.removeItem("refresh");
	localStorage.setItem("currentView", "home");
	renderAuth();
}

async function	changeView()
{
	await renderView();

	let currentView = localStorage.getItem("currentView");

	if (history.state?.view !== currentView)
		history.pushState({view: currentView}, document.title, location.href);

	switch (currentView)
	{
		case ("home"):
			renderHome();
			break ;
		case ("profile"):
			renderProfile();
			break ;
		case ("friend_requests"):
			renderFriendRequests();
			break ;
		case ("account_settings"):
			renderAcctSettings();
			break ;
	}
}

let initialLoad = true;

window.addEventListener("popstate", function(event) {
	if (initialLoad)
	{
		initialLoad = false;
		return ;
	}

	if (event.state?.view && history.state?.view !== localStorage.getItem("currentView") )
	{
		localStorage.setItem("currentView", event.state.view);
		changeView();
	}
} );

document.addEventListener("DOMContentLoaded", () => {
	history.replaceState({view: localStorage.getItem("currentView")}, document.title, location.href);
} );

function	setupEventHandlers()
{
		/*	NAVBAR	*/
	document.getElementById("titleHeader").onclick = function() {
			localStorage.setItem("currentView", "home");
			App();
	};

	document.getElementById("homeBtn").onclick = function() {
			localStorage.setItem("currentView", "home");
			App();
	};
	document.getElementById("profileBtn").onclick = function() {
			localStorage.setItem("currentView", "profile");
			App();
	};
	document.getElementById("friendRequestsBtn").onclick = function() {
			localStorage.setItem("currentView", "friend_requests");
			App();
	};
	document.getElementById("logoutBtn").onclick = () => logoutUser();


		/*	PLAYER CARD	*/
	document.getElementById("acctSettingsBtn").onclick = function() {
			localStorage.setItem("currentView", "account_settings");
			App();
	};
	document.getElementById("userPfp").onclick = function() {
			localStorage.setItem("currentView", "profile");
			App();
	};
	document.getElementById("userNameDisplay").onclick = function() {
			localStorage.setItem("currentView", "profile");
			App();
	};
}

export async function	App()
{
	await renderPage();
	setupEventHandlers();

	changeView();
}
