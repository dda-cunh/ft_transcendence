import { renderUserProfile } from './social.js'
import { changeProfile } from './social.js'
import { updateAccessTkn } from './utils.js';
import { renderToggableGraph } from './stats.js'


"use strict";

async function	getUserData(userID)
{
	let response = await fetch(`management/management/user/${userID}/`);

	return (await response.json() );
}

async function renderGameEntries(data, userID, dest) {
	let played = 0, won = 0, lost = 0;

	for (const entry of data) {
	  played++;
	  let id = entry.player1;
	  let result = "lost";
	  
	  if (entry.player1 === userID)
		id = entry.player2;
	  
	  if (entry.winner === userID) {
		result = "won";
		won++;
	  } else
		lost++;
	  
	  let color = (result === "won") ? "success": "danger";

	  let opponent = await getUserData(id);

	  const date = new Date(entry.ended_at);
	  const formattedDate = date.toLocaleString();

	  let row = `<tr data-id="${id}" class="history-link cursor-pointer" style="cursor: pointer;">
		<td data-id="${id}" class="cursor-pointer">${formattedDate}</td>
		<td data-id="${id}" class="cursor-pointer">${opponent.username}</td>
		<td data-id="${id}" class="cursor-pointer text-${color}">${entry.p1_score} - ${entry.p2_score}</td>
		<td data-id="${id}" class="cursor-pointer">${result}</td>
	  </tr>`;
  
	  dest.innerHTML += row;
	}
	if (document.querySelector("#played"))
		document.querySelector("#played").innerText = played;
	if (document.querySelector("#won"))
		document.querySelector("#won").innerText = won;
	if (document.querySelector("#lost"))
		document.querySelector("#lost").innerText = lost;

	document.querySelectorAll(".history-link").forEach(link => {
		link.addEventListener("click", (event) => changeProfile(event.target.dataset.id) );
	})
}


async function renderTournamentEntries(data, id, dest) {
	let joined = 0, won = 0;
	for (const entry of data) {
		joined++;
		let placement = "participant";
		
		const date = new Date(entry.ended_at);
		const formattedDate = date.toLocaleString();

		if (entry.winner === id){
			won++;
			placement = "Winner";
		}
		let row = `<tr>
		<td>${formattedDate}</td>
		<td>${placement}</td>
	    </tr>`;
		
	  	dest.innerHTML += row;
	}
	if (document.querySelector("#joined"))
		document.querySelector("#joined").innerText = joined;
	if (document.querySelector("#twon"))
		document.querySelector("#twon").innerText = won;
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
export async function renderMatchHistory(userID, stats)
{
	try
	{
		let id = userID ? userID : await getPersonalID();

		let	response = await fetch(`game/tracker/matches/user/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + sessionStorage.getItem("access"),
			},
		} );

		if (!response.ok)
			return

		let dest = document.querySelector("#matchHistory");
		if (!dest && !stats)
			return

		let data = await response.json();
		if (!stats)
			await renderGameEntries(data, id, dest);
		else
			await renderToggableGraph(data, id, "matchStats")
	}
	catch(error)
	{
		console.error(error)
	}
}


/* GET TOURNAMENT HISTORY */
export async function renderTournamentHistory(userID)
{
	try
	{
		let id = userID ? userID : await getPersonalID();
		let	response = await fetch(`game/tracker/tournament/user/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + sessionStorage.getItem("access"),
			},
		} );

		if (!response.ok)
			return

		let dest = document.querySelector("#tHistory");
		if (!dest)
			return
		let data = await response.json();
		await renderTournamentEntries(data, id, dest);
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
			let statusColor = entry.online ? "success" : "secondary";
            let row = `<tr data-id="${entry.id}" class="profile-link cursor-pointer" style="cursor: pointer;">
				<td data-id="${entry.id}" class="cursor-pointer">
					<img data-id="${entry.id}" style="height: 75px; width: 75px; object-fit: cover;" class="cursor-pointer rounded-circle" src="/management/media/${entry.avatar}" alt="${entry.username}'s avatar" />
				</td>
				<td data-id="${entry.id}" class="cursor-pointer">
            		<a data-id="${entry.id}" class="cursor-pointer display-6 link-light link-underline link-underline-opacity-0 link-opacity-75-hover">
						${entry.username}
            		</a>
				</td>
				<td data-id="${entry.id}">
					<span data-id="${entry.id}" class="badge bg-${statusColor} border border-light rounded-circle" style="height: 20px; width: 20px">
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
	updateAccessTkn();
	await renderFriendsList();
	await renderMatchHistory(null, false);
	await renderTournamentHistory(null);
	document.querySelectorAll(".profile-link").forEach(link => {
		link.addEventListener("click", (event) => renderUserProfile(event.target.dataset.id) );
	});
}
