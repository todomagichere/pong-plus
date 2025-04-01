import { Paddle } from './paddle';
import { Ball } from './ball';
import { PowerUp, PowerUpType } from './powerUp';
import { GameConfig } from './gameConfig';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private menuElement: HTMLElement;
  private player1ScoreElement: HTMLElement;
  private player2ScoreElement: HTMLElement;
  private player1PowerUpsElement: HTMLElement;
  private player2PowerUpsElement: HTMLElement;

  private player1: Paddle;
  private player2: Paddle;
  private ball: Ball;
  private powerUps: PowerUp[] = [];

  private player1Score = 0;
  private player2Score = 0;

  private gameRunning = false;
  private animationFrameId?: number;

  private lastFrameTime = 0;
  private powerUpTimer = 0;
  private gameTime = 0;
  private config: GameConfig;

  private keysPressed: { [key: string]: boolean } = {};

  constructor(
    canvas: HTMLCanvasElement,
    menuElement: HTMLElement,
    player1ScoreElement: HTMLElement,
    player2ScoreElement: HTMLElement,
    player1PowerUpsElement: HTMLElement,
    player2PowerUpsElement: HTMLElement,
    config: GameConfig
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.menuElement = menuElement;
    this.player1ScoreElement = player1ScoreElement;
    this.player2ScoreElement = player2ScoreElement;
    this.player1PowerUpsElement = player1PowerUpsElement;
    this.player2PowerUpsElement = player2PowerUpsElement;
    this.config = config;

    // Create game objects
    const paddleWidth = 15;
    const paddleHeight = 100;

    this.player1 = new Paddle(
      paddleWidth * 2,
      this.canvas.height / 2 - paddleHeight / 2,
      paddleWidth,
      paddleHeight,
      'left',
      this.config.paddleSpeed
    );

    this.player2 = new Paddle(
      this.canvas.width - paddleWidth * 3,
      this.canvas.height / 2 - paddleHeight / 2,
      paddleWidth,
      paddleHeight,
      'right',
      this.config.paddleSpeed
    );

    this.ball = new Ball(
      this.canvas.width / 2,
      this.canvas.height / 2,
      10,
      this.config.ballSpeed,
      Math.random() > 0.5 ? 1 : -1, // Random initial direction
      (Math.random() * 2 - 1) * 0.5 // Random angle
    );

    // Set up keyboard event listeners
    this.setupControls();
  }

  public start(): void {
    if (this.gameRunning) return;

    this.gameRunning = true;
    this.player1Score = 0;
    this.player2Score = 0;
    this.gameTime = 0;
    this.powerUpTimer = 0;
    this.updateScoreDisplay();

    // Reset ball
    this.resetBall();

    // Start game loop
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  public handleResize(): void {
    if (!this.player1 || !this.player2 || !this.ball) return;

    // Update paddle positions on resize
    this.player1.x = this.player1.width * 2;
    this.player2.x = this.canvas.width - this.player2.width * 3;

    // Ensure paddles stay in bounds
    this.player1.y = Math.min(this.player1.y, this.canvas.height - this.player1.height);
    this.player2.y = Math.min(this.player2.y, this.canvas.height - this.player2.height);

    // Reset ball to center if game is running
    if (this.gameRunning) {
      this.ball.x = this.canvas.width / 2;
      this.ball.y = this.canvas.height / 2;
    }
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key] = false;
    });
  }

  private gameLoop(): void {
    if (!this.gameRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    this.gameTime += deltaTime;
    this.powerUpTimer += deltaTime;

    // Update game objects
    this.handleInput(deltaTime);
    this.updateGameObjects(deltaTime);
    this.checkCollisions();
    this.spawnPowerUps();

    // Draw everything
    this.render();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private handleInput(deltaTime: number): void {
    // Player 1 controls (W, S)
    if (this.keysPressed.w || this.keysPressed.W) {
      this.player1.moveUp(deltaTime);
    }
    if (this.keysPressed.s || this.keysPressed.S) {
      this.player1.moveDown(deltaTime);
    }

    // Player 2 controls (Arrow Up, Arrow Down)
    if (this.keysPressed.ArrowUp) {
      this.player2.moveUp(deltaTime);
    }
    if (this.keysPressed.ArrowDown) {
      this.player2.moveDown(deltaTime);
    }

    // Keep paddles within canvas bounds
    this.player1.y = Math.max(0, Math.min(this.player1.y, this.canvas.height - this.player1.height));
    this.player2.y = Math.max(0, Math.min(this.player2.y, this.canvas.height - this.player2.height));
  }

  private updateGameObjects(deltaTime: number): void {
    // Update ball position
    this.ball.update(deltaTime);

    // Check if ball is out of bounds (horizontal)
    if (this.ball.x < 0) {
      // Player 2 scores
      this.player2Score++;
      this.updateScoreDisplay();
      this.resetBall(false); // Serve to player 1
    } else if (this.ball.x > this.canvas.width) {
      // Player 1 scores
      this.player1Score++;
      this.updateScoreDisplay();
      this.resetBall(true); // Serve to player 2
    }

    // Check if ball hits top or bottom
    if (this.ball.y < this.ball.radius || this.ball.y > this.canvas.height - this.ball.radius) {
      this.ball.bounceY();
    }

    // Update power-ups and check for expiration
    this.powerUps = this.powerUps.filter((powerUp) => {
      powerUp.update(deltaTime);
      return !powerUp.isExpired;
    });
  }

  private checkCollisions(): void {
    // Check ball collision with paddles
    if (this.checkBallPaddleCollision(this.player1)) {
      const relativeIntersectY = (this.player1.y + this.player1.height / 2) - this.ball.y;
      const normalizedRelativeIntersectionY = relativeIntersectY / (this.player1.height / 2);
      const bounceAngle = normalizedRelativeIntersectionY * 0.75; // Max 60 degrees

      this.ball.bounceX();
      this.ball.setYDirection(-bounceAngle);
      this.ball.increaseSpeed(this.config.ballAcceleration); // Use configured acceleration
    }

    if (this.checkBallPaddleCollision(this.player2)) {
      const relativeIntersectY = (this.player2.y + this.player2.height / 2) - this.ball.y;
      const normalizedRelativeIntersectionY = relativeIntersectY / (this.player2.height / 2);
      const bounceAngle = normalizedRelativeIntersectionY * 0.75; // Max 60 degrees

      this.ball.bounceX();
      this.ball.setYDirection(-bounceAngle);
      this.ball.increaseSpeed(this.config.ballAcceleration); // Use configured acceleration
    }

    // Check for player collision with power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];

      if (this.checkBallPowerUpCollision(powerUp)) {
        this.applyPowerUp(powerUp);
        this.powerUps.splice(i, 1);
      }
    }
  }

  private checkBallPaddleCollision(paddle: Paddle): boolean {
    // Simple rectangular collision detection
    if (
      this.ball.x - this.ball.radius < paddle.x + paddle.width &&
      this.ball.x + this.ball.radius > paddle.x &&
      this.ball.y - this.ball.radius < paddle.y + paddle.height &&
      this.ball.y + this.ball.radius > paddle.y
    ) {
      return true;
    }
    return false;
  }

  private checkBallPowerUpCollision(powerUp: PowerUp): boolean {
    const dx = this.ball.x - powerUp.x;
    const dy = this.ball.y - powerUp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.ball.radius + powerUp.radius;
  }

  private spawnPowerUps(): void {
    // Spawn a power-up based on configured frequency
    if (this.powerUpTimer > this.config.powerUpFrequency) {
      this.powerUpTimer = 0;

      // Calculate random position (away from paddles)
      const minX = this.canvas.width * 0.25;
      const maxX = this.canvas.width * 0.75;
      const x = Math.random() * (maxX - minX) + minX;
      const y = Math.random() * (this.canvas.height - 40) + 20;

      // Random power-up type
      const powerUpTypes = [
        PowerUpType.SpeedUp,
        PowerUpType.SpeedDown,
        PowerUpType.WidePaddle,
        PowerUpType.NarrowPaddle,
        PowerUpType.MultiplyBall, // Not implemented yet
        PowerUpType.Invisible     // Not implemented yet
      ];

      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

      // Create and add new power-up
      const powerUp = new PowerUp(x, y, 15, randomType);
      this.powerUps.push(powerUp);
    }
  }

  private applyPowerUp(powerUp: PowerUp): void {
    // Determine which player gets the power-up (based on ball direction)
    const targetPlayer = this.ball.dx > 0 ? this.player1 : this.player2;
    const targetPlayerElement = this.ball.dx > 0 ? this.player1PowerUpsElement : this.player2PowerUpsElement;

    // Apply the power-up effect
    switch (powerUp.type) {
      case PowerUpType.SpeedUp:
        this.ball.setSpeed(this.ball.speed * 1.5);
        this.displayPowerUpEffect(targetPlayerElement, "S+");
        break;

      case PowerUpType.SpeedDown:
        this.ball.setSpeed(Math.max(2, this.ball.speed * 0.7));
        this.displayPowerUpEffect(targetPlayerElement, "S-");
        break;

      case PowerUpType.WidePaddle:
        targetPlayer.setHeight(targetPlayer.height * 1.5);
        this.displayPowerUpEffect(targetPlayerElement, "W+");

        // Reset paddle size after a few seconds
        setTimeout(() => {
          targetPlayer.setHeight(targetPlayer.height / 1.5);
        }, 5000);
        break;

      case PowerUpType.NarrowPaddle: {
        // Apply to opponent
        const opponent = targetPlayer === this.player1 ? this.player2 : this.player1;
        const opponentElement = targetPlayer === this.player1 ? this.player2PowerUpsElement : this.player1PowerUpsElement;

        opponent.setHeight(Math.max(20, opponent.height * 0.7));
        this.displayPowerUpEffect(opponentElement, "W-");

        // Reset paddle size after a few seconds
        setTimeout(() => {
          opponent.setHeight(opponent.height / 0.7);
        }, 5000);
        break;
      }
    }
  }

  private displayPowerUpEffect(element: HTMLElement, text: string): void {
    // Create power-up icon
    element.innerHTML = `<div class="power-up-icon">${text}</div>`;

    // Clear after a few seconds
    setTimeout(() => {
      element.innerHTML = '';
    }, 3000);
  }

  private resetBall(serveToLeft = Math.random() > 0.5): void {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;

    // Choose a random angle
    const angle = (Math.random() * 0.5 - 0.25) * Math.PI; // -45 to 45 degrees

    // Set direction based on who should receive serve
    const direction = serveToLeft ? -1 : 1;

    // Reset ball speed to base speed + game time factor
    const timeBonus = Math.min(this.config.ballSpeed * 0.5, this.gameTime / 10);
    const baseSpeed = this.config.ballSpeed + timeBonus;

    this.ball.setSpeed(baseSpeed);
    this.ball.setDirection(direction, Math.sin(angle));

    // Add a short delay before ball starts moving
    this.ball.pause();
    setTimeout(() => {
      this.ball.resume();
    }, 300);
  }

  private updateScoreDisplay(): void {
    this.player1ScoreElement.textContent = this.player1Score.toString();
    this.player2ScoreElement.textContent = this.player2Score.toString();

    // Check for winning condition (first to 10 points)
    if (this.player1Score >= 10 || this.player2Score >= 10) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.gameRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Update menu text to show winner
    const winner = this.player1Score > this.player2Score ? "Player 1" : "Player 2";

    const titleElement = this.menuElement.querySelector('h1');
    if (titleElement) {
      titleElement.textContent = `${winner} Wins!`;
    }

    // Show menu
    this.menuElement.classList.remove('hidden');

    // Update button text
    const startBtn = this.menuElement.querySelector('#start-btn');
    if (startBtn) {
      startBtn.textContent = 'Play Again';
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw center line
    this.ctx.beginPath();
    this.ctx.setLineDash([10, 15]);
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles
    this.ctx.fillStyle = '#3498db'; // Player 1 color
    this.ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);

    this.ctx.fillStyle = '#e74c3c'; // Player 2 color
    this.ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);

    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    // Draw power-ups
    for (const powerUp of this.powerUps) {
      this.ctx.beginPath();
      this.ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);

      // Color based on power-up type
      switch (powerUp.type) {
        case PowerUpType.SpeedUp:
          this.ctx.fillStyle = '#2ecc71'; // Green
          break;
        case PowerUpType.SpeedDown:
          this.ctx.fillStyle = '#f1c40f'; // Yellow
          break;
        case PowerUpType.WidePaddle:
          this.ctx.fillStyle = '#9b59b6'; // Purple
          break;
        case PowerUpType.NarrowPaddle:
          this.ctx.fillStyle = '#e67e22'; // Orange
          break;
        default:
          this.ctx.fillStyle = '#3498db'; // Blue
      }

      this.ctx.fill();

      // Draw a letter inside to indicate power-up type
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      let text = '?';
      switch (powerUp.type) {
        case PowerUpType.SpeedUp:
          text = 'S+';
          break;
        case PowerUpType.SpeedDown:
          text = 'S-';
          break;
        case PowerUpType.WidePaddle:
          text = 'W+';
          break;
        case PowerUpType.NarrowPaddle:
          text = 'W-';
          break;
      }

      this.ctx.fillText(text, powerUp.x, powerUp.y);
    }
  }
}
