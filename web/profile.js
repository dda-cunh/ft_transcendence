import {renderUserProfile} from './social.js'


"use strict";


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
			console.log(entry);
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
	await renderFriendsList();

	document.querySelectorAll(".profile-link").forEach(link => {
		link.addEventListener("click", (event) => renderUserProfile(event.target.dataset.id) );
	});
}
