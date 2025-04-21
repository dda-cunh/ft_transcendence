import { main } from "./index.js";
import {renderAuth} from './auth.js'
import {renderHome} from './home.js'
import {renderProfile} from './profile.js'
import {renderFriendRequests} from './friend_requests.js'
import {renderAcctSettings} from './account_settings.js'
import {renderUserProfile} from './social.js'


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
	let viewName = sessionStorage.getItem("currentView");
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
	if (!sessionStorage.getItem("currentView").startsWith("user#"))
		await renderPlayerCard();
}


	/*	EVENT HANDLERS	*/
function	logoutUser()
{
	sessionStorage.removeItem("access");
	sessionStorage.removeItem("refresh");
	sessionStorage.setItem("currentView", "home");
	renderAuth();
}

async function	changeView()
{
	let currentView = sessionStorage.getItem("currentView");
	if (!currentView.startsWith("user#"))
		await renderView();


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
		default:
			renderUserProfile(currentView.split("#").pop());
	}
}

let initialLoad = true;

window.addEventListener("popstate", function(event) {
	if (initialLoad)
	{
		initialLoad = false;
		return ;
	}

	if (event.state?.view && history.state?.view !== sessionStorage.getItem("currentView") )
	{
		sessionStorage.setItem("currentView", event.state.view);
		changeView();
	}
} );

document.addEventListener("DOMContentLoaded", () => {
	history.replaceState({view: sessionStorage.getItem("currentView")}, document.title, location.href);
} );

function	setupEventHandlers()
{
		/*	NAVBAR	*/
	document.getElementById("titleHeader").onclick = function() {
			sessionStorage.setItem("currentView", "home");
			main();
	};

	document.getElementById("homeBtn").onclick = function() {
			sessionStorage.setItem("currentView", "home");
			main();
	};
	document.getElementById("profileBtn").onclick = function() {
			sessionStorage.setItem("currentView", "profile");
			main();
	};
	document.getElementById("friendRequestsBtn").onclick = function() {
			sessionStorage.setItem("currentView", "friend_requests");
			main();
	};
	document.getElementById("logoutBtn").onclick = () => logoutUser();


		/*	PLAYER CARD	*/
	if (!sessionStorage.getItem("currentView").startsWith("user#"))
	{			
		document.getElementById("acctSettingsBtn").onclick = function() {
				sessionStorage.setItem("currentView", "account_settings");
				main();
		};
		document.getElementById("userPfp").onclick = function() {
				sessionStorage.setItem("currentView", "profile");
				main();
		};
		document.getElementById("userNameDisplay").onclick = function() {
				sessionStorage.setItem("currentView", "profile");
				main();
		};
	}
}

export async function	App()
{
	await renderPage();
	setupEventHandlers();

	changeView();
}

/*
	TO DO:
		F
			FIGURE OUT THAT SHIT WITH THE POINTER
			ADD ELEMENT TO PLAYER CARD TO DISPLAY ONLINE STATUS
			CHECK CONDITIONS/ADD BUTTONS FOR ADD FRIEND/ACCEPT/REJECT ON OTHER USERS PLAYER CARD
			ADD MOTTO TO OTHER USER'S PLAYER CARD
		M
			PULL MATCH HISTORY
			FIX DESIGN IN GAME VIEW
		B
			MAKE MATCH VIEW PERSISTENT

*/