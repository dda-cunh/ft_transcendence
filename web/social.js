import {main} from "./index.js"
import {acceptFriendRequest} from './friend_requests.js'
import {denyFriendRequest} from './friend_requests.js'
import {updateAccessTkn} from './utils.js'

"use strict";

async function	getUserData(userID)
{
	let response = await fetch(`management/management/user/${userID}/`);

	return (await response.json() );
}


async function	renderPlayerCard(userID)
{
	let pendingRequestID = null;
	async function	pendingFriendRequest(userID)
	{
		updateAccessTkn();

		try
		{
			let response = await fetch("management/management/friends/pending", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + sessionStorage.getItem("access"),
				}
			} );

			if (!response.ok)
				throw new Error("Could not fetch pending friend requests");

			let result = false;
			let requestsList = await response.json();
			requestsList.forEach(entry => {
				if (entry.sender === userID)
				{
					pendingRequestID = entry.id;
					result = true;
				}
			} );

			return (result);
		}
		catch (error)
		{
			console.log(error);

			return (false);
		}
	}

	function	addFriendRequestResponseBtns(userData)
	{
		let controlsCol = document.getElementById("playerCardControlsCol");

		controlsCol.innerHTML = `
			<small class="mt-2 me-2">${userData.username}<br>has sent you a friend request</small>
			<button id="acceptBtn" data-id="${pendingRequestID}" class="btn btn-sm btn-outline-success me-2 mt-2"><i class="bi-check-lg"></i></button>
			<button id="denyBtn" data-id="${pendingRequestID}" class="btn btn-sm btn-outline-danger mt-2"><i class="bi-x-lg"></i></button>
		`;

		document.getElementById("acceptBtn").addEventListener("click", (event) => acceptFriendRequest(event) );
		document.getElementById("denyBtn").addEventListener("click", (event) => denyFriendRequest(event) );
	}

	let	playerCardContainer = document.getElementById("appContainer");

	try
	{
		let response = await fetch("views/player_card.html");

		if (!response.ok)
			throw new Error("Error loading player card");

		let playerCardHtml = await response.text();
		playerCardContainer.innerHTML = playerCardHtml;

		let userData = await getUserData(userID);
//		ADD ONLINE STATUS THING

		let requestPending = await pendingFriendRequest(userID);
		if (requestPending)
			addFriendRequestResponseBtns(userData);
/*
		else if (!userIsFriend(userID) )
			ADD "ADD FRIEND" BUTTON		-> TESTING THIS WILL HAVE TO WAIT FOR PR MERGE

			DISABLE acctSettingsBtn & MAKE IT INVISIBLE
*/
		else
		{
			document.getElementById("acctSettingsBtn").style.opacity = 0;
			document.getElementById("acctSettingsBtn").classList.add("disabled");
		}



		console.log(userData);

		let imgSrc = userData.avatar;
		let userName = userData.username;
		let motto = userData.motto;

		let pfp = document.getElementById("userPfp");

		pfp.src = `management/media/${imgSrc}`;
		document.getElementById("userNameDisplay").innerText = userName;
		document.getElementById("mottoDisplay").innerText = `"${motto}"`;

		let pfpHeight = document.getElementById("pfpContainer").offsetHeight;
		pfp.style.height = `${pfpHeight}px`;
		pfp.style.width = `${pfpHeight}px`;
	}
	catch (error)
	{
		playerCardContainer.innerHTML = `<p>${error}</p>`;
	}
}

async function	renderPlayerProfile(userID)
{
	let viewRow = document.getElementById("viewRow");

	try
	{
		let response = await fetch("views/profile.html");

		if (!response.ok)
			throw new Error(`Error loading user profile`);

		let viewHtml = await response.text();
		viewRow.innerHTML = viewHtml;

	}
	catch (error)
	{
		viewRow.innerHTML = `<p>${error}</p>`;
	}
}

export async function	renderUserProfile(userID)
{
	sessionStorage.setItem("currentView", "user#"+userID);

	let currentView = sessionStorage.getItem("currentView");
	if (history.state?.view !== currentView)
		history.pushState({view: currentView}, document.title, location.href);

	await renderPlayerCard(userID);
	renderPlayerProfile(userID);
}
