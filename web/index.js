import {renderAuth} from './auth.js'
import {App} from './app.js'
import {verify2FA} from './auth.js'

window.verify2FA = verify2FA;

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

	if (paddleColor === null)
		localStorage.setItem("paddleColor", "White");

	if (ballColor === null)
		localStorage.setItem("ballColor", "White");

	if (backgroundColor === null)
		localStorage.setItem("backgroundColor", "Black");
}

async function	userIsLoggedIn()
{
	let	accessToken = sessionStorage.getItem("access");

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
										body: JSON.stringify({ refresh: sessionStorage.getItem("refresh") }),
										} );
		if (refreshCheck.ok)
		{
			let body = await refreshCheck.json();
			sessionStorage.setItem("access", body.access);
			return (true);
		}
	}

	return (false);
}



export async function	main()
{
	initApp();

	if (!(await userIsLoggedIn() ) )
		renderAuth();
	else
		App();
}


main();
