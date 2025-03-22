import {renderProfile} from './profile.js'


"use strict";


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
									<a href="#manageFriends" class="nav-link bg-dark text-light active" data-bs-toggle="tab">Manage Friends</a>
								</li>
								<li class="nav-item">
									<a href="#addFriends" class="nav-link bg-dark text-light" data-bs-toggle="tab">Add Friends</a>
								</li>
							</ul>
						</div>
						<div class="card-body" style="height: 415px;">
							<div class="tab-content">
								<!--MANAGE FRIENDS-->
								<div class="tab-pane fade show active" id="manageFriends">
									<div class="position-relative d-grid">
										<table class="table table-responsive table-striped table-dark">
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
										<div class="row">
											<div class="col border">
												<!--PAGINATION-->
												<ul class="pagination border" >
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
								<!--ADD FRIENDS-->
								<div class="tab-pane fade" id="addFriends">
									<div class="position-relative" style="height: 200px;">
											<table class="table table-responsive table-striped">
												<thead>
													<!--SEARCH BAR-->
													<div class="row justify-content-center">
														<div class="col-md-7">
															<!--MAKE THIS SMALLER-->
															<div class="input-group">
																<span class="input-group-text">
																	<button type="submit" class="btn">
																		<span class="bi-search"></span>
																	</button>
																</span>
																<input type="text" class="form-control" placeholder="Search...">
															</div>
															<!---->
														</div>
													</div>
												</thead>
												<tbody>
													<!--SEARCH RESULTS-->
												</tbody>
												<tfoot>
													<!--PAGINATION-->
													<ul class="pagination border" >
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light">
																<small>Previous</small>
															</button>
														</li>
														<!--ADD NUM ITEMS WITH JS-->
														<li class="page-item">
															<button type="submit" class="btn btn-outline-light">
																<small>Next</small>
															</button>
														</li>
													</ul>
												</tfoot>
											</table>
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
	renderPage();
}