// Constants
const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;
const GROUND_HEIGHT = 100;
const MARSHMALLOW_SIZE = 50;
const OBSTACLE_SIZE = 40;
const GRAVITY = 1;
const JUMP_STRENGTH = -20;
const GAME_SPEED = 5;

// Colors
const WHITE = "#FFFFFF";
const PINK = "#FFC0CB";
const BROWN = "#8B4513";
const BLUE = "#87CEEB";

// Set up the display
const canvas = document.createElement('canvas');
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let lastTime = 0;

class Dangles {
    constructor() {
        this.x = 100;
        this.y = WINDOW_HEIGHT - GROUND_HEIGHT - MARSHMALLOW_SIZE;
        this.velocity = 0;
        this.isJumping = false;
    }

    jump() {
        if (!this.isJumping) {
            this.velocity = JUMP_STRENGTH;
            this.isJumping = true;
        }
    }

    update() {
        // Apply gravity
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // Ground collision
        if (this.y > WINDOW_HEIGHT - GROUND_HEIGHT - MARSHMALLOW_SIZE) {
            this.y = WINDOW_HEIGHT - GROUND_HEIGHT - MARSHMALLOW_SIZE;
            this.velocity = 0;
            this.isJumping = false;
        }
    }

    draw() {
        // Draw Dangles body
        ctx.beginPath();
        ctx.arc(this.x, this.y, MARSHMALLOW_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = WHITE;
        ctx.fill();
        ctx.closePath();
        // Draw Dangles face
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - 5, 5, 0, Math.PI * 2); // Left eye
        ctx.arc(this.x + 10, this.y - 5, 5, 0, Math.PI * 2); // Right eye
        ctx.fillStyle = PINK;
        ctx.fill();
        ctx.closePath();
        // Draw smile
        ctx.beginPath();
        ctx.arc(this.x, this.y + 5, 15, 0, Math.PI, false);
        ctx.lineWidth = 2;
        ctx.strokeStyle = PINK;
        ctx.stroke();
        ctx.closePath();
    }
}

class Obstacle {
    constructor() {
        this.x = WINDOW_WIDTH;
        this.y = WINDOW_HEIGHT - GROUND_HEIGHT - OBSTACLE_SIZE;
        this.width = OBSTACLE_SIZE;
        this.height = OBSTACLE_SIZE;
    }

    update() {
        this.x -= GAME_SPEED;
    }

    draw() {
        ctx.fillStyle = BROWN;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

let dangles = new Dangles();
let obstacles = [];
let score = 0;
let gameOver = false;

function drawGround() {
    ctx.fillStyle = BROWN;
    ctx.fillRect(0, WINDOW_HEIGHT - GROUND_HEIGHT, WINDOW_WIDTH, GROUND_HEIGHT);
}

function drawScore() {
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    ctx.fillText(`Score: ${score}`, 10, 40);
}

function drawGameOver() {
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    ctx.fillText('Game Over! Press ESC to quit', WINDOW_WIDTH / 2 - 200, WINDOW_HEIGHT / 2);
}

function gameLoop(timestamp) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    drawGround();
    dangles.update();
    dangles.draw();

    // Generate obstacles
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < WINDOW_WIDTH - 300) {
        obstacles.push(new Obstacle());
    }

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();
        if (obstacles[i].x < -OBSTACLE_SIZE) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    // Collision detection
    for (let obstacle of obstacles) {
        if (
            dangles.x + MARSHMALLOW_SIZE > obstacle.x &&
            dangles.x < obstacle.x + OBSTACLE_SIZE &&
            dangles.y + MARSHMALLOW_SIZE > obstacle.y
        ) {
            gameOver = true;
        }
    }

    drawScore();
    if (gameOver) {
        drawGameOver();
        return;
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space' && !gameOver) {
        dangles.jump();
    }
    if (event.code === 'Escape') {
        window.close();
    }
});

requestAnimationFrame(gameLoop);