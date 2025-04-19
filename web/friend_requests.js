import {updateAccessTkn} from './utils.js'

"use strict";

async function	renderList()
{
	try
	{
		let response = await fetch("management/management/friends/pending", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + localStorage.getItem("access"),
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
				console.log(entry);
				let row = `
					<tr class="m-0 p-0 w-100 d-flex flex-row align-items-center justify-content-around">
						<td class=""><img height="75px" class="rounded-circle" src="/management/media/${entry.sender_avatar}" alt="${entry.sender_username}'s avatar" /></td>
						<td class="">${entry.sender_username}</td>
						<td class="">
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
										"Authorization": "Bearer " + localStorage.getItem("access"),
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
		let	response = await fetch(`management/management/friends/request/${id}/deny`,{	//	IS THIS CORRECT?
									method: "POST",
									headers: {
										"Authorization": "Bearer " + localStorage.getItem("access"),
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

/*
{"id":"f4bc100d-0d42-4bba-8612-2525ef66a325","username":"fmouronh","motto":"git gud","avatar":"avatars/ballspin_ExpHtQF.png","last_activity":"2025-04-19T03:44:56.279307Z"}

{"id":1,"sender":"a8573cc1-132f-461b-9551-145abec1e569","receiver":"f4bc100d-0d42-4bba-8612-2525ef66a325","sent_at":"2025-04-19T03:49:09.959506Z","accepted_at":null,"rejected_at":null}

*/