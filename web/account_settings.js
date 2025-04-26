import {renderAuth} from './auth.js'
import {App} from './app.js'
import { main } from "./index.js";
import {updateAccessTkn} from './utils.js'
import {clearPopovers} from './utils.js'
import {showPopover} from './utils.js'
import {getOwnUserData} from './utils.js'
import {setElemHoverColors} from './utils.js'
import {toggle2FA, enable2FA} from './auth.js'


"use strict";



async function	chgUserName(event)
{
	let newUserField = document.getElementById("newUserField");

	clearPopovers();

	try
	{
		await updateAccessTkn();

		let response = await fetch("management/profile/username/", 
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Bearer " + sessionStorage.getItem("access"),
						},
						body: JSON.stringify({"username": newUserField.value}),
					}
		);

		if (!response.ok)
		{
			let responseData = await response.json();
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}

		let userNameDisplay = document.getElementById("userNameDisplay");
		if (userNameDisplay)
			userNameDisplay.innerText = newUserField.value;

		document.getElementById("changeUsernameForm").reset();
		newUserField.classList.add("is-valid");
		showPopover("Username updated", newUserField.parentElement, 'success');
	}
	catch(error)
	{
			newUserField.classList.add("is-invalid");
			showPopover(error.toString().slice(7), newUserField.parentElement, "danger");
			event.stopPropagation();
	}
}

async function	chgMotto(event)
{
	clearPopovers();

	let newMottoField = document.getElementById("newMottoField");

	try
	{
		await updateAccessTkn();

		let response = await fetch("management/profile/motto/", {
									method: "PATCH",
									headers: {
										"Content-Type": "application/json",
										"Authorization": "Bearer " + sessionStorage.getItem("access"),
									},
									body: JSON.stringify({"motto": newMottoField.value}),
								}
					);
		if (!response.ok)
		{
			let responseData = await response.json();
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}

		let mottoDisplay = document.getElementById("mottoDisplay");
		if (mottoDisplay)
			mottoDisplay.innerText = `"${newMottoField.value}"`;

		document.getElementById("changeMottoForm").reset();
		newMottoField.classList.add("is-valid");
		showPopover("Motto updated", newMottoField.parentElement, 'success');
	}
	catch (error)
	{
		newMottoField.classList.add("is-invalid");
		showPopover(error.toString().slice(7), newMottoField.parentElement, "danger")
		event.stopPropagation();
	}
}

async function	getNewPfpPath()
{
	updateAccessTkn();

	try
	{
		let userData = await getOwnUserData();

		if (!userData)
			throw new Error("failed to retrieve user data");

		return (`management/media/${userData.avatar}`)
	}
	catch(error)
	{
		console.log(error);
	}
}

async function	chgPfp(event)
{
	clearPopovers();

	let uploadBtn = document.getElementById("pfpUploadBtn");
	let newPfp = new FormData();

	newPfp.append("avatar", uploadBtn.files[0]);

	try
	{
		await updateAccessTkn();

		let response = await fetch("management/profile/avatar", {
							method: "PATCH",
							headers: {
								"Authorization": "Bearer " + sessionStorage.getItem("access"),
							},
							body: newPfp,
			});


		if (!response.ok)
		{
			let errorMsg;

			switch (response.status)
			{
				case (400):
					let responseData = await response.json();
					errorMsg = responseData[Object.keys(responseData)[0]];
					break ;
				case (413):
					errorMsg = "Filesize too large";
					break ;
				default:
					errorMsg = "Unhandled exception";
			}
			throw new Error(errorMsg);
		}

		let pfpElem = document.getElementById("userPfp");
		if (pfpElem)
			pfpElem.src = await getNewPfpPath();

		document.getElementById("changePfpForm").reset();
		showPopover("Profile picture updated", uploadBtn, "success");
	}
	catch (error)
	{
		showPopover(error.toString().slice(7), uploadBtn, "danger");
		event.stopPropagation();
	}

}

async function	chgPassword(event)
{
	let errField;

	updateAccessTkn();

	let creds = {
		current_password: document.getElementById("oldPasswordField").value,
		new_password: document.getElementById("newPasswordField").value,
	};

	try
	{
		if (document.getElementById("newPasswordField").value !== document.getElementById("confirmPasswordField").value)
		{
			errField = "confirmPasswordField";
			throw new Error("Password mismatch.");
		}

		let response = await fetch("management/profile/password", {
									method: "PATCH",
									headers: {
										"Content-Type": "application/json",
										"Authorization": "Bearer " + sessionStorage.getItem("access"),
									},
									body: JSON.stringify(creds),
		});

		if (!response.ok)
		{
			//	SET errField & THROW ERROR
			let responseData = await response.json();
			let errKey = Object.keys(responseData)[0];

			switch (errKey)
			{
				case ("current_password"):
					errField = "oldPasswordField";
					break ;
				case ("new_password"):
					errField = "newPasswordField";
					break ;
				default:
					throw new Error("Unhandled exception");
			}
			throw new Error(responseData[errKey]);
		}

		document.getElementById("chgPasswdForm").reset();

		document.getElementById("oldPasswordField").classList.add("is-valid");
		document.getElementById("newPasswordField").classList.add("is-valid");
		document.getElementById("confirmPasswordField").classList.add("is-valid");


		showPopover("Password updated", document.getElementById("chgPasswdBtn").parentElement, 'success');
	}
	catch(error)
	{
		if (errField === undefined)
			errField = "chgPasswdBtn";

		let	errElem = document.getElementById(errField);
		errElem.classList.add("is-invalid");
		showPopover(error.toString().slice(7), errElem.parentElement, 'danger');
		event.stopPropagation();
	}
}

function	setupEventHandlers()
{
	document.getElementById("changeUsernameForm").onsubmit = (event) => { event.preventDefault(), chgUserName(event) };
	document.getElementById("changeMottoForm").onsubmit = (event) => { event.preventDefault(), chgMotto(event) };
	document.getElementById("change2FAHeader").onclick=()=>toggle2FA();
	document.getElementById("toggle2FABtn").onclick=()=>enable2FA();
	document.getElementById("changePfpForm").onsubmit = (event) => { event.preventDefault(), chgPfp(event) };
	document.getElementById("chgPasswdForm").onsubmit = (event) => { event.preventDefault(), chgPassword(event) };
}


export function	renderAcctSettings()
{
	setupEventHandlers();

	setElemHoverColors(document.getElementById("chgUsernameBtn"), "light", "dark", "light");
	setElemHoverColors(document.getElementById("chgMottoBtn"), "light", "dark", "light");
	setElemHoverColors(document.getElementById("toggle2FABtn"), "light", "dark", "light");
	setElemHoverColors(document.getElementById("submitPfpBtn"), "light", "dark", "light");
	setElemHoverColors(document.getElementById("chgPasswdBtn"), "light", "dark", "light");
}