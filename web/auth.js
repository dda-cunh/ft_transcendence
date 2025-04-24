import {App} from './app.js'
import { main } from "./index.js";
import {clearErrFields} from './utils.js'
import {getUserData} from './app.js'

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
			errElem.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback\">"+error+"</div>")
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
		otp_token: document.getElementById("login2FAcode").value,
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
			if (responseData.TwoFA === "Enter code")
			{
				document.getElementById("login2FA").classList.remove("d-none");
				return ;
			}
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
			errElem.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback\">" + error + "</div>");
			event.stopPropagation();
		}
		else
			alert(error);
	}
}

export async function	toggle2FA()
{
	try {
		const user = await getUserData();
		const btn = document.getElementById("toggle2FABtn");
		if (btn) {
		  if (user.otp_enabled) {
			btn.textContent = "Disable";
			btn.onclick = disable2FA;
		  } else {
			btn.textContent = "Enable";
			btn.onclick = enable2FA;
		  }
		}
	  } catch (error) {
		console.error("2FA toggle init failed:", error);
	}
}

export async function	enable2FA()
{
	try
	{
		let twoFA = await fetch("auth/twoFactor_enable", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + sessionStorage.getItem("access"),
			}
		});
		if (!twoFA.ok) {
			let errorData = await twoFA.json();
			let errorMsg = errorData.message || "Failed to enable 2FA code";
			throw new Error(errorMsg);
		}

		let resp = await twoFA.json();
		let image = resp['qr_code'];

		let page = await fetch("views/twoFA.html");

		if (!page.ok)
			throw new Error("Error loading 2fa page");

		let page2fa = await page.text();

		document.getElementById("chg2FAForm").innerHTML = page2fa;
		document.getElementById("twofaImg").src = `data:image/png;base64,${image}`;
	}
	catch (error)
	{
		if (document.querySelector("#twofa-text"))
			document.getElementById("twofa-text").innerHTML = error;

		console.log(error);
	}
}


export async function disable2FA() {
	try {
	let response = await fetch("auth/twoFactor_disable", {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		"Authorization": "Bearer " + sessionStorage.getItem("access"),
		},
	});
	if (!response.ok) {
		let errorData = await response.json();
		let errorMsg = errorData.message || "Failed to disable 2FA";
		throw new Error(errorMsg);
	}
	main();
	} catch (error) {
	if (document.querySelector("#twofa-text"))
		document.getElementById("twofa-text").innerHTML = error;
	console.log(error);
	}
}


export async function	verify2FA(event)
{
	try
	{
		event.preventDefault();
		let resp = document.querySelector("#twofaForm").value;
		let	response = await fetch('auth/twoFactor_verify', {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + sessionStorage.getItem("access"),
			},
			body: JSON.stringify({"qrcode": resp}),
		} );

		if (!response.ok) {
			let errorData = await response.json();
			let errorMsg = errorData.message || "Failed to verify 2FA code";
			throw new Error(errorMsg);
		}

		let responseData = await response.json();
		console.log(responseData)
		main();
	}
	catch (error)
	{
		if (document.querySelector("#twofa-text"))
			document.getElementById("twofa-text").innerHTML = error;

		console.log(error);
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