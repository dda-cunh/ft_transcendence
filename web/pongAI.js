
// Temporary Pong Game
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 10, paddleHeight = 40;
let player1Y = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 4, ballSpeedY = 4;
let player1Speed = 0, player2Speed = 0;
let leftScore = 0, rightScore = 0;

document.addEventListener("keydown", (e) => {
    if (e.key === "w") player1Speed = -5;
    if (e.key === "s") player1Speed = 5;
    if (e.key === "ArrowUp") player2Speed = -5;
    if (e.key === "ArrowDown") player2Speed = 5;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") player1Speed = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player2Speed = 0;
});

function moveBall() {
    player1Y += player1Speed;
    player2Y += player2Speed;
    
    player1Y = Math.max(0, Math.min(canvas.height - paddleHeight, player1Y));
    player2Y = Math.max(0, Math.min(canvas.height - paddleHeight, player2Y));
    
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    if (ballY <= 0 || ballY >= canvas.height) {
        ballSpeedY *= -1;
    }
    
    if (ballX <= paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
        ballSpeedX *= -1;
    }
    
    if (ballX >= canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX *= -1;
    }
    
    if (ballX < 0 || ballX > canvas.width) {
        if (ballX < 0)
        {
            rightScore++;
            document.getElementById('rightScore').innerHTML = rightScore
        }
        else if (ballX > canvas.width)
        {
            leftScore++;
            document.getElementById('leftScore').innerHTML = leftScore
        }
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX *= -1;

        // Needed for the AI to restart calculations after a goal is scored
        lastBall = {x: canvas.width / 2, y: canvas.height / 2}
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight);
    
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
}


// First Draft of Pong AI
// Must receive: canvas.height, canvas.width, balX, ballY, player2Y and paddleHeight

function triggerKeyPress(key) {
    let event = new KeyboardEvent("keydown", { key: key, keyCode: key.charCodeAt(0), which: key.charCodeAt(0), bubbles: true });
    document.dispatchEvent(event);
}

function triggerKeyRelease(key) {
    let event = new KeyboardEvent("keyup", { key: key, keyCode: key.charCodeAt(0), which: key.charCodeAt(0), bubbles: true });
    document.dispatchEvent(event);
}

let lastBall = {x: canvas.width / 2, y: canvas.height / 2}
let nextBall = {x: canvas.width / 2, y: canvas.height / 2}
let startPaddle = canvas.height / 2
let endPaddle = canvas.height / 2
let paddleMovPerSec = 1
let AIballSpeed = 0

function getMovVector(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude === 0) return { dx: 0, dy: 0 };

    return { dx: dx / magnitude, dy: dy / magnitude }
}

function testPaddleMov()
{
    endPaddle = Math.max(0, Math.min(canvas.height - paddleHeight, player2Y))
    paddleMovPerSec += Math.abs(startPaddle - endPaddle)
    startPaddle = endPaddle
    triggerKeyRelease('ArrowUp')
    triggerKeyPress('ArrowDown')
}

function calcPaddleMov()
{
    triggerKeyRelease('ArrowDown')
    endPaddle = Math.max(0, Math.min(canvas.height - paddleHeight, player2Y))
    paddleMovPerSec += Math.abs(startPaddle - endPaddle)
    paddleMovPerSec *= 2
}

triggerKeyPress('ArrowUp')
setTimeout(testPaddleMov, 250)
setTimeout(calcPaddleMov, 500)


function stopPaddle() {
    triggerKeyRelease('ArrowUp')
    triggerKeyRelease('ArrowDown')
}

function moveAIPaddle(hitY)
{
    let toMove = hitY - (player2Y + paddleHeight / 2)
    let moveTime = (toMove * 1000) / paddleMovPerSec
    if (toMove > 0)
        triggerKeyPress('ArrowDown')
    else
    {
        moveTime *= -1
        triggerKeyPress('ArrowUp')
    }
    setTimeout(stopPaddle, moveTime)
}

function hitRightMov(ball, speedX, speedY)
{
    let timeToHitRight = ((canvas.width - ball.x) / speedX);
    let hitY = ball.y + speedY * timeToHitRight;
    if (hitY > paddleHeight && hitY < canvas.height - paddleHeight)
    {
        moveAIPaddle(hitY)
        return 1
    }
    return 0
}

function hitAfterWall(ball, speedX, speedY)
{
    let timeToHitBottom = (canvas.height - ball.y) / speedY;
    let timeToHitTop = -ball.y / speedY;
    let tempX = canvas.width / 2, tempY = canvas.height / 2;
    if (timeToHitBottom >= 0)
    {
        tempX = ball.x + speedX * timeToHitBottom;
        tempY = canvas.height
    }
    else if (timeToHitTop >= 0)
    {
        tempX = ball.x + speedX * timeToHitTop;
        tempY = 0;
    }
    if (tempX != canvas.width / 2 && tempY != canvas.height / 2)
        return {x: tempX, y: tempY}
    return {x: 0, y: 0}
}

setInterval(() => {
    
    let ballMov = getMovVector(lastBall.x, lastBall.y, ballX, ballY)
    if (!AIballSpeed)
        AIballSpeed = Math.sqrt((ballX - lastBall.x) ** 2 + (ballY - lastBall.y) ** 2);
    let AIballSpeedX = ballMov.dx * AIballSpeed;
    let AIballSpeedY = ballMov.dy * AIballSpeed;
    
    if (AIballSpeedX > 0 && lastBall.x > canvas.width * 0.25 && ballX < canvas.width * 0.75)
    {
        if (!hitRightMov({x: ballX, y: ballY}, AIballSpeedX, AIballSpeedY))
        {
            nextBall = hitAfterWall({x: ballX, y: ballY}, AIballSpeedX, AIballSpeedY);
            if (nextBall.x > 0 && !hitRightMov(nextBall, AIballSpeedX, -AIballSpeedY))
            {
                nextBall = hitAfterWall(nextBall, AIballSpeedX, -AIballSpeedY);
                hitRightMov(nextBall, AIballSpeedX, AIballSpeedY)
            }
        }
    }
    lastBall.x = ballX;
    lastBall.y = ballY;
}, 1000);


gameLoop();