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

function	userIsLoggedIn()
{
	let	accessToken = localStorage.getItem("access");
	console.log(accessToken);
	if (accessToken !== null)
	{
/*
		let	response = await fetch("auth/validate", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + localStorage.getItem("access"),
			},
		} );

		console.log(response);
*/
		return (true);
	}

	return (false);
}


function	main()
{
	initApp();

	if (!userIsLoggedIn() )
		renderAuth(app);
	else
	{
//	CHECK APP STATUS & RENDER ACCORDINGLY
		renderMainMenu(app);
//		renderPongGame(app);
	}
}


main();