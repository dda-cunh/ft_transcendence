import {main} from "./index.js"
import {acceptFriendRequest} from './friend_requests.js'
import {denyFriendRequest} from './friend_requests.js'
import { renderMatchHistory, renderTournamentHistory } from "./profile.js";
import {updateAccessTkn} from './utils.js'
import {getOwnUserData} from './utils.js'
import {showPopover} from './utils.js'
import {setElemHoverColors} from './utils.js'

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

	let playerCardControlsCol = document.getElementById("playerCardControlsCol");

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

		playerCardControlsCol.innerHTML = `
				<button id="frSentBtn" class="btn btn-sm btn-outline-secondary disabled mt-2">
					<i class="bi-person-fill-add mt-2"></i>
				</button>
		`;

		showPopover("Friend request sent", playerCardControlsCol);
	}
	catch (error)
	{
		showPopover("Failed to send friend request", playerCardControlsCol, 'danger');
	}

}

function	addRequestSentBtn()
{
	let controlsCol = document.getElementById("playerCardControlsCol");

	controlsCol.innerHTML = `
				<button class="btn btn-sm btn-outline-secondary disabled mt-2">
					<i class="bi-person-fill-add mt-2"></i>
				</button>
	`;
}

function addFriendConfirmedBtn()
{
	document.getElementById("playerCardControlsCol").innerHTML = `
			<button id="friendConfirmedBtn" class="btn btn-sm btn-outline-primary mt-2" aria-disabled="true">
				<i class="bi-people-fill mt-2"></i>
			</button>
	`;

	let friendConfirmedBtn = document.getElementById("friendConfirmedBtn");
	setElemHoverColors(friendConfirmedBtn, "light", "primary", "primary");

	friendConfirmedBtn.style.cursor = 'default';
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
			<button id="acceptBtn" data-id="${id}" class="btn btn-sm btn-outline-light me-1 mt-2">
				<i data-id="${id}" class="bi-check-lg"></i>
			</button>
			<button id="denyBtn" data-id="${id}" class="btn btn-sm btn-outline-light mt-2 me-2">
				<i data-id="${id}" class="bi-x-lg"></i>
			</button>
			<button class="btn btn-sm btn-primary disabled mt-2">
				<i class="bi-person-fill-add"></i>
			</button>
		`;


		let acceptBtn = document.getElementById("acceptBtn");
		let denyBtn = document.getElementById("denyBtn");

		acceptBtn.addEventListener("click", (event) => { 
												acceptFriendRequest(event);
												addFriendConfirmedBtn();
												showPopover("Friend request accepted", controlsCol, 'success');
											} );

		setElemHoverColors(acceptBtn, "success", "dark", "success");



		denyBtn.addEventListener("click", (event) => { 
												denyFriendRequest(event);
												addFriendRequestBtn(userID); 
												showPopover("Friend request rejected", controlsCol);
											} );

		setElemHoverColors(denyBtn, "danger", "dark", "danger");

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
			<button id="friendRequestBtn" data-id="${userID}" class="btn btn-sm btn-outline-light mt-2">
				<i class="bi-person-fill-add"> </i>
			</button>
		`;

		let friendRequestBtn = document.getElementById("friendRequestBtn");
		
		setElemHoverColors(friendRequestBtn, "primary", "dark", "primary")

		friendRequestBtn.onclick = (event) => sendFriendRequest(userID);
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
		document.getElementById("userPfp").parentElement.style.setProperty("cursor","default");
		document.getElementById("userPfp").parentElement.setAttribute("aria-disabled", true);

		document.getElementById("userNameDisplay").classList.add("pe-none");
		document.getElementById("userNameDisplay").setAttribute("aria-disabled", true);

		let userData = await getUserData(userID);

		let imgSrc = userData.avatar;
		let userName = userData.username;
		let motto = userData.motto;

		addOnlineStatus(userData.online);

		if (await pendingFriendRequest(userID) )
			addFriendRequestResponseBtns(userData);
		else if (userData.request_sent)
			addRequestSentBtn();
		else if (!(await userIsFriend(userID) ))
			addFriendRequestBtn(userID);
		else
			addFriendConfirmedBtn();



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
	await renderMatchHistory(userID, null)
	await renderTournamentHistory(userID)
}
