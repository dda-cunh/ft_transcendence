import {connectWebSocket} from './socket.js'

"use strict"

function    fixDPI(canvas)
{
    let dpi = window.devicePixelRatio;
    let style_width = 800;
    let style_height = 600;

    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}

function    renderPage()
{
    let transcendenceApp = document.getElementById("mainContainer");
    transcendenceApp.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center">
            <div class="row w-75 h-75 border border-secondary border-hover rounded">
                <div class="col text-center mt-lg-5">
                    <h3 class="pe-none display-3" id="p1">player1</h3>
                </div>
                <div class="col text-center mt-lg-5">
                    <h3 class="pe-none display-2" id="p1_score">0</h3>
                </div>
                <div class="col text-center mt-lg-5">
                    <h3 class="pe-none display-1">-</h3>
                </div>
                <div class="col text-center mt-lg-5">
                    <h3 class="pe-none display-2" id="p2_score">0</h3>
                </div>
                <div class="col text-center mt-lg-5">
                    <h3 class="pe-none display-3" id="p2">player2</h3>
                </div>
            </div>
            <div class="row">
                <canvas id="game-canvas" style="background: black;">Game Canvas</canvas><!--BACKGROUND COLOR MUST BE SET WITH GAME SETTINGS-->
            </div>
        </div>
        <style>
            .border-hover:hover {
                color: var(--bs-light);
                background-color: transparent;
                border-color: var(--bs-light) !important;
            }
        </style>
    `;
    transcendenceApp.style.height = window.innerHeight;
}

export function renderPongGame(gameMode)
{
    document.getElementById("appContainer").innerHTML = "";
    document.getElementById("viewRow").innerHTML = "";
    renderPage();

    let canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    fixDPI(canvas);

    let mode = gameMode === "tournament" ? "tournament" : sessionStorage.getItem("matchType");
    connectWebSocket(mode);
}