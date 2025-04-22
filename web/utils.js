import { main } from "./index.js";
import {renderAuth} from './auth.js'


"use strict";


export async function	updateAccessTkn()
{
	if (!sessionStorage.getItem("access"))
		return ;
	let refreshCheck = await fetch("auth/refresh", {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
										},
									body: JSON.stringify({ refresh: sessionStorage.getItem("refresh") }),
									} );
	if (refreshCheck.ok)
	{
		let body = await refreshCheck.json();
		sessionStorage.setItem("access", body.access);
	}
	else
	{
		sessionStorage.removeItem("access");
		sessionStorage.removeItem("refresh");
		renderAuth();
	}
}

export function	clearErrFields()
{
	let errMsg = document.getElementById("errMsg");
	if (errMsg !== null)
		errMsg.remove();
	const	markedFields = document.querySelectorAll(".is-invalid");
	markedFields.forEach((field) => {
		field.classList.remove("is-invalid");
	} );
}
