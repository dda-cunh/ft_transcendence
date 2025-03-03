"use strict"

function    fixDPI(canvas)
{
    let dpi = window.devicePixelRatio;
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);

    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}

function    setupCanvas(canvas, ctx)
{
    //  WHITE LINE AT THE CENTER
    ctx.fillStyle = "white";
    ctx.fillRect( (canvas.width / 2) - ( (canvas.width / 100) / 2), 0, canvas.width / 100, canvas.height);

    //  SCORES
    ctx.font = (canvas.height/16).toString()+ "px serif";
    ctx.fillText("0", (canvas.width / 2) - (canvas.width / 4), canvas.height/16);
    ctx.fillText("0", (canvas.width / 2) + (canvas.width / 4), canvas.height/16);
    //  PADDLES


    //  BALL
}

function    renderGame()
{
    let canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    fixDPI(canvas);
    setupCanvas(canvas, ctx);
}
//  THE FUNCTIONS ABOVE WILL BE MOVED TO A DIFFERENT FILE

function    renderPage()
{
    let transcendenceApp = document.getElementById("mainContainer");
    transcendenceApp.innerHTML = `
        <div class="row">
            <div class="col text-center mt-lg-5">
                <h3>$player1</h3>
            </div>
            <div class="col text-center mt-lg-5">
                <h3>$player2</h3>
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
    renderGame();
}