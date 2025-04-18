import {renderAuth} from './auth.js'

"use strict";


async function	updateAccessTkn()
{
		let refreshCheck = await fetch("auth/refresh", {
										method: "POST",
										headers: {
											"Content-Type": "application/json",
											},
										body: JSON.stringify({ refresh: localStorage.getItem("refresh") }),
										} );
		if (refreshCheck.ok)
		{
			let body = await refreshCheck.json();
			localStorage.setItem("access", body.access);
		}
		else
		{
			localStorage.removeItem("access");
			localStorage.removeItem("refresh");
			renderAuth();
		}
}


async function	chgUserName(event)
{
	let newUserField = document.getElementById("newUserField");

	try
	{
		if (!newUserField.value)
			throw new Error("This field cannot be empty.");

		updateAccessTkn();

		await fetch("management/profile/username/", 
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

		location.reload();
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
	let errMsg = document.getElementById("errMsg");
	if (errMsg !== null)
		errMsg.remove();

	let newMottoField = document.getElementById("newMottoField");

	try
	{

		if (!newMottoField.value)
			throw new Error("This field cannot be empty.");

		updateAccessTkn();

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

		location.reload();
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
	let errField;
	let errMsg = document.getElementById("errMsg");
	if (errMsg !== null)
		errMsg.remove();

	updateAccessTkn();

	let uploadBtn = document.getElementById("pfpUploadBtn");

	try
	{
		let response = await fetch("management/profile/avatar", {
							method: "PATCH",
							headers: {
								"Authorization": "Bearer " + localStorage.getItem("access"),
							},
							body: uploadBtn.files[0],
			});

		let responseData = await response.json();

		if (!response.ok)
			throw new Error(responseData[Object.keys(responseData)[0]]);

		location.reload();
	}
	catch (error)
	{
		console.log(error);
		uploadBtn.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback\">"+error+"</div>");
		event.stopPropagation();
	}

}

async function	chgPassword(event)
{
	let errField;
	let errMsg = document.getElementById("errMsg");
	if (errMsg !== null)
		errMsg.remove();

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

		alert("Password updated successfully");
		location.reload();
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
	document.getElementById("changeUsernameForm").addEventListener("submit", (event) => chgUserName(event) );
	document.getElementById("changeMottoForm").addEventListener("submit", (event) => chgMotto(event) );
	document.getElementById("changePfpForm").addEventListener("submit", (event) => chgPfp(event) );
	document.getElementById("chgPasswdForm").addEventListener("submit", (event) => chgPassword(event) );
}


export function	renderAcctSettings()
{
	setupEventHandlers();
}