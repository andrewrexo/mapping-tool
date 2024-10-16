export class GlobalAnimationManager {
  private globalTimer: number = 0;
  private animationSpeed: number;

  constructor(animationSpeed: number = 500) {
    this.animationSpeed = animationSpeed;
  }

  update(delta: number) {
    this.globalTimer += delta;
    this.globalTimer %= this.animationSpeed;
  }

  getProgress(): number {
    return this.globalTimer / this.animationSpeed;
  }
}
