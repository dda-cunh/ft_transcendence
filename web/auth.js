import {App} from './app.js'

"use strict";


	/*	PAGE RENDERING	*/
function	renderPage()
{
	let transcendenceApp = document.getElementById("mainContainer");
	transcendenceApp.innerHTML = `
			<div class="row">
				<div class="col mt-4">
					<h1 class="text-center">TRANSCENDENCE</h1>
				</div>
			</div>
			<div class="row">
				<div class="col mt-5 pt-5">
					<div class="card bg-dark text-center">
						<div class="card-header mx-auto">
							<ul class="nav nav-tabs card-header-tabs">
								<li class="nav-item">
									<a href="#login" class="nav-link bg-dark text-light active" data-bs-toggle="tab">Login</a>
								</li>
								<li class="nav-item">
									<a href="#signup" class="nav-link bg-dark text-light" data-bs-toggle="tab">Sign up</a>
								</li>
							</ul>
						</div>
						<div class="card-body">
							<div class="tab-content">
								<div class="tab-pane fade show active" id="login">
									<div class="col-7 col-lg-3 mx-auto">
										<form id="loginForm">
											<div class="input-group">
												<span class="input-group-text">
													<span class="bi-person-fill"></span>
												</span>
												<input id="loginUserField" type="text" class="form-control" id="user" placeholder="Username">
											</div>
											<div class="input-group mt-1">
												<span class="input-group-text">
													<span class="bi-lock-fill"></span>
												</span>
												<input id="loginPasswordField" type="password" class="form-control" id="password" placeholder="Password">
											</div>
											<button type="submit" class="btn btn-primary mt-2">Login</button>
										</form>
									</div>
								</div>
								<div class="tab-pane fade" id="signup">
									<div class="col-7 col-lg-3 mx-auto">
										<form id="registerForm">
											<div class="input-group">
												<span class="input-group-text">
													<span class="bi-person-fill"></span>
												</span>
												<input id="registerUserField" type="text" class="form-control" id="registerUser" placeholder="Username">
											</div>
											<div class="input-group mt-1">
												<span class="input-group-text">
													<span class="bi-lock-fill"></span>
												</span>
												<input id="registerPasswordField" type="password" class="form-control" id="registerPassword" placeholder="Password">
											</div>
											<div class="input-group mt-1">
												<span class="input-group-text">
													<span class="bi-lock-fill"></span>
												</span>
												<input id="confirmPasswordField" type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password">
											</div>
											<button type="submit" class="btn btn-success mt-2">Register</button>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
	`;
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
			throw new Error("Password mismatch.");	//	WRITE A BETTER MESSAGE?
		}

		let responseData = await doAuth(creds, "auth/register/");

		if (!responseData.ok)
		{
			let errKey = Object.keys(responseData)[0];
			switch (errKey)
			{
				case "username":
					errField = "registerUserField";
					break ;
				case "password":
					errField = "registerPasswordField";
					break ;
				default:
					throw new Error("Unhandled exception");
			}
			throw new Error(responseData[Object.keys(responseData)[0]]);
		}
		else
		{
			localStorage.setItem("access", responseData.tokens.access);
			localStorage.setItem("refresh", responseData.tokens.refresh);
			App();
		}
	}
	catch (error)
	{
		if (errField !== undefined)
		{
			let errMsg = document.getElementById("errMsg");
			if (errMsg !== null)
				errMsg.remove();

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
			localStorage.setItem("access", responseData.access);
			localStorage.setItem("refresh", responseData.refresh);
			App();
		}
	}
	catch(error)
	{
		if (errField !== undefined)
		{
			let errMsg = document.getElementById("errMsg");
			if (errMsg !== null)
				errMsg.remove();

			let	errElem = document.getElementById(errField);
			errElem.classList.add("is-invalid");
			errElem.insertAdjacentHTML("afterend", "<div id=\"errMsg\" class=\"invalid-feedback\">" + error + "</div>");
			event.stopPropagation();
		}
		else
			alert(error);
	}
}


	/*	MAIN FUNCTION	*/
export function	renderAuth()
{
	renderPage();

	document.getElementById("loginForm").addEventListener("submit", (event) => loginUser(event) );
	document.getElementById("registerForm").addEventListener("submit", (event) => registerUser(event) );
}