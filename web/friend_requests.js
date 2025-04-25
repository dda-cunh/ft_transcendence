import {main} from "./index.js"
import {renderUserProfile} from './social.js'
import {updateAccessTkn} from './utils.js'
import {showPopover} from './utils.js'

"use strict";


async function	renderList()
{
	updateAccessTkn();

	let frTable = document.getElementById("frList");

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

		let responseData = await response.json();

		if (Object.keys(responseData).length === 0)
		{
			frTable.innerHTML = `
				<tr class="lead">
					<td><p class="mt-3 pe-none">You have no new friend requests</p></td>
				</tr>
			`;
		}
		else
		{
			responseData.forEach(entry => {
				let row = `
					<tr data-id="${entry.sender}">
						<td data-id="${entry.sender}">
							<a data-id="${entry.sender}" class="profile-link" href="#">
								<img data-id="${entry.sender}" style="object-fit: cover; height: 75px; width: 75px;" class="img-fluid rounded-circle" src="/management/media/avatars/${entry.sender_avatar.split("/").pop()}" alt="${entry.sender_username}'s avatar" />
							</a>
						</td>
						<td data-id="${entry.sender}">
							<a data-id="${entry.sender}" class="profile-link display-6 link-light link-underline link-underline-opacity-0 link-opacity-75-hover" href="#">
								${entry.sender_username}
							</a>
						</td data-id="${entry.sender}">
						<td data-id="${entry.sender}">
							<button id="acceptBtn" class="btn btn-outline-light accept-btn" data-id="${entry.id}">ACCEPT</button>
							<button id="denyBtn" class="btn btn-outline-light deny-btn" data-id="${entry.id}">DENY</button>
						</td>
					</tr>
				`;
				frTable.innerHTML += row;
			} );

			let acceptBtn = document.getElementById("acceptBtn");
			acceptBtn.addEventListener('mouseenter', () => {
													acceptBtn.style.color = 'var(--bs-success)';
													acceptBtn.style.backgroundColor = 'transparent';
													acceptBtn.style.borderColor = 'var(--bs-success)';
			});
			acceptBtn.addEventListener('mouseleave', () => {
													acceptBtn.style.color = ''; // resets to original
													acceptBtn.style.backgroundColor = '';
													acceptBtn.style.borderColor = ''; // resets to original
			});

			let denyBtn = document.getElementById("denyBtn");
			denyBtn.addEventListener('mouseenter', () => {
													denyBtn.style.color = 'var(--bs-danger)';
													denyBtn.style.backgroundColor = 'transparent';
													denyBtn.style.borderColor = 'var(--bs-danger)';
			});
			denyBtn.addEventListener('mouseleave', () => {
													denyBtn.style.color = ''; // resets to original
													denyBtn.style.backgroundColor = '';
													denyBtn.style.borderColor = ''; // resets to original
			});
		}
	}
	catch (error)
	{
		frTable.innerHTML = `
			<tr>
				<td>
					<p class="text-danger">${error}</p>
				</td>
			</tr>
		`;
	}
}

export async function	acceptFriendRequest(event)
{
	const	id = event.target.dataset.id;
	console.log(event);
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
			throw new Error("Failed to accept request");

	}
	catch (error)
	{
		console.log(error);
	}
}

export async function	denyFriendRequest(event)
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
			throw new Error("Failed to deny request");

	}
	catch (error)
	{
		console.log(error);
	}
}

function	setupEventHandlers()
{
	document.querySelectorAll(".profile-link").forEach(link => {
		link.addEventListener("click", (event) => {
			sessionStorage.setItem("currentView", `user#${event.target.dataset.id}`);
			main();
		})
	});

	document.querySelectorAll(".accept-btn").forEach(button => {
		button.addEventListener("click", (event) => {
														acceptFriendRequest(event);
														renderList();
														showPopover("Friend request accepted", document.getElementById("popover"), 'success');
													} );
	} );

	document.querySelectorAll(".deny-btn").forEach(button => {
		button.addEventListener("click", (event) => {
														denyFriendRequest(event);
														renderList();
														showPopover("Friend request rejected", document.getElementById("popover"));
													} );
	} );
}


export async function	renderFriendRequests()
{
	await renderList();
	setupEventHandlers();
}
