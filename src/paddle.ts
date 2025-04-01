export class Paddle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public side: 'left' | 'right';
  private speed: number;

  constructor(x: number, y: number, width: number, height: number, side: 'left' | 'right', speed: number = 800) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.side = side;
    this.speed = speed;
  }

  public moveUp(deltaTime: number): void {
    this.y -= this.speed * deltaTime;
  }

  public moveDown(deltaTime: number): void {
    this.y += this.speed * deltaTime;
  }

  public setHeight(height: number): void {
    const centerY = this.y + this.height / 2;
    this.height = height;
    // Adjust y position to keep paddle centered at its current position
    this.y = centerY - this.height / 2;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }
}
