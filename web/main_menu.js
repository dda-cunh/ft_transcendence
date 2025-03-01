"use strict";

function	renderPage()
{
	let	transcendenceApp = document.getElementById("mainContainer");

	transcendenceApp.innerHTML = `
			<nav class="navbar navbar-dark shadow">
				<h3 class="ps-4">TRANSCENDENCE</h3>
				<div class="navbar-nav ms-auto">
					<div class="col">
						<small class="me-2">$username</small>
						<a href="#" class="nav-item nav-link pe-4 text-end">Logout</a>
					</div>
				</div>
			</nav>
			<div class="container mt-4">
				<div class="row text-center justify-content-center">
					<div class="col-12 col-lg-5 mx-lg-1 mt-4 border">
						<div class="row">
							<div class="col-12">
								<h1 class="mt-4">PLAY PONG</h1>
							</div>
						</div>
						<div class="row py-3 my-5 justify-content-center">
							<div class="col-8 col-lg-6 d-grid gap-3 my-5">
								<button type="button" class="btn btn-lg btn-primary fw-bolder">FRIENDLY MATCH</button>
								<button type="button" class="btn btn-lg btn-danger fw-bolder">TOURNAMENT</button>
							</div>
						</div>
					</div>
					<div class="col-12 col-lg-5 mx-lg-1 mt-4 px-5 border">
						<h1 class="mt-4">SETTINGS</h1>
						<div class="row my-1 justify-content-center">
							<div class="col col-lg-10 mt-4">
								<h3>GAMEPLAY</h3>
								<div class="input-group py-1">
									<label class="input-group-text bg-dark text-light w-50 text-wrap">Match Type</label>
									<select class="form-select bg-dark text-light text-center">
										<option selected>Single Player</option>
										<option>Local Multiplayer</option>
										<option>Online Multiplayer</option>
									</select>
								</div>
								<div class="input-group py-1">
									<label class="input-group-text bg-dark text-light w-50 text-wrap">Game Type</label>
									<select class="form-select bg-dark text-light text-center">
										<option selected>Original</option>
										<option>Enhanced</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row mt-3 mb-4 justify-content-center">
							<div class="col col-lg-10">
								<h3>VISUALS</h3>
								<div class="input-group py-1">
									<label class="input-group-text bg-dark text-light w-50 text-wrap">Paddle Color</label>
									<select class="form-select bg-dark text-light text-center">
										<option selected>White</option>
										<option>Yellow</option>
										<option>Red</option>
									</select>
								</div>
								<div class="input-group py-1">
									<label class="input-group-text bg-dark text-light w-50 text-wrap">Ball Color</label>
									<select class="form-select bg-dark text-light text-center">
										<option selected>White</option>
										<option>Yellow</option>
										<option>Red</option>
									</select>
								</div>
								<div class="input-group py-1 pb-2">
									<label class="input-group-text bg-dark text-light w-50 text-wrap">Background Color</label>
									<select class="form-select bg-dark text-light text-center">
										<option selected>Black</option>
										<option>Blue</option>
										<option>Purple</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
	`;
}

export function	renderMainMenu()
{
	renderPage();
}