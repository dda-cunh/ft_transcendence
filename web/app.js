import { main } from "./index.js";
import {renderAuth} from './auth.js'
import {renderHome} from './home.js'
import {renderProfile} from './profile.js'
import {renderFriendRequests} from './friend_requests.js'
import {renderAcctSettings} from './account_settings.js'
import {renderUserProfile} from './social.js'
import {getOwnUserData} from './utils.js'
import { renderStats } from "./stats.js";
import {renderPongGame} from './pong_game.js'
import {socket} from './socket.js'


"use strict";


export async function	getUserData()
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

		let userData = await getOwnUserData();

		let imgSrc = userData.avatar;
		let userName = userData.username;
		let motto = userData.motto;

		let pfp = document.getElementById("userPfp");

		pfp.src = `management/media/${imgSrc}`;
		document.getElementById("userNameDisplay").innerText = userName;
		document.getElementById("mottoDisplay").innerText = `"` + motto + `"`;
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
	if (!currentView.startsWith("user#") && currentView !== "game")
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
		case ("stats"):
			await renderStats();
			break ;
		case ("account_settings"):
			renderAcctSettings();
			break ;
		case ("game"):
			renderPongGame(sessionStorage.getItem("gameMode"));
			break ;
		default:
			renderUserProfile(currentView.split("#").pop());
	}
}

let initialLoad = true;

export function	handleHistoryPopState(event)
{
	if (initialLoad)
	{
		initialLoad = false;
		return ;
	}

	if (history.state?.view !== sessionStorage.getItem("currentView") )
	{
		if (sessionStorage.getItem("currentView") === "game" && socket)
			socket.close();
		sessionStorage.setItem("currentView", event.state.view);
		main();
	}
}

window.addEventListener("popstate", (event) => handleHistoryPopState(event) );


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
	document.getElementById("statsBtn").onclick = function() {
		sessionStorage.setItem("currentView", "stats");
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
	if (sessionStorage.getItem("currentView") !== "game")
	{
		await renderPage();
		setupEventHandlers();
	}

	changeView();
}


/*
	TO DO
		ADD PERSISTENCE + HISTORY FOR GAME VIEW
		FIX CANVAS RENDERING (SIZE IS ALL DUCKED UP)
		ADD ONLINE STATUS TO PLAYER CARD OF OTHER USERS
		PENDING SENT REQUESTS NEEDS AN ENDPOINT (TO RENDER OTHER USERS PLAYER CARD ACCORDINGLY)
*/