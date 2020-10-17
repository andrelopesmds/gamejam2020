import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public speed = 600;
  public platformConfig: PlatformConfig;

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
    this.mapRenderBounds = { left: 0, right: getGameWidth(this) };

    this.initPlatformConfig();
    this.createInitialPlatforms();
  }

  private initPlatformConfig(): void {
    this.platformConfig = {
      size: 100,
      minY: getGameHeight(this) / 2,
      maxY: getGameHeight(this), // this is actually the bottom
      minAmount: 1,
      maxAmount: 3,
    };
  }

  private createInitialPlatforms(): void {
    this.platforms.create(getGameWidth(this) / 2, getGameHeight(this) * 0.75, 'platform');
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

    if (px > this.mapRenderBounds.right) {
      this.createPlatformsRight();
    }

    if (px < this.mapRenderBounds.left) {
      this.createPlatformsLeft();
    }
  }

  private createPlatformsRight(): void {
    const amount = randInt(this.platformConfig.minAmount, this.platformConfig.maxAmount);
    console.log('amount of plats', amount);
    for (let i = 0; i < amount; i++) {
      const y = randInt(this.platformConfig.minY, this.platformConfig.maxY);
      console.log('Create plat, y=', y);

      const newPlatformX = this.mapRenderBounds.right + this.platformConfig.size / 2;
      this.platforms.create(newPlatformX, y, 'platform');
    }

    this.mapRenderBounds.right += 3 * this.platformConfig.size;
  }

  private createPlatformsLeft(): void {
    const amount = randInt(this.platformConfig.minAmount, this.platformConfig.maxAmount);
    console.log('amount of plats', amount);
    for (let i = 0; i < amount; i++) {
      const y = randInt(this.platformConfig.minY, this.platformConfig.maxY);
      console.log('Create plat, y=', y);

      const newPlatformX = this.mapRenderBounds.left - this.platformConfig.size / 2;
      this.platforms.create(newPlatformX, y, 'platform');
    }

    this.mapRenderBounds.left -= 3 * this.platformConfig.size;
  }

  public update(): void {
    // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    this.updateSpeed();
    this.updateMap();
  }
}

// functions and types

const randInt = (min: number, max: number): number => {
  if (min === max) {
    return min;
  }
  const x = Math.random() * (max - min + 1);
  return Math.floor(x) + min;
};

interface PlatformConfig {
  size: number;
  minY: number;
  maxY: number;
  minAmount: number;
  maxAmount: number;
}
