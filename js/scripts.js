// Get DOM Elements
window.onload = function () {
  paused = false;
  playBtn.disabled = false;
};

const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const playBtn = document.getElementById("play-btn");
const playAgainBtn = document.getElementById("play-button");
const popup = document.getElementById("popup-container");
const finalMessage = document.getElementById("final-message");
const rules = document.getElementById("rules");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let score = 0;
let highScore = localStorage.getItem("score");
let paused = false;

// Bricks
const brickRowCount = 5;
const brickColumnCount = 9;

// Create Ball props
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};

// Create Paddle props
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0,
};

// Create Brick Props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

// Create Bricks
const bricks = [];
for (let i = 0; i < brickColumnCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickRowCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

console.log(bricks);

// Draw Ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#e65100";
  ctx.fill();
  ctx.closePath();
}

// Draw Paddle on Canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#512da8";
  ctx.fill();
  ctx.closePath();
}

// Draw Score on canvas
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

// Draw High Score
function drawHighScore() {
  ctx.font = "20px Arial";
  ctx.fillText(
    `High Score: ${localStorage.getItem("score")}`,
    canvas.width - 260,
    30
  );
}

// Draw Bricks on canvas
function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? "#BC4A3C" : "transparent";
      ctx.fill();
      ctx.closePath();
    });
  });
}

// Draw Everything Together
function draw() {
  // Clear Canvas First
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawHighScore();
  drawBricks();
}

// Move Paddle on Canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // Wall Detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

// Move Ball on Canvas
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision(X Axis-Right/Left Walls)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1; //Reverse the direction of ball movement
  }

  // Wall Collision(Y Axis - Top/Bottom Walls)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1; //Reverse the direction of the ball movement
  }

  // Paddle Collision
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
  }

  // Brick Collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x && //left brick side checking
          ball.x + ball.size < brick.x + brick.w && // right brick side checking
          ball.y + ball.size > brick.y && //top brick side checking
          ball.y - ball.size < brick.y + brick.h //bottom brick side checking
        ) {
          ball.dy *= -1; //Reverse the direction of ball so collide to brick
          brick.visible = false; //Make Bricks disappear

          // Increase the score for each brick Collision
          increaseScore();
        }
      }
    });
  });

  // Hit Bottom Wall - Lose
  if (ball.y + ball.size > canvas.height) {
    if (localStorage.getItem("score") < score) {
      localStorage.setItem("score", score);
    }
    finalMessage.innerText = "Game Over";
    popup.style.display = "flex";
    paused = true;
    highscore = localStorage.getItem("score");
    showAllBricks();
    score = 0;
    ball.speed = 0;
  }
}

// Increase Score
function increaseScore() {
  score++;

  if (score % (brickRowCount * brickColumnCount) === 0) {
    finalMessage.innerText = "Congratulations! You Won! 🤩";
    popup.style.display = "flex";
    paused = true;
    showAllBricks();
  }
}

// Make All Bricks Appear
function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// Update Canvas and redraw canvas for every animation
function update() {
  movePaddle();
  moveBall();

  // Draw Everything
  draw();

  if (paused === false) {
    requestAnimationFrame(update);
  }
}

draw();
// Start the game on clicking play
function playGame() {
  paused = false;
  update();
  playBtn.disabled = true;
}

// KeyDown event
function keyDown(e) {
  console.log(e.key);
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}

// Keyup event
function keyUp(e) {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
}

// Start Game on clicking play
playBtn.addEventListener("click", playGame);

// Keyboard Event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);



// Restart game and play again
playAgainBtn.addEventListener("click", (e) => {
  popup.style.display = "none";
  window.location.reload();
});
