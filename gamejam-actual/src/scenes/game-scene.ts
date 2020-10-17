import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { initWS } from '../websocket/websocket';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public platformConfig: PlatformConfig;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.Physics.Arcade.Sprite;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private mapRenderBounds: { left: number; right: number };
  private textBox: Phaser.GameObjects.Text;
  private bombs: Phaser.Physics.Arcade.Group;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    //Initializes the connection and starts to listen the connection
    this.initConnectionAndHandleEvents();

    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    this.player = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.setBounce(0.2);
    // this.player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.createDudeAnimations();

    this.cameras.main.startFollow(this.player);

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.platforms = this.physics.add.staticGroup();
    this.physics.add.collider(this.player, this.platforms);
    this.mapRenderBounds = { left: 0, right: getGameWidth(this) };

    this.initPlatformConfig();
    this.createInitialPlatforms();

    this.createTextBox();
    this.populateTextBox('');

    this.setupBombs();
  }

  private setupBombs() {
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.playerHitsBomb, null, this);

    this.createBomb();
  }

  private createBomb() {
    var x = (this.player.getCenter().x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = this.bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }

  private playerHitsBomb() {
    // todo
  }

  private createTextBox(): void {
    const px = this.player.getCenter().x;
    const py = this.player.getCenter().y;
    this.textBox = this.add.text(px, py, '', { fill: '#FFFFFF' }).setFontSize(24);
  }

  private populateTextBox(string: string) {
    const px = this.player.getCenter().x;
    const py = this.player.getCenter().y;

    this.textBox.setX(px);
    this.textBox.setY(py - 500);
    this.textBox.setText(string);
  }

  private initConnectionAndHandleEvents() {
    initWS((event) => {
      const string = event.data;

      if (string === 'BOMB') {
        this.createBomb();
        return;
      }

      // we are showing non valid events as messages on the screen
      this.populateTextBox(string);
    });
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
    this.platforms.create(getGameWidth(this) * 0.75, getGameHeight(this) * 0.73, 'platform');
    this.platforms.create(getGameWidth(this) * 0.5, getGameHeight(this) * 0.75, 'platform');
    this.platforms.create(getGameWidth(this) * 0.25, getGameHeight(this) * 0.72, 'platform');

    // floor
    this.platforms
      .create(getGameWidth(this) / 2, getGameHeight(this), 'platform')
      .setScale(8)
      .refreshBody();
  }

  private createDudeAnimations() {
    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private updateSpeed(): void {
    if (this.cursorKeys.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursorKeys.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursorKeys.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  private updateMap(): void {
    const px = this.player.getCenter().x;

    if (px > this.mapRenderBounds.right - getGameWidth(this) / 2) {
      this.createPlatformsRight();
    }

    if (px < this.mapRenderBounds.left + getGameWidth(this) / 2) {
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
