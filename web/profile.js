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
	let	transcendenceApp = document.getElementById("ctrlsRow");

	transcendenceApp.innerHTML = `
			<div class="col-12 col-lg-4 my-2 border rounded">
				<h1 class="text-center mt-4">
					<span>
						<button id="manageFriendsBtn" class="btn btn-sm btn-outline-light"><i class="bi-pencil-fill"></i></button>
					</span>
					FRIENDS LIST
				</h1>
				<div class="position-relative" style="height: 250px; overflow-x: auto;">
					<table class="table table-responsive table-borderless table-hover table-striped table-dark fw-bolder align-middle">
						<tbody id="friendsList">
							<!--FRIENDS LIST-->
						</tbody>
					</table>
				</div>
			</div>
			<div class="col-12 col-lg-6 my-2 border rounded">
				<h1 class="text-center mt-4">MATCH HISTORY</h1>
				<div class="row">
					<div class="col-12 d-grid border-top">
						<!--MATCH STATS (TOTAL GAMES PLAYED/WINS/LOSSES)-->
						<div class="row d-flex my-2 py-2 align-content-center">
							<div class="col-3 col-lg-3 text-wrap align-self-center text-end">
								<small>MATCHES PLAYED</small>
							</div>
							<div class="col-1 col-lg-1 align-self-center text-start">

								<small>7</small>

							</div>
							<div class="col-3 col-lg-3 text-wrap align-self-center text-end">
								<small>WINS</small>
							</div>
							<div class="col-1 col-lg-1 align-self-center text-start">

								<small>5</small>

							</div>
							<div class="col-3 col-lg-3 text-wrap align-self-center text-end">
								<small>LOSSES</small>
							</div>
							<div class="col-1 col-lg-1 align-self-center text-start">

								<small>2</small>

							</div>

						</div>
						<!--TOURNAMENT STATS-->
						<div class="row d-flex my-2 py-2 align-content-center border-top border-bottom">
							<div class="col-5 col-lg-4 text-wrap align-self-center text-end">
								<small>TOURNAMENTS JOINED</small>
							</div>
							<div class="col-1 col-lg-2 align-self-center text-start">

								<small>1</small>

							</div>
							<div class="col-5 col-lg-4 text-wrap align-self-center text-end">
								<small>TOURNAMENTS WON</small>
							</div>
							<div class="col-1 col-lg-2 align-self-center text-start">

								<small>2</small>

							</div>
						</div>
					</div>
					<!--MATCH HISTORY-->
					<div class="col-12 border-top border-start">
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
	`
}

/*	GET FRIENDS LIST	*/
export async function renderFriendsList()
{
	try
	{
		let	response = await fetch("management/management/friends", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + localStorage.getItem("access"),
			},
		} );

		if (!response.ok)
			return

		let dest = document.querySelector("#friendsList");
		if (!dest)
			return
		let data = await response.json();
		data.forEach(entry => {
            let row = `<tr class="m-0 p-0 w-100 d-flex flex-row align-items-center justify-content-around border-top">
				<td class="d-flex flex-column"><img height="75px" class="rounded-circle" src="/management/media/${entry.avatar}" alt="${entry.username}'s avatar" /></td>
				<td class="d-flex flex-column">${entry.username}</td>
            </tr>`;
            dest.innerHTML += row;
        });
	}
	catch(error)
	{
		alert(error)
	}
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
	renderFriendsList();
	setupEventHandlers();
}