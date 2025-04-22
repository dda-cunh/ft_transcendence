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

/*
	522c2d36-daf0-4390-8157-a8b3f20c43ef
	curl -X POST management:8000/management/friends/request \
	-d '{"receiver": "${userID}"}' \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer ${token}"
*/
async function	sendFriendRequest(userID)
{
	updateAccessTkn();

	alert("sending friend request")

	try
	{
		let response = await fetch("management/management/friends/request", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + sessionStorage.getItem("access"),
					},
					body: JSON.stringify({"receiver": userID}),
		} );

		if (!response.ok)
			throw new Error("Failed to send friend request");
	}
	catch (error)
	{
		console.log(error);
		return ;
	}

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
			console.log(requestsList);
			requestsList.forEach(entry => {
				if (entry.sender === userID)
				{
					pendingRequestID = entry.id;
					result = true;
				}
				else if (entry.receiver === userID)
				{
					pendingRequestID = "self";
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
		let id = pendingRequestID;

		if (id !== "self")
		{
			controlsCol.innerHTML = `
				<small class="mt-2 me-2">${userData.username}<br>has sent you a friend request</small>
				<button id="acceptBtn" data-id="${id}" class="btn btn-sm btn-outline-success me-2 mt-2"><i class="bi-check-lg"></i></button>
				<button id="denyBtn" data-id="${id}" class="btn btn-sm btn-outline-danger mt-2"><i class="bi-x-lg"></i></button>
			`;

			document.getElementById("acceptBtn").addEventListener("click", (event) => acceptFriendRequest(event) );
			document.getElementById("denyBtn").addEventListener("click", (event) => denyFriendRequest(event) );
		}
//		else
			//	RENDER SOMETHING ELSE...

	}

	async function	userIsFriend(userID)
	{
		updateAccessTkn();

		try
		{
			let	response = await fetch("management/management/friends", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + sessionStorage.getItem("access"),
				},
			} );

			if (!response.ok)
				throw new Error("Could not fetch friends list");

			let result = false;
			let	friendsList = await response.json();

			friendsList.forEach(entry => {
				if (entry.id === userID)
					result = true;
			} );

			return (result);
		}
		catch (error)
		{
			console.log(error);
			
			return (false);	
		}
	}

	function	addFriendRequestBtn(userID)
	{
		let controlsCol = document.getElementById("playerCardControlsCol");

		controlsCol.innerHTML = `
			<button id="friendRequestBtn" data-id="${userID}" class="btn btn-sm btn-outline-primary mt-3">ADD FRIEND</button>
		`;

		document.getElementById("friendRequestBtn").onclick = (event) => sendFriendRequest(userID);
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

		if (await pendingFriendRequest(userID) )
			addFriendRequestResponseBtns(userData);
		else if (!(await userIsFriend(userID) ) /* && !friendRequestSent()*/ )
			addFriendRequestBtn(userID);
		else
		{
			document.getElementById("acctSettingsBtn").style.opacity = 0;
			document.getElementById("acctSettingsBtn").classList.add("disabled");
		}


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
