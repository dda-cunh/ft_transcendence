import {renderAuth} from './auth.js'
import {renderMainMenu} from './main_menu.js'
import {renderPongGame} from './pong_game.js'

"use strict";

//	THIS IS UNNECESSARY, KEEP THIS STUFF IN LOCAL STORAGE
let	app = {
	settings: {},
//	APP STATUS ("mainMenu"/"inGame"/"tournamentBoard")
//	GAME SETTINGS
//		GAMEPLAY
//		VISUALS
};

function	initApp()
{
	app.settings.gameplay = {
		matchType: "Single Player",
		gameType: "Original",
	};
	app.settings.visuals = {
		paddleColor: "White",
		ballColor: "White",
		backgroundColor: "Black",
	};
}

async function	checkToken(tkn)
{
	console.log(tkn);

	let	response = await fetch("auth/validate", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + tkn,
		},
	} );

		console.log(response);

	return (response.ok);
}

async function	userIsLoggedIn()
{
	let	accessToken = localStorage.getItem("access");

	if (accessToken !== null)
	{
		accessToken = "invalid";	//	FOR TESTING; REMOVE THIS LINE BEFORE PUSHING

		let accessCheck = await checkToken(accessToken);
		let refreshCheck = await checkToken(localStorage.getItem("refresh") );

//		if (!accessCheck && refreshCheck)
//			REFRESH ACCESS TOKEN

		return (accessCheck	? true
							: refreshCheck
				);
	}

	return (false);
}


async function	main()
{
	initApp();


	if (!(await userIsLoggedIn() ) )
		renderAuth(app);
	else
	{
//	CHECK APP STATUS & RENDER ACCORDINGLY
		renderMainMenu(app);
//		renderPongGame(app);
	}
}


main();