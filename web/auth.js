import {renderMainMenu} from './main_menu.js'

"use strict";


async function	registerUser()
{
	let	user = document.getElementById("registerUserField").value;
	let passwd = document.getElementById("registerPasswordField").value;
	let confirmPasswd = document.getElementById("confirmPasswordField").value;

	try
	{
		if (user === "" || passwd === "")
			throw new Error("No empty creds allowed.");
		if (passwd !== confirmPasswd)
			throw new Error("Password mismatch.");

		let creds = {
			username: user,
			password: passwd,
		};

		let	response = await fetch("./auth", {
			method: "POST",
			host: "auth",
			headers: {
				"Content-Type": "application/json; charset=UTF-8",
			},
			body: JSON.stringify(creds),
		} );
		console.log(response);
		
		renderMainMenu();
	}
	catch (error)
	{
		alert(error.message);	//	PRETTIFY THIS
	}
}


function	renderPage()
{
	let transcendenceApp = document.getElementById("mainContainer");
	transcendenceApp.innerHTML = `
			<div class="row">
				<div class="col">
					<h1 class="text-center">TRANSCENDENCE</h1>
				</div>
			</div>
			<div class="row">
				<div class="col">
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
										<form>
											<div class="input-group">
												<span class="input-group-text">
													<span class="bi-person"></span>
												</span>
												<input type="text" class="form-control" id="user" placeholder="Username">
											</div>
											<div class="input-group mt-1">
												<span class="input-group-text">
													<span class="bi-asterisk"></span>
												</span>
												<input type="password" class="form-control" id="password" placeholder="Password">
											</div>
											<button type="submit" class="btn btn-primary mt-2">Login</button>
										</form>
									</div>
								</div>
								<div class="tab-pane fade" id="signup">
									<div class="col-7 col-lg-3 mx-auto">
										<form>
											<div class="input-group">
												<span class="input-group-text">
													<span class="bi-person"></span>
												</span>
												<input id="registerUserField" type="text" class="form-control" id="registerUser" placeholder="Username">
											</div>
											<div class="input-group mt-1">
												<span class="input-group-text">
													<span class="bi-asterisk"></span>
												</span>
												<input id="registerPasswordField" type="password" class="form-control" id="registerPassword" placeholder="Password">
											</div>
											<div class="input-group mt-1">
												<span class="input-group-text">
													<span class="bi-asterisk"></span>
												</span>
												<input id="confirmPasswordField" type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password">
											</div>
											<button id="signupBtn" type="submit" class="btn btn-success mt-2">Register</button>
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

export function	renderAuth()
{
	renderPage();
	document.getElementById("signupBtn").onclick = registerUser;
}