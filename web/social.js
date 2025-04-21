"use strict";

async function	getUserData(userID)
{
	let response = await fetch(`management/management/user/${userID}/`);

	return (await response.json() );
}

async function	renderPlayerCard(userID)
{
	let	playerCardContainer = document.getElementById("appContainer");

	try
	{
		let response = await fetch("views/player_card.html");

		if (!response.ok)
			throw new Error("Error loading player card");

		let playerCardHtml = await response.text();
		playerCardContainer.innerHTML = playerCardHtml;

/*
		TO DO:
			ADD "ACCEPT"/"DENY" BUTTONS IF THERE IS A PENDING REQUEST FROM THIS USER
			OTHERWISE ADD "ADD FRIEND" BUTTON IF USER IS NOT ADDED AS FRIEND
*/
		document.getElementById("acctSettingsBtn").style.opacity = 0;
		document.getElementById("acctSettingsBtn").classList.add("disabled");


		let userData = await getUserData(userID);

		let imgSrc = userData.avatar;
		let userName = userData.username;
		let motto = userData.motto;

		let pfp = document.getElementById("userPfp");

		pfp.src = `management/media/${imgSrc}`;
		document.getElementById("userNameDisplay").innerText = userName;
		document.getElementById("mottoDisplay").innerText = `"` + motto + `"`;

		let pfpHeight = document.getElementById("pfpContainer").offsetHeight;
		pfp.style.height = `${pfpHeight}px`;
		pfp.style.width = `${pfpHeight}px`;
	}
	catch (error)
	{
		playerCardContainer.innerHTML = `<p>${error}</p>`;
	}
}

async function	renderPlayerProfile(userID)
{
	let viewRow = document.getElementById("viewRow");

	try
	{
		let response = await fetch("views/profile.html");

		if (!response.ok)
			throw new Error(`Error loading user profile`);

		let viewHtml = await response.text();
		viewRow.innerHTML = viewHtml;

	}
	catch (error)
	{
		viewRow.innerHTML = `<p>${error}</p>`;
	}
}

export async function	renderUserProfile(userID)
{
	localStorage.setItem("currentView", "user#"+userID);

	let currentView = localStorage.getItem("currentView");
	if (history.state?.view !== currentView)
		history.pushState({view: currentView}, document.title, location.href);

	await renderPlayerCard(userID);
	renderPlayerProfile(userID);
}
