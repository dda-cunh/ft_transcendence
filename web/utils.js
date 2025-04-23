import { main } from "./index.js";
import {renderAuth} from './auth.js'


"use strict";


export async function	getOwnUserData()
{
	let response = await fetch("management/management/user/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + sessionStorage.getItem("access"),
		}
	});

	return (await response.json() );
}


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

export function	clearPopovers()
{
	const	markedFields = document.querySelectorAll(".is-invalid");
	markedFields.forEach((field) => {
		field.classList.remove("is-invalid");
	} );

	let popoverMsgs = document.querySelectorAll(".popover");
	popoverMsgs.forEach(msg => {
		msg.remove();
	})
		
}


export function showPopover(msg, targetElem, color = 'primary')
{
		const popover = new bootstrap.Popover(targetElem);

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
			}, 200);
			const	markedFields = document.querySelectorAll(".is-invalid");
			markedFields.forEach((field) => {
			field.classList.remove("is-invalid");
	} );
		}, 3000);
}
