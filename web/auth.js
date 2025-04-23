import {App} from './app.js'
import { main } from "./index.js";
import {clearErrFields} from './utils.js'

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
		mainContainer.innerHTML = `<p>${error}</p>`;
	}
}

function showPopover(msg, targetElem, color = 'primary')
{
		const popoverTrigger = document.getElementById(targetElem).parentElement;


		// Initialize the Bootstrap popover
		const popover = new bootstrap.Popover(popoverTrigger);

		// Show the popover on page load


		const observer = new MutationObserver(() => {
			const popoverEl = document.querySelector('.popover');

			if (popoverEl) {
			popoverEl.classList.add('border', `border-${color}`);

			const body = popoverEl.querySelector('.popover-body');
			if (body) {
				body.classList.add(`text-${color}`);
				body.innerText = msg
			}

			observer.disconnect(); // Stop watching once found
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });

		popover.show();
		setTimeout(() => {
			popover.hide();
			setTimeout(() => {
				popover.dispose();
			}, 150);
			const	markedFields = document.querySelectorAll(".is-invalid");
			markedFields.forEach((field) => {
			field.classList.remove("is-invalid");
	} );
		}, 3000);
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
		clearErrFields();
		if (errField !== undefined)
		{
			let	errElem = document.getElementById(errField);
			errElem.classList.add("is-invalid");
			showPopover(error.toString().slice(7), errField, 'danger');
			event.stopPropagation();
		}
		else
			alert(error);
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
		clearErrFields();
		if (errField !== undefined)
		{
			let	errElem = document.getElementById(errField);
			errElem.classList.add("is-invalid");
			showPopover(error.toString().slice(7), errField, 'danger');
			event.stopPropagation();
		}
		else
			alert(error);
	}
}



	/*	MAIN FUNCTION	*/
export async function	renderAuth()
{
	sessionStorage.setItem("currentView", "home");

	await renderPage();


	document.getElementById("loginForm").onsubmit = (event) => { loginUser(event) };
	document.getElementById("registerForm").onsubmit = (event) => { registerUser(event) };
}