import {renderAuth} from './auth.js'
import {App} from './app.js'


"use strict";


function	initApp()
{
	let	currentView = localStorage.getItem("currentView");

	let matchType = localStorage.getItem("matchType");
	let gameType = localStorage.getItem("gameType");
	let paddleColor = localStorage.getItem("paddleColor");
	let ballColor = localStorage.getItem("ballColor");
	let backgroundColor = localStorage.getItem("backgroundColor");

	if (currentView === null)
		localStorage.setItem("currentView", "home");

	if (matchType === null)
		localStorage.setItem("matchType", "Single Player");

	if (gameType === null)
		localStorage.setItem("gameType", "Original");

	if (paddleColor === null)
		localStorage.setItem("paddleColor", "White");

	if (ballColor === null)
		localStorage.setItem("ballColor", "White");

	if (backgroundColor === null)
		localStorage.setItem("backgroundColor", "Black");
}

async function	checkToken(path, method, tkn)
{
	let	response = await fetch("auth/" + path, {
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + tkn,
		},
	} );

	return (response);
}

async function	userIsLoggedIn()
{
	let	accessToken = localStorage.getItem("access");

	if (accessToken !== null)
	{
		let accessCheck = await await fetch("auth/validate", {
											method: "GET",
											headers: {
												"Content-Type": "application/json",
												"Authorization": "Bearer " + accessToken,
												},
											} );
		if (accessCheck.ok)
			return (true);

		let refreshCheck = await fetch("auth/refresh", {
										method: "POST",
										headers: {
											"Content-Type": "application/json",
											},
										body: JSON.stringify({ refresh: localStorage.getItem("refresh") }),
										} );
		if (refreshCheck.ok)
		{
			let body = await refreshCheck.json();
			localStorage.setItem("access", body.access);
			return (true);
		}
	}

	return (false);
}


async function	main()
{
	initApp();


	if (!(await userIsLoggedIn() ) )
		renderAuth();
	else
		App();
}


main();