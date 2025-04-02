window.onload = function () {
  paused = true;
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
let paused = true;

const brickRowCount = 5;
const brickColumnCount = 9;

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};

const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0,
};

const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
  image: new Image(),
};

brickInfo.image.onload = function () {
  initializeBricks();
  draw();
};

brickInfo.image.src = "assets/brick.png";

const bricks = [];

function initializeBricks() {
  for (let i = 0; i < brickColumnCount; i++) {
      bricks[i] = [];
      for (let j = 0; j < brickRowCount; j++) {
          const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
          const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
          bricks[i][j] = { x, y, ...brickInfo };
      }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#fea147";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "#46a240";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "17px SuperMario";
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

function drawHighScore() {
  ctx.font = "17px SuperMario";
  ctx.fillText(
      `High Score: ${localStorage.getItem("score")}`,
      canvas.width - 260,
      30
  );
}

function drawBricks() {
  bricks.forEach((column) => {
      column.forEach((brick) => {
          if (brick.visible) {
              ctx.drawImage(brick.image, brick.x, brick.y, brick.w, brick.h);
          }
      });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawHighScore();
  drawBricks();
}

function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x + paddle.w > canvas.width) {
      paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
      paddle.x = 0;
  }
}

function resetGame() {
  score = 0;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 4;
  ball.dx = 4;
  ball.dy = -4;
  paddle.x = canvas.width / 2 - 40;
  showAllBricks();
  draw();
  paused = true;
  playBtn.disabled = false;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
      ball.dx *= -1;
  }

  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
      ball.dy *= -1;
  }

  if (
      ball.x - ball.size > paddle.x &&
      ball.x + ball.size < paddle.x + paddle.w &&
      ball.y + ball.size > paddle.y
  ) {
      ball.dy = -ball.speed;
  }

  bricks.forEach((column) => {
      column.forEach((brick) => {
          if (brick.visible) {
              if (
                  ball.x - ball.size > brick.x &&
                  ball.x + ball.size < brick.x + brick.w &&
                  ball.y + ball.size > brick.y &&
                  ball.y - ball.size < brick.y + brick.h
              ) {
                  ball.dy *= -1;
                  brick.visible = false;

                  increaseScore();
              }
          }
      });
  });

  if (ball.y + ball.size > canvas.height) {
    paused = true;
      if (localStorage.getItem("score") < score) {
          localStorage.setItem("score", score);
      }
      Swal.fire({
        icon: "error",
        title: "Game over...",
        text: "Try again!",
        customClass: {
          confirmButton: "play-button",
        },
      }).then(() => {
          resetGame();
      });
    }
  }

function increaseScore() {
  score++;

  if (score % (brickRowCount * brickColumnCount) === 0) {
    paused = true;
    Swal.fire({
      icon: "success",
      title: "Congratulations!",
      text: "You won!",
      customClass: {
        confirmButton: "play-button",
      },
    }).then(() => {
        resetGame();
    });
  }
}

function showAllBricks() {
  bricks.forEach((column) => {
      column.forEach((brick) => (brick.visible = true));
  });
}

function update() {
  if (paused === false) {
      movePaddle();
      moveBall();
      draw();
      requestAnimationFrame(update);
  }
}

function playGame() {
  paused = false;
  update();
  playBtn.disabled = true;
}

function keyDown(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    paddle.dx = -paddle.speed;
  }
}

function keyUp(e) {
  if (
      e.key === "Right" ||
      e.key === "ArrowRight" ||
      e.key === "Left" ||
      e.key === "ArrowLeft" ||
      e.key === "a" || e.key === "A" ||
      e.key === "d" || e.key === "D"
  ) {
      paddle.dx = 0;
  }
}

playBtn.addEventListener("click", playGame);

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

playAgainBtn.addEventListener("click", (e) => {
  popup.style.display = "none";
  resetGame();
});
