import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Boot',
};

/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    const halfWidth = getGameWidth(this) * 0.5;
    const halfHeight = getGameHeight(this) * 0.5;

    const progressBarHeight = 100;
    const progressBarWidth = 400;

    const progressBarContainer = this.add.rectangle(
      halfWidth,
      halfHeight,
      progressBarWidth,
      progressBarHeight,
      0x000000,
    );
    const progressBar = this.add.rectangle(
      halfWidth + 20 - progressBarContainer.width * 0.5,
      halfHeight,
      10,
      progressBarHeight - 20,
      0x888888,
    );

    const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...').setFontSize(24);
    const percentText = this.add.text(halfWidth - 25, halfHeight, '0%').setFontSize(24);
    const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);

    this.load.on('progress', (value) => {
      progressBar.width = (progressBarWidth - 30) * value;

      const percent = value * 100;
      percentText.setText(`${percent}%`);
    });

    this.load.on('fileprogress', (file) => {
      assetText.setText(file.key);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      progressBar.destroy();
      progressBarContainer.destroy();

      this.scene.start('MainMenu');
    });

    this.loadAssets();
  }

  /**
   * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
   * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
   * is currently active, so they can be accessed anywhere.
   */
  private loadAssets() {
    // Load sample assets
    //  Firefox doesn't support mp3 files, so use ogg -> this.load.audio('gameover', ['assets/gameover.mp3', 'assets/gameover.ogg']);
    this.load.audio('gameover', 'assets/gameover.mp3');

    // Source: Open Game Art
    this.load.image('platform', 'assets/sprites/ground-dirt.png');
    this.load.image('bomb', 'assets/sprites/bomb.png');
    this.load.image('bullet-right', 'assets/sprites/bullet.png');
    this.load.image('bullet-left', 'assets/sprites/bullet-left.png');
    this.load.image('lava', 'assets/sprites/lava.png');
    this.load.image('item', 'assets/sprites/rocket.png');
    this.load.spritesheet('killbot', 'assets/sprites/killbot2.png', { frameWidth: 65, frameHeight: 40 });
    this.load.spritesheet('dude', 'assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('ilpo', 'assets/sprites/ilpo.png', { frameWidth: 32, frameHeight: 36 });
    this.load.spritesheet('rasse', 'assets/sprites/rasse.png', { frameWidth: 32, frameHeight: 36 });
    this.load.spritesheet('andre', 'assets/sprites/andre.png', { frameWidth: 32, frameHeight: 36 });

    this.load.image('menu-bg', 'assets/sprites/bg1.png');
  }
}
