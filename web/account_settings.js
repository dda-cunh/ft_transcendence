import {renderAuth} from './auth.js'
import {App} from './app.js'
import {updateAccessTkn} from './utils.js'
import {clearErrFields} from './utils.js'

"use strict";


async function	chgUserName(event)
{
	let newUserField = document.getElementById("newUserField");

	clearErrFields();

	try
	{
		await updateAccessTkn();

		let response = await fetch("management/profile/username/", 
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Bearer " + localStorage.getItem("access"),
						},
						body: JSON.stringify({"username": newUserField.value}),
					}
		);

		if (!response.ok)
		{
			let responseData = await response.json();
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}

		App();
	}
	catch(error)
	{
			let errMsg = document.getElementById("errMsg");
			if (errMsg !== null)
				errMsg.remove();
			newUserField.classList.add("is-invalid");
			newUserField.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback\">"+error+"</div>");
			event.stopPropagation();
	}
}

async function	chgMotto(event)
{
	clearErrFields();

	let newMottoField = document.getElementById("newMottoField");

	try
	{
		if (!newMottoField.value)
			throw new Error("This field cannot be empty.");

		await updateAccessTkn();

		let response = await fetch("management/profile/motto/", {
									method: "PATCH",
									headers: {
										"Content-Type": "application/json",
										"Authorization": "Bearer " + localStorage.getItem("access"),
									},
									body: JSON.stringify({"motto": newMottoField.value}),
								}
					);
		if (!response.ok)
		{
			let responseData = await response.json();
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}

		App();
	}
	catch (error)
	{
		let errMsg = document.getElementById("errMsg");
		if (errMsg !== null)
			errMsg.remove();
		newMottoField.classList.add("is-invalid");
		newMottoField.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback\">"+error+"</div>");
		event.stopPropagation();
	}
}

async function	chgPfp(event)
{
/*
	TODO:
		ERROR HANDLING (EX IMG TOO LARGE)
*/
	clearErrFields();

	let uploadBtn = document.getElementById("pfpUploadBtn");
	let newPfp = new FormData();

	newPfp.append("avatar", uploadBtn.files[0]);

	try
	{
		await updateAccessTkn();

		let response = await fetch("management/profile/avatar", {
							method: "PATCH",
							headers: {
								"Authorization": "Bearer " + localStorage.getItem("access"),
							},
							body: newPfp,
			});

		let responseData = await response.json();

		if (!response.ok)
		{
			//	SWITCH/CASE HERE
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}

		App();
	}
	catch (error)
	{
		uploadBtn.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback d-block\">"+error+"</div>");
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
										"Authorization": "Bearer " + localStorage.getItem("access"),
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
		document.getElementById("confirmPasswordField").insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"valid-feedback d-block\">Password updated successfully</div>")
	}
	catch(error)
	{
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

function	setupEventHandlers()
{
	document.getElementById("changeUsernameForm").onsubmit = (event) => chgUserName(event);
	document.getElementById("changeMottoForm").onsubmit = (event) => chgMotto(event);
	document.getElementById("changePfpForm").onsubmit = (event) => chgPfp(event);
	document.getElementById("chgPasswdForm").onsubmit = (event) => chgPassword(event);
}


export function	renderAcctSettings()
{
	setupEventHandlers();
}