import {renderAuth} from './auth.js'
import {App} from './app.js'
import {verify2FA} from './auth.js'
import {updateAccessTkn} from './utils.js'
import {showOpts, hideOpts, calcoords, adjust, toggleGraph} from './stats.js'


window.verify2FA = verify2FA;
window.showOpts = showOpts
window.hideOpts = hideOpts
window.adjust = adjust
window.calcoords = calcoords
window.toggleGraph = toggleGraph

"use strict";


function	initApp()
{
	let	currentView = sessionStorage.getItem("currentView");
	let matchType = sessionStorage.getItem("matchType");
	let paddleColor = sessionStorage.getItem("paddleColor");
	let ballColor = sessionStorage.getItem("ballColor");
	let backgroundColor = sessionStorage.getItem("backgroundColor");
	let gameMode = sessionStorage.getItem("gameMode");

	if (currentView === null)
		sessionStorage.setItem("currentView", "home");

	if (matchType === null)
		sessionStorage.setItem("matchType", "Single Player");

	if (paddleColor === null)
		sessionStorage.setItem("paddleColor", "White");

	if (ballColor === null)
		sessionStorage.setItem("ballColor", "White");

	if (backgroundColor === null)
		sessionStorage.setItem("backgroundColor", "Black");

	if (gameMode === null)
		sessionStorage.setItem("gameMode", "friendlyMatch");
}

export async function	userIsLoggedIn()
{
	let	accessToken = sessionStorage.getItem("access");

	if (accessToken !== null)
	{
		let accessCheck = await fetch("auth/validate", {
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
	updateAccessTkn();
	if (!(await userIsLoggedIn() ) )
		renderAuth();
	else
		App();
}


main();
