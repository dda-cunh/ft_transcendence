"use strict";

export async function	renderFriendRequests()
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
						<td class=""><img height="75px" class="rounded-circle" src="${entry.sender_avatar}" alt="${entry.sender_username}'s avatar" /></td>
						<td class="">${entry.sender_username}</td>
						<td class="">
							<button class="btn btn-outline-success">ACCEPT</button>
							<button class="btn btn-outline-danger">DENY</button>
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

/*
{"id":"f4bc100d-0d42-4bba-8612-2525ef66a325","username":"fmouronh","motto":"git gud","avatar":"avatars/ballspin_ExpHtQF.png","last_activity":"2025-04-19T03:44:56.279307Z"}

{"id":1,"sender":"a8573cc1-132f-461b-9551-145abec1e569","receiver":"f4bc100d-0d42-4bba-8612-2525ef66a325","sent_at":"2025-04-19T03:49:09.959506Z","accepted_at":null,"rejected_at":null}

*/