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
								<div class="col-7 col-lg-3 mx-auto">
									<form id="changeMottoForm">
										<div class="input-group my-2">
											<span class="input-group-text">
												<span class="bi-person-fill"></span>
											</span>
											<input id="newMottoField" type="text" class="form-control" placeholder="New Motto">
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


function	setupEventHandlers()
{
	document.getElementById("changeUsernameForm").addEventListener("submit", (event) => alert("This feature has not been implemented yet") );
	document.getElementById("changeMottoForm").addEventListener("submit", (event) => alert("This feature has not been implemented yet") );
	document.getElementById("changePfpForm").addEventListener("submit", (event) => alert("This feature has not been implemented yet") );

	document.getElementById("pfpUploadBtn").addEventListener("click", (event) => alert("This feature has not been implemented yet") );
}


export function	renderEditProfile()
{
	localStorage.setItem("currentView", "editProfile");
	renderPage();
	setupEventHandlers();
}