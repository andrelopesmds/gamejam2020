import { MenuButton } from '../ui/menu-button';
import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    this.add.image(0, 0, 'menu-bg').setOrigin(0, 0).setDisplaySize(getGameWidth(this), getGameHeight(this));

    this.add
      .text(100, 50, 'Never ending escape', {
        fill: '#FFFFFF',
      })
      .setFontSize(36);

    this.add
      .text(100, 100, 'by Team Kova Ajo', {
        fill: '#FFFFFF',
      })
      .setFontSize(36);


    new MenuButton(this, 100, 150, 'Start Game', () => {
      this.scene.start('Game');
    });

    new MenuButton(this, 100, 250, 'Settings', () => console.log('settings button clicked'));

    new MenuButton(this, 100, 350, 'Help', () => console.log('help button clicked'));
  }
}
