import { Input } from 'phaser';
import { playerAnimation, botAnimation } from './animations';
import { getGameWidth, getGameHeight } from '../helpers';
import { initWS } from '../websocket/websocket';
import Bullets from './bullet';
import { EventType } from '../eventType';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  public platformConfig: PlatformConfig;

  private lavaCollider = null;
  private normalFloorCollider = null;
  private playerSkin = 'andre';
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.Physics.Arcade.Sprite;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private floor: Phaser.Physics.Arcade.StaticGroup;
  private mapRenderBounds: { left: number; right: number };
  private textBox: Phaser.GameObjects.Text;
  private scoreCounter: Phaser.GameObjects.Text;
  private bombs: Phaser.Physics.Arcade.Group;
  private killbots: Phaser.Physics.Arcade.Group;
  private chunkSize = 2048;
  private playerVelocity = 150;
  private bullets: Bullets;
  private items: Phaser.Physics.Arcade.Group;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    //Initializes the connection and starts to listen the connection
    this.initConnectionAndHandleEvents();

    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    this.player = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'andre');

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.setBounce(0.2);
    // this.player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    playerAnimation(this.anims, 'ilpo');
    playerAnimation(this.anims, 'rasse');
    playerAnimation(this.anims, 'andre');
    botAnimation(this.anims);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBackgroundColor('#111111');

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.platforms = this.physics.add.staticGroup();
    this.floor = this.physics.add.staticGroup();
    this.physics.add.collider(this.player, this.platforms);
    this.normalFloorCollider = this.physics.add.collider(this.player, this.floor);
    this.mapRenderBounds = { left: 0, right: 2048 };

    this.initPlatformConfig();
    this.generateChunk(0);

    this.createTextBox();
    this.createCounter();

    this.setupBombs();
    this.setupKillbots();

    this.bullets = new Bullets(this.physics, this, 30);
    this.bullets.setHitCallback(this.player, this.playerHitsBomb);

    // don't update on every frame
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        this.updateKillbots();
      },
    });


    this.setupRocket();
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.createRocket();
      },
    });
  }


  private setupRocket() {
    this.items = this.physics.add.group();
    this.physics.add.collider(this.items, this.platforms);
    this.physics.add.collider(this.items, this.floor);
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    this.createRocket();
  }
  private createRocket() {
    var px = this.player.getCenter().x
    var rocket = this.items.create(px + 500, 16, 'item');
    rocket.setBounce(0.2);
  }

  private collectItem(player, item) {
    item.disableBody(true, true);
    this.playerVelocity = 1000;
    setTimeout(() => {
      this.playerVelocity = 150;
    }, 2 * 1000);
  }

  private setupBombs() {
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.bombs, this.floor);
    this.physics.add.collider(this.player, this.bombs, this.playerHitsBomb, null, this);

    this.createBomb();
  }

  private createBomb() {
    var px = this.player.getCenter().x
    var bombX = Phaser.Math.Between(px, px + 800)
    var bomb = this.bombs.create(bombX, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    setTimeout(() => {
      this.bombs.remove(bomb);
      bomb.destroy();
    }, 10 * 1000);
  }

  private setupKillbots() {
    this.killbots = this.physics.add.group();
    this.physics.add.collider(this.killbots, this.platforms);
    this.physics.add.collider(this.killbots, this.floor);

    //this.createKillBot(); // this line can be removed once we create 'KILLBOT' event on the backend
  }

  private createKillBot() {
    const bot = this.killbots.create(this.player.x + 200, 0, 'killbot');
    bot.setBounce(0.3);
  }

  private playerHitsBomb() {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.anims.play('turn');

    this.populateTextBox('GAME OVER!');

    this.sound.add('gameover');
    this.sound.play('gameover');

    this.restartGame(5);
  }

  private restartGame(seconds: number): void {
    setTimeout(() => {
      this.lavaToFloor();
      this.scene.restart();
    }, seconds * 1000);
  }

  private createTextBox(): void {
    const px = getGameWidth(this) / 2;
    const py = 64;
    this.textBox = this.add.text(px, py, '', { fill: '#FFFFFF' }).setFontSize(24);
    this.textBox.setScrollFactor(0);
  }

  private createCounter(): void {
    const x = getGameWidth(this) - 300;
    const y = 64;
    this.scoreCounter = this.add.text(x, y, '0', { fill: '#FFFFFF' }).setFontSize(24).setScrollFactor(0);
  }

  private populateTextBox(string: string) {
    this.textBox.setText(string);
  }

  private initConnectionAndHandleEvents() {
    initWS((event) => {
      const string = event.data;

      if (string === EventType.BOMB) {
        this.createBomb();
        return;
      }

      if (string === EventType.HIGH_SPEED) {
        this.playerVelocity = 250;
        return;
      } else if (string === EventType.NORMAL_SPEED) {
        this.playerVelocity = 150;
        return;
      } else if (string === EventType.LOW_SPEED) {
        this.playerVelocity = 50;
        return;
      }

      if (string === EventType.LAVA_ON) {
        this.populateTextBox('Floor is dangerous! 😈');
        setTimeout(() => {
          this.floorToLava();
          this.populateTextBox('');
        }, 3 * 1000);
        return;

      } else if (string === EventType.LAVA_OFF) {
        this.lavaToFloor();
        return;
      }

      if (string === EventType.KILLBOT) {
        this.createKillBot();
        return;
      }

      // we are showing non valid events as messages on the screen
      this.populateTextBox(string);
    });
  }

  private initPlatformConfig(): void {
    this.platformConfig = {
      size: 256,
      minY: getGameHeight(this) * 0.5,
      maxY: getGameHeight(this) * 0.9, // this is actually the bottom
      minAmount: 1,
      maxAmount: 2,
    };
  }

  private generateChunk(position: number): void {
    const platWidth = this.platformConfig.size;
    for (let x = position + platWidth / 2; x < position + this.chunkSize; x += 1.1 * platWidth) {
      const amount = randInt(this.platformConfig.minAmount, this.platformConfig.maxAmount);
      for (let i = 0; i < amount; i++) {
        const y = randInt(this.platformConfig.minY, this.platformConfig.maxY);
        const deltaX = (0.1 - Math.random() * 0.2) * platWidth;
        this.platforms.create(x + deltaX, y, 'platform');
      }
    }
    // floor
    this.floor
      .create(0, 0, this.lavaCollider ? 'lava' : 'platform')
      .setOrigin(0.5, 1)
      .setDisplaySize(2048, 32)
      .setPosition(position + 1024, getGameHeight(this))
      .refreshBody();
  }

  private updateSpeed(): void {
    if (this.cursorKeys.left.isDown) {
      this.player.setVelocityX(-1 * this.playerVelocity);
      this.player.anims.play(`left-${this.playerSkin}`, true);

    } else if (this.cursorKeys.right.isDown) {
      this.player.setVelocityX(this.playerVelocity);
      this.player.anims.play(`right-${this.playerSkin}`, true);

    } else {
      this.player.setVelocityX(0);
      this.player.anims.play(`turn-${this.playerSkin}`);
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
    this.generateChunk(this.mapRenderBounds.right);
    this.mapRenderBounds.right += 2048;
  }

  private createPlatformsLeft(): void {
    this.generateChunk(this.mapRenderBounds.left - 2048);
    this.mapRenderBounds.left -= 2048;
  }

  private floorToLava(): void {
    if (this.lavaCollider) {
      return;
    }
    console.log('Changing floor to lava!');

    // lava is deadly!
    this.lavaCollider = this.physics.add.collider(this.player, this.floor, this.playerHitsBomb, null, this);
    this.physics.world.removeCollider(this.normalFloorCollider);
    // change sprites
    const children = this.floor.getChildren() as Phaser.GameObjects.Sprite[];
    children.forEach((spr) => {
      spr.setTexture('lava');
    });
  }

  private lavaToFloor(): void {
    if (!this.lavaCollider) {
      return;
    }
    console.log('Changing floor back to dirt!');

    // change sprites
    const children = this.floor.getChildren() as Phaser.GameObjects.Sprite[];
    children.forEach((spr) => {
      spr.setTexture('platform');
    });
    // remove lavacollider
    this.normalFloorCollider = this.physics.add.collider(this.player, this.floor);
    this.physics.world.removeCollider(this.lavaCollider);
    this.lavaCollider = null;
  }

  private updateKillbots() {
    this.killbots.getChildren().forEach((bot: Phaser.Physics.Arcade.Sprite) => {
      if (Math.abs(this.player.x - bot.x) < getGameWidth(this) / 4) {
        this.bullets.spawnBullet(bot.x, bot.y, this.player.x < bot.x ? 'left' : 'right');
      }
      if (this.player.x > bot.x) {
        bot.anims.play('bot-right');
      } else {
        bot.anims.play('bot-left');
      }
    });
  }

  public update(): void {
    const foo = Math.floor(Math.abs(this.player.x % 3000) / 1000);

    this.playerSkin = ['andre', 'ilpo', 'rasse'][foo];

    const distanceInPixels = this.player.x - getGameWidth(this) / 2;
    this.scoreCounter.setText(`score: ${Math.round(distanceInPixels / 10)}m`);
    this.updateSpeed();
    this.updateMap();
    this.bullets.update();
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
