import {App} from './app.js'
import { main } from "./index.js";
import {clearPopovers} from './utils.js'
import {showPopover} from './utils.js'

"use strict";


	/*	PAGE RENDERING	*/
async function	renderPage()
{
	let mainContainer = document.getElementById("mainContainer");

	try
	{
		let response = await fetch("views/auth.html");

		if (!response.ok)
			throw new Error("Error loading authentication form");

		let authHtml = await response.text();
		mainContainer.innerHTML = authHtml;
	}
	catch (error)
	{
		mainContainer.innerHTML = `<p>${error.toString().slice(7)}</p>`;
	}
}


	/*	EVENT HANDLERS	*/
async function	doAuth(creds, dir)
{
	let	response = await fetch(dir, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(creds),
	} );

	let data = await response.json();

	data.ok = response.ok;

	return (data);
}

async function	registerUser(event)
{
	event.preventDefault();

	let	errField;

	let creds = {
		username: document.getElementById("registerUserField").value,
		password: document.getElementById("registerPasswordField").value,
	};
	let confirmPasswd = document.getElementById("confirmPasswordField").value;

	try
	{
		if (creds.password !== confirmPasswd)
		{
			errField = "confirmPasswordField";
			throw new Error("Password mismatch.");
		}

		let responseData = await doAuth(creds, "auth/register/");

		if (!responseData.ok)
		{
			let errKey = Object.keys(responseData)[0];
			switch (errKey)
			{
				case ("username"):
					errField = "registerUserField";
					break ;
				case ("password"):
					errField = "registerPasswordField";
					break ;
				default:
					throw new Error("Unhandled exception");
			}
			throw new Error(responseData[errKey]);
		}
		else
		{
			sessionStorage.setItem("access", responseData.tokens.access);
			sessionStorage.setItem("refresh", responseData.tokens.refresh);
			sessionStorage.setItem("currentView", "home");
			main();
		}
	}
	catch (error)
	{
		clearPopovers();
		if (errField === undefined)
			errField = "registerUserBtn";

			let	errElem = document.getElementById(errField);
			errElem.classList.add("is-invalid");
			showPopover(error.toString().slice(7), errElem.parentElement, 'danger');
			event.stopPropagation();
	}
}

async function	loginUser(event)
{
	event.preventDefault();

	let	errField;

	let creds = {
		username: document.getElementById("loginUserField").value,
		password: document.getElementById("loginPasswordField").value,
	};

	try
	{
		let responseData = await doAuth(creds, "auth/");

		if (!responseData.ok)
		{
			let errKey = Object.keys(responseData)[0];
			switch (errKey)
			{
				case "username":
					errField = "loginUserField";
					break ;
				case "password":
				case "detail":
					errField = "loginPasswordField";
					break ;
				default:
					throw new Error("Unhandled exception");
			}
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}
		else
		{
			sessionStorage.setItem("access", responseData.access);
			sessionStorage.setItem("refresh", responseData.refresh);
			sessionStorage.setItem("currentView", "home");
			main();
		}
	}
	catch(error)
	{
		clearPopovers();
		if (errField === undefined)
			errField = "loginBtn"

		let	errElem = document.getElementById(errField);
		errElem.classList.add("is-invalid");
		showPopover(error.toString().slice(7), errElem.parentElement, 'danger');
		event.stopPropagation();
	}
}



	/*	MAIN FUNCTION	*/
export async function	renderAuth()
{
	sessionStorage.setItem("currentView", "home");

	document.getElementById.("mainContainer").innerHTML = "";

	await renderPage();


	document.getElementById("loginForm").onsubmit = (event) => { loginUser(event) };
	document.getElementById("registerForm").onsubmit = (event) => { registerUser(event) };
}