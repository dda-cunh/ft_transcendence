import {renderAuth} from './auth.js'
import {renderMainMenu} from './main_menu.js'

"use strict";

//	DECLARE A GLOBAL OBJECT FOR loggedIn STATUS, GAME SETTINGS, ETC
let	app = {
	loggedIn: false,
//	APP STATUS ("mainMenu"/"inGame"/"tournamentBoard")
//	GAME SETTINGS
//		GAMEPLAY
//		VISUALS
};

function	main()
{
//	CHECK USER/APP STATUS & RENDER ACCORDINGLY
//	renderAuth();
	renderMainMenu();
}


main();