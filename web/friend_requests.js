import {updateAccessTkn} from './utils.js'

"use strict";

function	doTheThing()
{
	alert("doing the thing")
}

async function	renderList()
{
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
			return ;

		let frTable = document.getElementById("frList");
		let responseData = await response.json();

		if (Object.keys(responseData).length === 0)
		{
			frTable.innerHTML = `
				<tr class="align-items-center justify-content-around">
					<td>You have no new friend requests</td>
				</tr>
			`;
		}
		else
		{
			responseData.forEach(entry => {
				let row = `
					<tr>
						<td>
							<a href="#">
								<img style="object-fit: cover; height: 75px; width: 75px;" class="img-fluid rounded-circle" src="/management/media/avatars/${entry.sender_avatar.split("/").pop()}" alt="${entry.sender_username}'s avatar" />
							</a>
						</td>
						<td>
							<a class="display-6 link-light link-underline link-underline-opacity-0 link-opacity-75-hover" href="#">
								${entry.sender_username}
							</a>
						</td>
						<td>
							<button class="btn btn-outline-success accept-btn" data-id="${entry.id}">ACCEPT</button>
							<button class="btn btn-outline-danger deny-btn" data-id="${entry.id}">DENY</button>
						</td>
					</tr>
				`;
				frTable.innerHTML += row;
			} );
		}
	}
	catch (error)
	{
		alert(error);
	}
}

async function	acceptFriendRequest(event)
{
	const	id = event.target.dataset.id;

	updateAccessTkn();

	try
	{
		let	response = await fetch(`management/management/friends/request/${id}/accept`,{
									method: "POST",
									headers: {
										"Authorization": "Bearer " + sessionStorage.getItem("access"),
									}
		} );

		if (!response.ok)
			throw new Error("Error: Failed to accept request");

		renderFriendRequests();
	}
	catch (error)
	{
		alert(error);
	}
}

async function	denyFriendRequest(event)
{
	const	id = event.target.dataset.id;

	updateAccessTkn();

	try
	{
		let	response = await fetch(`management/management/friends/request/${id}/reject`,{	//	IS THIS CORRECT?
									method: "POST",
									headers: {
										"Authorization": "Bearer " + sessionStorage.getItem("access"),
									}
		} );

		if (!response.ok)
			throw new Error("Error: Failed to deny request");

		renderFriendRequests();
	}
	catch (error)
	{
		alert(error);
	}
}

function	setupEventHandlers()
{
	document.querySelectorAll(".accept-btn").forEach(button => {
		button.addEventListener("click", (event) => acceptFriendRequest(event) );
	} );

	document.querySelectorAll(".deny-btn").forEach(button => {
		button.addEventListener("click", (event) => denyFriendRequest(event) );
	} );
}


export async function	renderFriendRequests()
{
	await renderList();
	setupEventHandlers();
}
