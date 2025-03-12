import {renderAuth} from './auth.js'
import {renderMainMenu} from './main_menu.js'
import {renderPongGame} from './pong_game.js'

"use strict";

//	THIS MAY BE UNNECESSARY...
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
	if (accessToken !== null)
	{
		//	QUERY BACKEND, IF access TOKEN IS INVALID, CHECK REFRESH TOKEN
		return (true);
	}

	return (false);
}


function	main()
{
	initApp();	//	BACKEND OR PERSISTENT STORAGE?

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