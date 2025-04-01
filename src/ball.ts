export class Ball {
  public x: number;
  public y: number;
  public radius: number;
  public speed: number;
  public dx: number; // Direction X (-1 or 1)
  public dy: number; // Direction Y (between -1 and 1)
  private paused = false;

  constructor(x: number, y: number, radius: number, speed: number, dx: number, dy: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.dx = dx;
    this.dy = dy;
  }

  public update(deltaTime: number): void {
    if (this.paused) return;

    // For extremely high speeds, use smaller steps to prevent skipping through paddles
    const maxStep = 5; // Maximum movement per step
    const steps = Math.max(1, Math.ceil(this.speed * deltaTime / maxStep));
    const smallDeltaTime = deltaTime / steps;

    for (let i = 0; i < steps; i++) {
      // Move ball based on current direction and speed
      this.x += this.dx * this.speed * smallDeltaTime;
      this.y += this.dy * this.speed * smallDeltaTime;
    }
  }

  public bounceX(): void {
    this.dx = -this.dx;
  }

  public bounceY(): void {
    this.dy = -this.dy;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public increaseSpeed(amount: number): void {
    this.speed += amount;
  }

  public setDirection(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
  }

  public setYDirection(normalizedValue: number): void {
    // Set y direction between -1 and 1
    this.dy = Math.max(-1, Math.min(1, normalizedValue));
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }
}
