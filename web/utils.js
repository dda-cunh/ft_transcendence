"use strict";


export async function	updateAccessTkn()
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
