"use strict";


function	renderPage()
{
	let	transcendenceApp = document.getElementById("ctrlsRow");

	transcendenceApp.innerHTML = `
			<div class="col-12 col-lg-10 my-2 border rounded">
				<div class="card bg-dark text-center">
					<div class="card-header mx-auto">
						<ul class="nav nav-tabs card-header-tabs">
							<li class="nav-item">
								<a href="#changeUsername" class="nav-link bg-dark text-light active" data-bs-toggle="tab">Change Username</a>
							</li>
							<li class="nav-item">
								<a href="#changeMotto" class="nav-link bg-dark text-light" data-bs-toggle="tab">Change Motto</a>
							</li>
							<li class="nav-item">
								<a href="#changePfp" class="nav-link bg-dark text-light" data-bs-toggle="tab">Change Profile Picture</a>
							</li>
						</ul>
					</div>
					<div class="card-body">
						<div class="tab-content">
							<!--CHANGE USERNAME-->
							<div class="tab-pane fade show active" id="changeUsername">
								<div class="col-7 col-lg-3 mx-auto">
									<form id="changeUsernameForm">
										<div class="input-group my-2">
											<span class="input-group-text">
												<span class="bi-person-fill"></span>
											</span>
											<input id="newUserField" type="text" class="form-control" placeholder="New Username">
										</div>
										<button type="submit" class="btn btn-outline-light mt-2">Confirm</button>
									</form>
								</div>
							</div>
							<!--CHANGE MOTTO-->
							<div class="tab-pane fade" id="changeMotto">
								<div class="col-7 mx-auto">
									<form id="changeMottoForm">
										<div class="input-group my-2">
											<textarea id="newMottoField" type="text" class="form-control" placeholder="New Motto"></textarea>
										</div>
										<button type="submit" class="btn btn-outline-light mt-2">Confirm</button>
									</form>
								</div>
							</div>
							<!--CHANGE PFP-->
							<div class="tab-pane fade" id="changePfp">
								<div class="col-7 col-lg-3 gap-2 mx-auto">
									<form id="changePfpForm">
										<div class="my-2 d-grid">
											<button id="pfpUploadBtn" type="button" class="btn btn-light text-start">												
												<span class="bi-upload"></span>
												&ensp;&ensp;Browse... <!--REPLACE WITH PATH-->
											</button>
										</div>
										<button type="submit" class="btn btn-outline-light mt-2">Confirm</button>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
	`
}


async function	chgUserName(event)
{
	let newUserField = document.getElementById("newUserField");

	try
	{
		if (!newUserField.value)
			throw new Error("This field cannot be empty.");

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

		await fetch("management/profile/motto/", 
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Bearer " + localStorage.getItem("access"),
						},
						body: JSON.stringify({"motto": newMottoField.value}),
					}
		);

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


function	setupEventHandlers()
{
	document.getElementById("changeUsernameForm").addEventListener("submit", (event) => chgUserName(event) );
	document.getElementById("changeMottoForm").addEventListener("submit", (event) => chgMotto(event) );
	document.getElementById("changePfpForm").addEventListener("submit", (event) => alert("This feature has not been implemented yet") );

	document.getElementById("pfpUploadBtn").addEventListener("click", (event) => alert("This feature has not been implemented yet") );
}


export function	renderEditProfile()
{
	localStorage.setItem("currentView", "editProfile");
	renderPage();
	setupEventHandlers();
}