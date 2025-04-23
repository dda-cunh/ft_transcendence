import {main} from "./index.js"
import {acceptFriendRequest} from './friend_requests.js'
import {denyFriendRequest} from './friend_requests.js'
import {updateAccessTkn} from './utils.js'
import {getOwnUserData} from './utils.js'
import { renderMatchHistory, renderTournamentHistory } from "./profile.js";

"use strict";

async function	getUserData(userID)
{
	updateAccessTkn();
	let response = await fetch(`management/management/user/${userID}/`, {
								method: "GET",
								headers: {
									"Authorization": `Bearer ${sessionStorage.getItem("access")}`,
								},
	} );

	return (await response.json() );
}


async function	sendFriendRequest(userID)
{
	updateAccessTkn();

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

		renderUserProfile(userID);
	}
	catch (error)
	{
		console.log(error);
		return ;
	}

}

function	addRequestSentBtn()
{
	let controlsCol = document.getElementById("playerCardControlsCol");

	controlsCol.innerHTML = `
		<button class="btn btn-sm btn-outline-secondary disabled mt-3">FRIEND REQUEST SENT</button>
	`;
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

		controlsCol.innerHTML = `
			<small class="mt-2 me-2">${userData.username}<br>has sent you a friend request</small>
			<button id="acceptBtn" data-id="${id}" class="btn btn-sm btn-outline-success me-2 mt-3"><i data-id="${id}" class="bi-check-lg"></i></button>
			<button id="denyBtn" data-id="${id}" class="btn btn-sm btn-outline-danger mt-3"><i data-id="${id}" class="bi-x-lg"></i></button>
		`;

		document.getElementById("acceptBtn").addEventListener("click", (event) => acceptFriendRequest(event) );
		document.getElementById("denyBtn").addEventListener("click", (event) => denyFriendRequest(event) );

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

	function	addOnlineStatus(status)
	{
		let statusColor = status ? "success" : "secondary";

		document.getElementById("onlineStatusCol").innerHTML = `
			<span class="badge bg-${statusColor} border border-light rounded-circle mt-2" style="height: 17.5px; width: 17.5px">
		`;
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
		console.log(userData);

		addOnlineStatus(userData.online);

		//	MUST ALSO CHECK IF FRIEND REQUEST HAS BEEN SENT TO THIS USER
		if (await pendingFriendRequest(userID) )
			addFriendRequestResponseBtns(userData);
		else if (userData.request_sent)
			addRequestSentBtn();
		else if (!(await userIsFriend(userID) ))
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


export async function	changeProfile(userID)
{
	let ownData = await getOwnUserData();
	if (ownData.id === userID)
	{
		sessionStorage.setItem("currentView", "profile");
		main();
	}
	else
		renderUserProfile(userID);
}

async function	renderPlayerProfile(userID)
{
	async function	renderFriendsList(userID)
	{
		updateAccessTkn();

		let tableBody = document.getElementById("friendsList");

		try
		{
			let response = await fetch(`management/management/user/${userID}/friends/`);

			if (!response.ok)
				throw new Error("Failed to retrieve friends list");

			let responseData = await response.json();
			responseData.forEach(entry => {
				let statusColor = entry.online ? "success" : "secondary";
				let row = `
					<tr data-id="${entry.id}" class="profile-link cursor-pointer" style="cursor: pointer;">
						<td data-id="${entry.id}">
							<img data-id="${entry.id}" style="height: 75px; width: 75px; object-fit: cover;" class="rounded-circle" src="/management/media/${entry.avatar}" alt="${entry.username}'s avatar" />
						</td>
						<td data-id="${entry.id}">
		            		<a data-id="${entry.id}" class="cursor-pointer display-6 link-light link-underline link-underline-opacity-0 link-opacity-75-hover">
								${entry.username}
		            		</a>
						</td>
						<td data-id="${entry.id}">
							<span data-id="${entry.id}" class="badge bg-${statusColor} border border-light rounded-circle" style="height: 20px; width: 20px">
						</td>
					</tr>
				`;
				tableBody.innerHTML += row;
			} );

			document.querySelectorAll(".profile-link").forEach(link => {
				link.addEventListener("click", (event) => changeProfile(event.target.dataset.id) );
			});
		}
		catch (error)
		{
			if (tableBody)
				tableBody.innerHTML = `
					<tr>
						<td class="text-danger">${error}</td>
					</tr>
				`;
			else
				console.log(error);
		}
	}

	let viewRow = document.getElementById("viewRow");

	try
	{
		let response = await fetch("views/profile.html");

		if (!response.ok)
			throw new Error(`Error loading user profile`);

		let viewHtml = await response.text();
		viewRow.innerHTML = viewHtml;

		await renderFriendsList(userID);
		//	RENDER MATCH HISTORY
	}
	catch (error)
	{
		viewRow.innerHTML = `<p>${error}</p>`;
	}
}

export async function	renderUserProfile(userID)
{
	if (sessionStorage.getItem("currentView") !== `user#${userID}`)
		sessionStorage.setItem("currentView", `user#${userID}`);

	let currentView = sessionStorage.getItem("currentView");
	if (history.state?.view !== currentView)
		history.pushState({view: currentView}, document.title, location.href);

	await renderPlayerCard(userID);
	await renderPlayerProfile(userID);
	await renderMatchHistory(userID)
	await renderTournamentHistory(userID)
}
