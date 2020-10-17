import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public speed = 200;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.Physics.Arcade.Sprite;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private mapRenderBounds: { left: number; right: number };

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    this.player = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'man');

    this.cameras.main.startFollow(this.player);

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.platforms = this.physics.add.staticGroup();
    this.physics.add.collider(this.player, this.platforms);
    this.mapRenderBounds = { left: 400, right: 500 };

    // initial platforms
    this.platforms.create(800, 100, 'man').setScale(5).refreshBody();
  }

  private updateSpeed(): void {
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursorKeys.left.isDown) {
      velocity.x -= 1;
    }
    if (this.cursorKeys.right.isDown) {
      velocity.x += 1;
    }
    if (this.cursorKeys.up.isDown) {
      velocity.y -= 1;
    }
    if (this.cursorKeys.down.isDown) {
      velocity.y += 1;
    }

    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    const normalizedVelocity = velocity.normalize();
    this.player.setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
  }

  private updateMap(): void {
    const px = this.player.getCenter().x;
    const platformSize = 100;

    if (px > this.mapRenderBounds.right) {
      const newPlatformX = this.mapRenderBounds.right + platformSize / 2;
      this.platforms.create(newPlatformX, 800, 'man').setScale(4).refreshBody();
      this.mapRenderBounds.right += 3 * platformSize;
    }

    if (px < this.mapRenderBounds.left) {
      const newPlatformX = this.mapRenderBounds.left - platformSize / 2;
      this.platforms.create(newPlatformX, 800, 'man').setScale(5).refreshBody();
      this.mapRenderBounds.left -= 3 * platformSize;
    }
  }

  public update(): void {
    // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    this.updateSpeed();
    this.updateMap();
  }
}
