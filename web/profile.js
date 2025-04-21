import { renderUserProfile } from './social.js'
import { updateAccessTkn } from './utils.js';


"use strict";

async function	getUserData(userID)
{
	let response = await fetch(`management/management/user/${userID}/`);

	return (await response.json() );
}

async function renderGameEntries(data, id, dest) {
	let played = 0, won = 0, lost = 0;
	for (const entry of data) {
	  played++;
	  let link = entry.player1;
	  let result = "lost";
	  
	  if (entry.player1 === id)
		link = entry.player2;
	  
	  if (entry.winner === id) {
		result = "won";
		won++;
	  } else
		lost++;
	  
	  let opponent = await getUserData(link);

	  const date = new Date(entry.ended_at);
	  const formattedDate = date.toLocaleString();

	  let row = `<tr data-id="${link}" class="profile-link cursor-pointer">
		<td data-id="${link}" class="cursor-pointer">${formattedDate}</td>
		<td data-id="${link}" class="cursor-pointer">${opponent.username}</td>
		<td data-id="${link}" class="cursor-pointer">${result}</td>
	  </tr>`;
  
	  dest.innerHTML += row;
	}
	if (document.querySelector("#played"))
		document.querySelector("#played").innerText = played;
	if (document.querySelector("#won"))
		document.querySelector("#won").innerText = won;
	if (document.querySelector("#lost"))
		document.querySelector("#lost").innerText = lost;
  }
  

async function getPersonalID()
{
	let accessCheck = await fetch("auth/validate", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + sessionStorage.getItem("access"),
			},
		} );
	if (!accessCheck.ok)
		return ;
	let usr = await accessCheck.json();
	return usr.payload.user_id;
}

/* GET MATCH HISTORY */
export async function renderMatchHistory(userID)
{
	updateAccessTkn();
	try
	{
		let id = userID ? userID : await getPersonalID();
		let	response = await fetch(`game/tracker/matches/user/${id}/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + sessionStorage.getItem("access"),
			},
		} );

		if (!response.ok)
			return

		let dest = document.querySelector("#matchHistory");
		if (!dest)
			return
		let data = await response.json();
		await renderGameEntries(data, id, dest);

	}
	catch(error)
	{
		console.error(error)
	}
}


/*	GET FRIENDS LIST	*/
export async function renderFriendsList()
{
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
			return

		let dest = document.querySelector("#friendsList");
		if (!dest)
			return
		let data = await response.json();
		data.forEach(entry => {
            let row = `<tr data-id="${entry.id}" class="profile-link cursor-pointer">
				<td data-id="${entry.id}" class="cursor-pointer">
					<img data-id="${entry.id}" style="height: 75px; width: 75px; object-fit: cover;" class="cursor-pointer rounded-circle" src="/management/media/${entry.avatar}" alt="${entry.username}'s avatar" />
				</td>
				<td data-id="${entry.id}" class="cursor-pointer">
            		<a data-id="${entry.id}" class="cursor-pointer display-6 link-light link-underline link-underline-opacity-0 link-opacity-75-hover">
						${entry.username}
            		</a>
				</td>
            </tr>`;
            dest.innerHTML += row;
        });
	}
	catch(error)
	{
		alert(error)
	}
}


	/*	MAIN FUNCTION	*/
export async function	renderProfile()
{
	await renderFriendsList();
	await renderMatchHistory(null);
	document.querySelectorAll(".profile-link").forEach(link => {
		link.addEventListener("click", (event) => renderUserProfile(event.target.dataset.id) );
	});
}
