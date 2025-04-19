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
		let data = await response.json();

		if (Object.keys(data).length === 0)
		{
			frTable.innerHTML = `
				<tr class="align-items-center justify-content-around">
					<td>You have no new friend requests</td>
				</tr>
			`;
		}
	}
	catch (error)
	{
		alert(error);
	}
}