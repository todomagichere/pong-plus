export enum PowerUpType {
  SpeedUp = 0,
  SpeedDown = 1,
  WidePaddle = 2,
  NarrowPaddle = 3,
  MultiplyBall = 4, // Not fully implemented yet
  Invisible = 5     // Not fully implemented yet
}

export class PowerUp {
  public x: number;
  public y: number;
  public radius: number;
  public type: PowerUpType;
  public isExpired = false;
  private lifeTime = 15; // Seconds before the power-up expires
  private lifeTimer = 0;

  constructor(x: number, y: number, radius: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
  }

  public update(deltaTime: number): void {
    // Update lifetime timer
    this.lifeTimer += deltaTime;

    // Expire if the timer exceeds lifetime
    if (this.lifeTimer >= this.lifeTime) {
      this.isExpired = true;
    }
  }
}
