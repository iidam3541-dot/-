// Game constants
const CANVAS = document.getElementById('pongCanvas');
const CTX = CANVAS.getContext('2d');

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 7;
const BALL_SPEED = 5;
const PADDLE_SPEED = 6;
const AI_SPEED = 4.5;

// Game objects
const player = {
    x: 10,
    y: CANVAS.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const computer = {
    x: CANVAS.width - PADDLE_WIDTH - 10,
    y: CANVAS.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const ball = {
    x: CANVAS.width / 2,
    y: CANVAS.height / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    speed: BALL_SPEED
};

// Game state
let gameRunning = false;
let mouseY = CANVAS.height / 2;
const keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        if (gameRunning && ball.dx === 0) {
            resetBall();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = CANVAS.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Reset ball to center with random direction
function resetBall() {
    ball.x = CANVAS.width / 2;
    ball.y = CANVAS.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
    ball.dy = (Math.random() - 0.5) * BALL_SPEED * 2;
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Player paddle movement (mouse)
    player.y = Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, CANVAS.height - PADDLE_HEIGHT));

    // Player paddle movement (arrow keys)
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - PADDLE_SPEED);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(CANVAS.height - PADDLE_HEIGHT, player.y + PADDLE_SPEED);
    }

    // Computer AI - follows ball with some lag
    const computerCenter = computer.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    const aiThreshold = 35; // Dead zone for AI

    if (ballCenter < computerCenter - aiThreshold) {
        computer.y = Math.max(0, computer.y - AI_SPEED);
    } else if (ballCenter > computerCenter + aiThreshold) {
        computer.y = Math.min(CANVAS.height - PADDLE_HEIGHT, computer.y + AI_SPEED);
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > CANVAS.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(CANVAS.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height &&
        ball.dx < 0
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on paddle position
        const collidePoint = ball.y - (player.y + PADDLE_HEIGHT / 2);
        ball.dy = (collidePoint / (PADDLE_HEIGHT / 2)) * ball.speed;
        
        // Increase ball speed slightly on each hit (max limit)
        ball.speed = Math.min(ball.speed + 0.2, 8);
        ball.dx = Math.abs(ball.dx) * (ball.speed / BALL_SPEED);
    }

    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height &&
        ball.dx > 0
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on paddle position
        const collidePoint = ball.y - (computer.y + PADDLE_HEIGHT / 2);
        ball.dy = (collidePoint / (PADDLE_HEIGHT / 2)) * ball.speed;
        
        // Increase ball speed slightly on each hit (max limit)
        ball.speed = Math.min(ball.speed + 0.2, 8);
        ball.dx = -Math.abs(ball.dx) * (ball.speed / BALL_SPEED);
    }

    // Ball out of bounds - score update
    if (ball.x < 0) {
        computer.score++;
        updateScore();
        resetBall();
        gameRunning = false;
    }

    if (ball.x > CANVAS.width) {
        player.score++;
        updateScore();
        resetBall();
        gameRunning = false;
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw game
function draw() {
    // Clear canvas
    CTX.fillStyle = '#000';
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    // Draw center line (dashed)
    CTX.strokeStyle = '#00ff00';
    CTX.setLineDash([5, 5]);
    CTX.lineWidth = 2;
    CTX.beginPath();
    CTX.moveTo(CANVAS.width / 2, 0);
    CTX.lineTo(CANVAS.width / 2, CANVAS.height);
    CTX.stroke();
    CTX.setLineDash([]);

    // Draw paddles
    CTX.fillStyle = '#00ff00';
    CTX.fillRect(player.x, player.y, player.width, player.height);
    CTX.fillRect(computer.x, computer.y, computer.width, computer.height);

    // Draw ball
    CTX.fillStyle = '#00ff00';
    CTX.beginPath();
    CTX.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    CTX.fill();

    // Draw glow effect on ball
    CTX.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    CTX.lineWidth = 2;
    CTX.beginPath();
    CTX.arc(ball.x, ball.y, ball.size + 3, 0, Math.PI * 2);
    CTX.stroke();

    // Draw game status
    if (!gameRunning) {
        CTX.fillStyle = 'rgba(0, 0, 0, 0.7)';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        CTX.fillStyle = '#00ff00';
        CTX.font = 'bold 24px Arial';
        CTX.textAlign = 'center';
        CTX.textBaseline = 'middle';
        CTX.fillText('Press SPACE to Start', CANVAS.width / 2, CANVAS.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
