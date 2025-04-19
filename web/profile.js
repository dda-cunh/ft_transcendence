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
				"Authorization": "Bearer " + localStorage.getItem("access"),
			},
		} );

		if (!response.ok)
			return

		let dest = document.querySelector("#friendsList");
		if (!dest)
			return
		let data = await response.json();
		data.forEach(entry => {
            let row = `<tr class="m-0 p-0 w-100 d-flex flex-row align-items-center justify-content-around border-top">
				<td class="d-flex flex-column"><img height="75px" class="rounded-circle" src="/management/media/${entry.avatar}" alt="${entry.username}'s avatar" /></td>
				<td class="d-flex flex-column">${entry.username}</td>
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
export function	renderProfile()	//	ADD id PARAMETER
{
	renderFriendsList();
}
