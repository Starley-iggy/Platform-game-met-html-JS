const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.8;
const JUMP_SPEED = -23;
const MOVE_SPEED = 5;
const TIMER_INTERVAL = 1000; // 1 second
const INITIAL_LIVES = 3;
const INITIAL_TIME = 30;
const POWERUP_TIME_INCREASE = 10; // Increase time by 10 seconds

const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover',
    LEVEL_COMPLETE: 'levelcomplete'
};

class Player {
    constructor() {
        this.width = 20;
        this.height = 30; 
        this.x = 100; // Spawn at the bottom left
        this.y = canvas.height - this.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.lives = INITIAL_LIVES; // Start with 3 lives
        this.color = '#4444ff';
    }

    update(platforms, goal, spikes, powerUp) {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Prevent going below the ground
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
        }

        // Simple left-right movement
        if (this.moveLeft) this.x -= MOVE_SPEED;
        if (this.moveRight) this.x += MOVE_SPEED;

        // Check platform collisions
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + platform.height) {
                this.y = platform.y - this.height;
                this.velocityY = 0;
            }
        });

        // Prevent going out of bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Check goal collision
        if (this.x < goal.x + goal.width &&
            this.x + this.width > goal.x &&
            this.y < goal.y + goal.height &&
            this.y + this.height > goal.y) {
            return 'goal'; // Reached goal
        }

        // Check spike collisions
        for (let spike of spikes) {
            if (this.x < spike.x + spike.width &&
                this.x + this.width > spike.x &&
                this.y < spike.y + spike.height &&
                this.y + this.height > spike.y) {
                if (this.lives > 0) {
                    this.lives--; // Lose a life
                }

                // If lives <= 0, return 'gameover' to trigger game over
                if (this.lives <= 0) {
                    return 'gameover';
                }

                this.reset(); // Reset player position after death
                break; // Exit the loop once the first spike collision is handled
            }
        }

        // Check power-up collision
        if (powerUp && this.x < powerUp.x + powerUp.width &&
            this.x + this.width > powerUp.x &&
            this.y < powerUp.y + powerUp.height &&
            this.y + this.height > powerUp.y) {
            return 'powerup'; // Collected power-up
        }

        return null; // No collision with goal, spikes, or power-up
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.x = 100; // Reset position
        this.y = canvas.height - this.height; // Reset position
        this.velocityY = 0; // Reset vertical velocity
        this.moveLeft = false;
        this.moveRight = false;
    }

    resetLives() {
        this.lives = INITIAL_LIVES; // Reset lives to 3
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
    }

    draw() {
        ctx.fillStyle = '#ffd700'; // Gold color for the goal
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Spike {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
    }

    draw() {
        ctx.fillStyle = '#ff0000'; // Red color for spikes
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// New PowerUp Class
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = '#00FFFF'; // Cyan color for power-up
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor() {
        this.state = GameState.MENU;
        this.currentLevel = 0;
        this.player = new Player();
        this.levelData = this.createLevelData();
        this.platforms = [];
        this.goal = null;
        this.spikes = [];
        this.powerUp = null; // Initialize power-up
        this.timer = INITIAL_TIME; // Set to 30 seconds
        this.timerInterval = null;

        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('showInstructions').addEventListener('click', () => this.showInstructions());
        document.getElementById('closeInstructions').addEventListener('click', () => this.hideInstructions());
        document.getElementById('exitGame').addEventListener('click', () => window.close());

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    createLevelData() {
        return [
            {
                platforms: [new Platform(200, 400, 200, 20), new Platform(400, 300, 200, 20)],
                goal: new Goal(700, 350),
                spikes: [new Spike(250, 380), new Spike(450, 280)],
                powerUp: new PowerUp(350, 380) // Add power-up position
            },
            {
                platforms: [new Platform(100, 450, 300, 20), new Platform(500, 250, 300, 20)],
                goal: new Goal(700, 200),
                spikes: [new Spike(300, 420), new Spike(600, 220)],
                powerUp: new PowerUp(400, 200) // Add power-up position
            },
            {
                platforms: [new Platform(0, 550, 800, 20), new Platform(300, 400, 200, 20)],
                goal: new Goal(700, 150),
                spikes: [new Spike(500, 380)],
                powerUp: new PowerUp(500, 370) // Add power-up position
            }
        ];
    }

    startGame() {
        this.state = GameState.PLAYING;
        this.currentLevel = 0; // Start from level 1
        this.player.resetLives(); // Reset lives to 3
        this.player.reset();
        this.loadLevel();
        document.getElementById('menu').style.display = 'none'; // Hide menu
        this.gameLoop();
        this.startTimer();
    }

    loadLevel() {
        const level = this.levelData[this.currentLevel];
        this.platforms = level.platforms;
        this.goal = level.goal;
        this.spikes = level.spikes;
        this.powerUp = level.powerUp; // Load power-up
        this.player.reset(); // Reset player for new level
        this.timer = INITIAL_TIME; // Reset timer for the new level
    }

    showInstructions() {
        document.getElementById('instructions').classList.remove('hidden');
    }

    hideInstructions() {
        document.getElementById('instructions').classList.add('hidden');
    }

    startTimer() {
        // Ensure the previous timer is cleared before starting a new one
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (this.state === GameState.PLAYING) {
                this.timer--;
                if (this.timer <= 0) {
                    this.player.lives--; // Lose a life
                    this.resetForNextLevel(); // Trigger level reset on timer expiration
                }
            }
        }, TIMER_INTERVAL);
    }

    resetForNextLevel() {
        if (this.player.lives > 0) {
            this.loadLevel(); // Load next level
        } else {
            this.state = GameState.GAME_OVER; // Game over
            clearInterval(this.timerInterval); // Stop the timer
            this.showGameOver(); // Show game over message
        }
    }

    showGameOver() {
        alert('Game Over! You have lost all your lives.');
        this.showMenu();
    }

    showMenu() {
        this.state = GameState.MENU; // Go back to menu
        document.getElementById('menu').style.display = 'block'; // Show menu
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') this.player.moveLeft = true;
        if (e.key === 'ArrowRight') this.player.moveRight = true;
        if (e.key === 'ArrowUp') {
            if (this.player.velocityY === 0) {
                this.player.velocityY = JUMP_SPEED;
            }
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowUp') this.player.moveup = false;
        if (e.key === 'ArrowLeft') this.player.moveLeft = false;
        if (e.key === 'ArrowRight') this.player.moveRight = false;
        if (this.player.velocityX === 5)  {
            this.player.velocityX = MOVE_SPEED;

        }
    }

    update() {
        const collisionResult = this.player.update(this.platforms, this.goal, this.spikes, this.powerUp);
        
        if (collisionResult === 'goal') {
            this.currentLevel++;
            if (this.currentLevel < this.levelData.length) {
                this.loadLevel(); // Load next level
            } else {
                this.state = GameState.GAME_OVER; // All levels completed
                alert('Congratulations! You have completed all levels!');
                this.showMenu(); // Show game over message
            }
        }

        // If game over
        if (collisionResult === 'gameover') {
            this.state = GameState.GAME_OVER;
            this.showGameOver();
        }

        // If player collects power-up
        if (collisionResult === 'powerup') {
            this.timer += POWERUP_TIME_INCREASE; // Increase timer by 10 seconds
            this.powerUp = null; // Remove power-up after collection
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.platforms.forEach(platform => platform.draw());
        this.goal.draw(); // Draw the goal
        this.spikes.forEach(spike => spike.draw()); // Draw the spikes
        this.player.draw();
        if (this.powerUp) this.powerUp.draw(); // Draw power-up if present

        // Draw timer and lives in red
        ctx.fillStyle = 'red'; // Change text color to red
        ctx.font = '20px Arial';
        ctx.fillText(`Lives: ${this.player.lives}`, 10, 20);
        ctx.fillText(`Time: ${this.timer}`, canvas.width - 100, 20);
    }

    gameLoop() {
        if (this.state === GameState.PLAYING) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

const game = new Game();
