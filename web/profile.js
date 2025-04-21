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
            let row = `<tr>
				<td>
            		<a class="profile-link" href="#">
						<img data-id="${entry.id}" style="height: 75px; width: 75px; object-fit: cover;" class="rounded-circle" src="/management/media/${entry.avatar}" alt="${entry.username}'s avatar" />
					</a>
				</td>
				<td>
            		<a data-id="${entry.id}" class="profile-link display-6 link-light link-underline link-underline-opacity-0 link-opacity-75-hover" href="#">
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
export function	renderProfile()
{
	renderFriendsList();
}
