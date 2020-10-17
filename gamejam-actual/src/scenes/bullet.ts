import { Physics } from 'phaser';

export default class Bullets {
  private physics: Physics.Arcade.ArcadePhysics;
  private scene: Phaser.Scene;
  private leftBullets: Physics.Arcade.Group;
  private rightBullets: Physics.Arcade.Group;
  private velocity: number;

  constructor(physics: Physics.Arcade.ArcadePhysics, scene: Phaser.Scene, velocity: number) {
    this.physics = physics;
    this.scene = scene;
    this.leftBullets = this.physics.add.group({ allowGravity: false });
    this.rightBullets = this.physics.add.group({ allowGravity: false });
    this.velocity = velocity;
  }

  public spawnBullet(x: number, y: number, direction: 'left' | 'right'): void {
    const bg = direction === 'left' ? this.leftBullets : this.rightBullets;
    const bullet = bg.create(x, y, 'bomb') as Physics.Arcade.Sprite;
    // remove bullets after a time
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        console.log('Called!');

        bg.remove(bullet);
        bullet.destroy();
      },
    });
  }

  public update(): void {
    const rb = this.rightBullets.getChildren() as Phaser.GameObjects.Sprite[];
    const lb = this.leftBullets.getChildren() as Phaser.GameObjects.Sprite[];
    rb.forEach((b) => {
      b.setPosition(b.x + this.velocity, b.y);
    });
    lb.forEach((b) => {
      b.setPosition(b.x - this.velocity, b.y);
    });
  }
}
