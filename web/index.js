import {renderAuth} from './auth.js'
import {renderMainMenu} from './main_menu.js'

"use strict";

//	DECLARE A GLOBAL OBJECT FOR loggedIn STATUS (TRACK IT WITH TOKEN), GAME SETTINGS, ETC
let	app = {
//	LOGIN TOKEN
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