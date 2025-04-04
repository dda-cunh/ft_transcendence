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
								<a href="#chgPasswd" class="nav-link bg-dark text-light active" data-bs-toggle="tab">Change Password</a>
							</li>
							<li class="nav-item">
								<a href="#deleteAcct" class="nav-link bg-dark text-light" data-bs-toggle="tab">Delete Account</a>
							</li>
						</ul>
					</div>
					<div class="card-body">
						<div class="tab-content">
							<div class="tab-pane fade show active" id="chgPasswd">
								<div class="col-7 col-lg-3 mx-auto">
									<form id="chgPasswdForm">
										<!--OLD PASSWORD-->
										<div class="input-group my-2">
											<span class="input-group-text">
												<span class="bi-lock-fill"></span>
											</span>
											<input id="oldPasswordField" type="password" class="form-control" placeholder="Old Password">
										</div>
										<!--NEW PASSWORD-->
										<div class="input-group my-2">
											<span class="input-group-text">
												<span class="bi-lock-fill"></span>
											</span>		
											<input id="newPasswordField" type="password" class="form-control" placeholder="New Password">
										</div>
										<!--CONFIRM NEW PASSWORD-->
										<div class="input-group my-2">
											<span class="input-group-text">
												<span class="bi-lock-fill"></span>
											</span>
											<input id="confirmPasswordField" type="password" class="form-control" placeholder="Confirm New Password">
										</div>
										<button type="submit" class="btn btn-outline-light mt-2">Confirm</button>
									</form>
								</div>
							</div>
							<div class="tab-pane fade" id="deleteAcct">
								<div class="col-7 col-lg-3 mx-auto">
									<form id="deleteAcctForm">
										<div class="input-group my-2">
											<span class="input-group-text">
												<span class="bi-lock-fill"></span>
											</span>
											<input id="confirmDeletePasswd" type="password" class="form-control" placeholder="Password">
										</div>
										<button type="submit" class="btn btn-outline-danger mt-2">Confirm Deletion</button>
									</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
	`
}

async function	getUserName()
{
	let response = await fetch("management/management/user/", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + localStorage.getItem("access"),
		}
	});

//	console.log(await response.json());
	return (await response.json());
}


async function	chgPassword(event)
{
	let errField;
	let errMsg = document.getElementById("errMsg");
	if (errMsg !== null)
		errMsg.remove();

	let creds = {
		username: (await getUserName()).username,
		password: document.getElementById("oldPasswordField").value,
	};

//	console.log(creds);
	try
	{
		if (document.getElementById("newPasswordField").value !== document.getElementById("confirmPasswordField").value)
		{
			errField = "confirmPasswordField";
			throw new Error("Password mismatch.");
		}

		let response = await fetch("auth/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(creds),
		} );

		//	THROW ERROR IF RESPONSE IS NOT OK; ELSE REFRESH PAGE

		if (!response.ok)
			throw new Error("wrong creds");

		let responseData = await response.json();
		localStorage.setItem("access", responseData.access);
		localStorage.setItem("refresh", responseData.refresh);

		//	SEND REQUEST TO CHANGE PASSWORD

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

function	deleteAccount(event)
{
	alert("This feature has not been implemented yet");
}

function	setupEventHandlers()
{
	document.getElementById("chgPasswdForm").addEventListener("submit", (event) => chgPassword(event) );
	document.getElementById("deleteAcctForm").addEventListener("submit", (event) => deleteAccount(event) );
}


export function	renderAcctSettings()
{
	localStorage.setItem("currentView", "accountSettings");
	renderPage();
	setupEventHandlers();
}