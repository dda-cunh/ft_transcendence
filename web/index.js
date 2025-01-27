var canvas = document.querySelector("canvas");
canvas.style.background = "black";
var ctx = canvas.getContext("2d");
var DocHeight, DocWidth;

var dirX = true;
var dirY = true;

var Pad1YPos, Pad2YPos;

var RequestFrame = false;

var Score1 = 0;
var Score2 = 0;

var WKeyState = false;
var SKeyState = false;
var OKeyState = false;
var LKeyState = false;

document.addEventListener("keydown", (e) => 
{
  if (e.key == "w")
  	WKeyState = true;
  if (e.key == "s")
  	SKeyState = true;
  if (e.key == "o" || e.key == "ArrowUp")
  	OKeyState = true;
  if (e.key == "l" || e.key == "ArrowDown")
  	LKeyState = true;

  if (e.key == "Enter") 
  {
    if (!RequestFrame) 
    {
      var ball = new Obj(DocWidth / 2, DocHeight / 2, 10);
      ball.drawBall();
      RequestFrame = true;

      MoveBallLoop(ball);
    }
  }
} );

document.addEventListener("keyup", (e) => 
{
  if (e.key == "w") 
  	WKeyState = false;
  if (e.key == "s") 
  	SKeyState = false;
  if (e.key == "o" || e.key == "ArrowUp") 
  	OKeyState = false;
  if (e.key == "l" || e.key == "ArrowDown") 
  	LKeyState = false;
});

class Obj
{
  constructor(x, y, radius, height) 
  {
    this.color = "white";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.height = height;
    this.speed = 5;
  }

  drawPad() 
  {
    ctx.fillRect(this.x, this.y, this.radius, this.height);
    ctx.fillStyle = this.color;
  }

  drawBall()
  {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  moveBall() 
  {
    if (dirX) this.x += this.speed;
    if (!dirX) this.x -= this.speed;
    if (dirY) this.y += this.speed;
    if (!dirY) this.y -= this.speed;

    if (this.y < 0)
    	dirY = true;
    if (this.y > DocHeight) 
    	dirY = false;

    if (this.x > DocWidth || this.x < 0) 
    {
      if (this.x > DocWidth) Score1++;
      if (this.x < 0) Score2++;

      dirX = GenerateRandomDir();
      dirY = GenerateRandomDir();
      this.x = DocWidth / 2;
      this.y = DocHeight / 2;
      RequestFrame = false;
      ctx.clearRect(0, 0, DocWidth + 100, DocHeight);
      DrawPads(Pad1YPos, Pad2YPos);
      ctx.fillRect(DocWidth / 2 - 5, 0, 10, DocHeight);
      ctx.fillStyle = "white";
      ctx.fill();
      this.drawBall();
    }

    ctx.clearRect(0, 0, DocWidth + 100, DocHeight);
    DrawPads(Pad1YPos, Pad2YPos);
    ctx.fillRect(DocWidth / 2 - 5, 0, 10, DocHeight);
    ctx.fillStyle = "white";
    ctx.fill();
    this.drawBall();
    checkCollision(this.y, this.x);
    document.querySelector("#Player1").innerHTML = Score1;
    document.querySelector("#Player2").innerHTML = Score2;
  }
}

canvasSetup();
window.onresize = canvasSetup;

function canvasSetup()
{
  DocHeight = window.innerHeight;
  DocWidth = window.innerWidth;
  canvas.height = DocHeight;
  canvas.width = DocWidth;

  Pad1YPos = DocHeight / 2;
  Pad2YPos = DocHeight / 2;
  DrawPads(Pad1YPos, Pad2YPos);

  dirX = GenerateRandomDir();
  dirY = GenerateRandomDir();
  var ball = new Obj(DocWidth / 2, DocHeight / 2, 10);
  ball.drawBall();
  ctx.fillRect(DocWidth / 2 - 5, 0, 10, DocHeight);
  ctx.fillStyle = "white";
  ctx.fill();
}

function DrawPads(Pad1YPos, Pad2YPos)
{
  var Pad1 = new Obj(50, Pad1YPos, 25, 100);
  var Pad2 = new Obj(DocWidth - 50 - 25, Pad2YPos, 25, 100);

  Pad1.drawPad();
  Pad2.drawPad();
}

Pad1YPos = DocHeight / 2;
Pad2YPos = DocHeight / 2;
DrawPads(Pad1YPos, Pad2YPos);

var ball = new Obj(DocWidth / 2, DocHeight / 2, 10, 10);
ball.drawBall();

function MoveBallLoop(ball)
{
  if (WKeyState && Pad1YPos > 0) Pad1YPos -= 10;
  if (SKeyState && Pad1YPos < window.innerHeight - 100) Pad1YPos += 10;

  if (OKeyState && Pad2YPos > 0) Pad2YPos -= 10;
  if (LKeyState && Pad2YPos < window.innerHeight - 100) Pad2YPos += 10;

  ball.moveBall();
  if (RequestFrame) {
    requestAnimationFrame( () =>
    {
      MoveBallLoop(ball);
    } );
  }
}

canvas.onClick = () =>
{
  if (!RequestFrame)
  {
    var ball = new Obj(DocWidth / 2, DocHeight / 2, 10);
    ball.drawBall();
    RequestFrame = true;
    MoveBallLoop(ball);
  }
};

function checkCollision(ballY, ballX)
{
  // Left paddle collision
  let leftPadXPos = 50; // Left paddle's X position
  let leftPadWidth = 25;
  let leftPadHeight = 100;

  // Check if the ball is within the left paddle's boundaries
  if (ballX - ball.radius <= leftPadXPos + leftPadWidth &&
    ballY >= Pad1YPos - leftPadHeight / 2 &&
    ballY <= Pad1YPos + leftPadHeight / 2)
  {
    //console.log('Collision with left paddle');
    dirX = true;
  }

  // Right paddle collision
  let rightPadXPos = DocWidth - 50 - leftPadWidth; // Right paddle's X position
  let rightPadWidth = 25;
  let rightPadHeight = 100;

  // Check if the ball is within the right paddle's boundaries
  if (ballX + ball.radius >= rightPadXPos &&
    ballY >= Pad2YPos - rightPadHeight / 2 &&
    ballY <= Pad2YPos + rightPadHeight / 2)
  {
    //console.log('Collision with right paddle');
    dirX = false;
  }

  // Log positions for debugging
  //console.log("Ball X:", ballX, "Ball Y:", ballY);
  //console.log("Left Paddle X:", leftPadXPos, "Right Paddle X:", rightPadXPos);
}

function GenerateRandomDir()
{
  return Boolean(Math.floor(Math.random() * 2));
} 