import {renderProfile} from './profile.js'


"use strict";


/*
	DATA NEEDED:
		FRIENDS LIST

*/


function renderPage()
{
	let	transcendenceApp = document.getElementById("appContainer");

	transcendenceApp.innerHTML = `
			<div class="row">
				<div class="col border rounded">
					<div class="card bg-dark text-center">
						<div class="card-header mx-auto">
							<ul class="nav nav-tabs card-header-tabs">
								<li class="nav-item">
									<a href="#manageFriends" class="nav-link bg-dark text-light active" data-bs-toggle="tab"><small>Manage Friends</small></a>
								</li>
								<li class="nav-item">
									<a href="#friendRequests" class="nav-link bg-dark text-light" data-bs-toggle="tab"><small>Friend Requests</small></a>
								</li>
							</ul>
						</div>
						<div class="card-body" style="height: 415px;">
							<div class="tab-content">
								<!--MANAGE FRIENDS-->
								<div class="tab-pane fade show active" id="manageFriends">
									<div class="position-relative d-grid">
										<table class="table table-responsive table-striped table-dark table-hover table-borderless">
											<tbody style="height: 320px;">
												<!--FRIENDS LIST-->
												<!--SHOW 5 PER PAGE? FILL WITH BLANKS IF N < MAX-->
												<tr>
													<td></td>
												</tr>
												<tr>
													<td></td>
												</tr>
												<tr>
													<td></td>
												</tr>
												<tr>
													<td></td>
												</tr>
												<tr>
													<td></td>
												</tr>
											</tbody>
										</table>
										<div class="row position-relative bottom-0">
											<div class="col">
												<!--PAGINATION-->
												<ul class="pagination d-flex flex-row align-items-end justify-content-center h-100" >
												<!--SAMPLE-->
													<li class="page-item">
														<button type="submit" class="btn btn-outline-light">
															<small>Previous</small>
														</button>
													</li>
													<li class="page-item">
														<button type="submit" class="btn btn-outline-light active">
															<small>1</small>
														</button>
													</li>
													<li class="page-item">
														<button type="submit" class="btn btn-outline-light">
															<small>2</small>
														</button>
													</li>
													<li class="page-item">
														<button type="submit" class="btn btn-outline-light">
															<small>3</small>
														</button>
													</li>
													<li class="page-item">
														<button type="submit" class="btn btn-outline-light">
															<small>Next</small>
														</button>
													</li>
												<!---->
												</ul>
											</div>
										</div>
									</div>
								</div>
								<!--FRIEND REQUESTS-->
								<div class="tab-pane fade" id="friendRequests">
									<div class="position-relative" style="height: 200px;">
											<table class="table table-dark table-responsive table-striped table-hover table-borderless">
												<tbody style="height: 320px;">
													<tr>
														<td></td>
													</tr>
													<tr>
														<td></td>
													</tr>
													<tr>
														<td></td>
													</tr>
													<tr>
														<td></td>
													</tr>
													<tr>
														<td></td>
													</tr>
												</tbody>
											</table>
											<div class="row position-relative bottom-0">
												<div class="col">
													<!--PAGINATION-->
													<ul class="pagination d-flex flex-row align-items-end justify-content-center h-100" >
													<!--SAMPLE-->
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light">
																<small>Previous</small>
															</button>
														</li>
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light active">
																<small>1</small>
															</button>
														</li>
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light">
																<small>2</small>
															</button>
														</li>
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light">
																<small>3</small>
															</button>
														</li>
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light">
																<small>Next</small>
															</button>
														</li>
													<!---->
													</ul>
												</div>
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


export function	renderFriends()
{
	localStorage.setItem("currentView", "friends");
	renderPage();
}