"use strict"

import { connectWebSocket } from "./socket.js";


function    setupCanvas(canvas, ctx)
{
    //  WHITE LINE AT THE CENTER
    ctx.fillStyle = "white";
    ctx.fillRect( (canvas.width / 2) - ( (canvas.width / 100) / 2), 0, canvas.width / 100, canvas.height);
}

function    renderFrame(canvas, ctx)
{
    //  SCORES
    ctx.font = (canvas.height/16).toString()+ "px serif";
    ctx.fillText("0", (canvas.width / 2) - (canvas.width / 4), canvas.height/16);   //  REPLACE WITH PLAYER SCORE RECEIVED FROM THE BACKEND
    ctx.fillText("0", (canvas.width / 2) + (canvas.width / 4), canvas.height/16);   //  REPLACE WITH PLAYER SCORE RECEIVED FROM THE BACKEND
    //  PADDLES


    //  BALL
}

function    renderGame(canvas, ctx)
{
    setupCanvas(canvas, ctx);

    //  RUN THE FOLLOWING IN AN INFINITE LOOP:
    //  SEND KEYSTROKES TO BACKEND & GET OBJECT POSITIONS
    renderFrame(canvas, ctx);
}
//  THE FUNCTIONS ABOVE WILL BE MOVED TO A DIFFERENT FILE


function    fixDPI(canvas)
{
    let dpi = window.devicePixelRatio;
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);

    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}

function    renderPage()
{
    let transcendenceApp = document.getElementById("mainContainer");
    transcendenceApp.innerHTML = `
        <div class="row">
            <div class="col text-center mt-lg-5">
                <h3>$player1</h3>   <!--REPLACE WITH PLAYER ALIAS RECEIVED FROM THE BACKEND-->
            </div>
            <div class="col text-center mt-lg-5">
                <h3>$player2</h3>   <!--REPLACE WITH PLAYER ALIAS RECEIVED FROM THE BACKEND-->
            </div>
        </div>
        <div class="row">
            <canvas style="background: black;">Game Canvas</canvas><!--BACKGROUND COLOR MUST BE SET WITH GAME SETTINGS-->
        </div>
    `;
    transcendenceApp.style.height = window.innerHeight;
}

export function renderPongGame()
{
    renderPage();

    let canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    fixDPI(canvas);

//  GET INFO FROM BACKEND ON GAME STATUS [PONG MATCH/TOURNAMENT SCOREBOARD]
    renderGame(canvas, ctx);

//  FOR MOBILE DEVICES ONLY
//    alert("For a better experience, please flip your device to landscape view");

}