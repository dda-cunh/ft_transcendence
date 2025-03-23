import {renderFriends} from './friends.js'

"use strict";


/*
	DATA NEEDED:
		USER NAME
		PLAYER MOTTO
		FRIENDS LIST

		MATCH HISTORY
			GAMES PLAYED/WON/LOSS + TOURNAMENTS
			MATCHES + TOURNAMENTS LIST


	ALL MATCHES + TOURNAMENTS NEED ID
	TOURNAMENT ID 0 IS RESERVED FOR FRIENDLY MATCHES
*/

function	renderPage()
{
	let	transcendenceApp = document.getElementById("appContainer");

	transcendenceApp.innerHTML = `
				<div class="row">
					<div class="col-12 col-lg-3 my-3 mt-lg-0">
						<!--PROFILE PIC-->
<!--
						<img src="" class="img-fluid rounded-circle" alt="User Profile Picture">
-->
					</div>
					<div class="col-12 col-lg-9 d-grid border rounded">
						<div class="row h-auto">
							<div class="col d-flex justify-content-end align-items-start">
								<!--EDIT PROFILE BTN (CHG DISPLAY NAME, CHG MOTTO, CHG PFP)-->
								<button type="button" class="btn btn-sm btn-outline-light mx-2 my-2"><i class="bi-pencil-fill"></i></button>
								<!--SETTINGS BTN (CHG PASSWD, DELETE ACCOUNT)-->
								<button type="button" class="btn btn-sm btn-outline-light my-2"><i class="bi-gear-fill"></i></button>
							</div>
						</div>
						<div class="flex-row flex-fill align-middle">
							<div class="col py-auto d-flex justify-content-center">
								<!--USERNAME-->
								<h1 class="display-1">$USER</h1>
							</div>
						</div>
						<div class="row d-flex align-items-end">
							<div class="col">
								<!--MOTTO-->
								<p class="fst-italic">"Some days you are the pidgeon, some days you are the statue. Today it's clearly statue day."</p>
							</div>
						</div>
					</div>
				</div>
				<div class="row mt-5 border rounded">
					<div class="col-12 col-lg-3 border-end">
						<h1 class="text-center">
							<span>
								<button id="manageFriendsBtn" class="btn btn-sm btn-outline-light"><i class="bi-pencil-fill"></i></button>
							</span>
							FRIENDS LIST
						</h1>
						<div class="position-relative" style="height: 250px; overflow-x: auto;">
							<table class="table table-responsive table-borderless table-hover table-striped table-dark fw-bolder align-middle">
								<tbody>
									<!--FRIENDS LIST-->
								</tbody>
							</table>
						</div>
					</div>
					<div class="col-12 col-lg-9 border-start border-top">
						<h1 class="text-center">MATCH HISTORY</h1>
						<div class="row">
							<div class="col-12 col-lg-3 d-grid border-top">
								<!--MATCH HISTORY (TOTAL GAMES PLAYED/WINS/LOSSES)-->
								<div class="row d-flex my-2 py-2 align-content-center">
									<div class="col-3 col-lg-9 text-wrap align-self-center text-end">
										<small>MATCHES PLAYED</small>
									</div>
									<div class="col-1 col-lg-3 align-self-center text-start">

										<small>7</small>

									</div>
									<div class="col-3 col-lg-9 text-wrap align-self-center text-end">
										<small>WINS</small>
									</div>
									<div class="col-1 col-lg-3 align-self-center text-start">

										<small>5</small>

									</div>
									<div class="col-3 col-lg-9 text-wrap align-self-center text-end">
										<small>LOSSES</small>
									</div>
									<div class="col-1 col-lg-3 align-self-center text-start">

										<small>2</small>

									</div>

								</div>
								<div class="row d-flex my-2 py-2 align-content-center border-top">
									<!--TOURNAMENT HISTORY-->
									<div class="col-5 col-lg-9 text-wrap align-self-center text-end">
										<small>TOURNAMENTS JOINED</small>
									</div>
									<div class="col-1 col-lg-3 align-self-center text-start">

										<small>1</small>

									</div>
									<div class="col-5 col-lg-9 text-wrap align-self-center text-end">
										<small>TOURNAMENTS WON</small>
									</div>
									<div class="col-1 col-lg-3 align-self-center text-start">

										<small>2</small>

									</div>
								</div>
							</div>
							<div class="col-12 col-lg-9 border-top border-start">
								<div class="card bg-dark text-center">
									<div class="card-header mx-auto">
										<ul class="nav nav-tabs card-header-tabs">
											<li class="nav-item">
												<a href="#singleMatchHistory" class="nav-link bg-dark text-light active" data-bs-toggle="tab">1v1</a>
											</li>
											<li class="nav-item">
												<a href="#tournamentHistory" class="nav-link bg-dark text-light" data-bs-toggle="tab">Tournaments</a>
											</li>
										</ul>
									</div>
									<div class="card-body">
										<div class="tab-content">
											<div class="tab-pane fade show active" id="singleMatchHistory">
												<div class="position-relative" style="height: 200px; overflow-x: auto;">
													<table class="table table-responsive table-dark">
														<thead>
															<tr>
																<th>Date</th>
																<th>Opponent</th>
																<th>Game type</th>
																<th>Score</th>
																<th>Result</th>
															</tr>
														</thead>
														<tbody>
															<!--MATCH HISTORY-->
														</tbody>
													</table>
												</div>
											</div>
											<div class="tab-pane fade" id="tournamentHistory">
												<div class="position-relative" style="height: 200px; overflow-x: auto;">
													<table class="table table-responsive table-dark">
														<thead>
															<tr>
																<th>Date</th>
																<th>Game type</th>
																<th>Placement</th>
															</tr>
														</thead>
														<tbody>
															<!--TOURNAMENT HISTORY-->
														</tbody>
													</table>
												</div>
											</div>
										</div>
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
	document.getElementById("manageFriendsBtn").addEventListener("click", () => renderFriends());
}


	/*	MAIN FUNCTION	*/
export function	renderProfile()
{
	localStorage.setItem("currentView", "profile");
	renderPage();
	setupEventHandlers();
}