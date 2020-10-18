export const playerAnimation = (anims: Phaser.Animations.AnimationManager, spritesheet: string): void => {
  anims.create({
    key: `left-${spritesheet}`,
    frames: anims.generateFrameNumbers(spritesheet, { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  anims.create({
    key: `turn-${spritesheet}`,
    frames: [{ key: spritesheet, frame: 4 }],
    frameRate: 20,
  });

  anims.create({
    key: `right-${spritesheet}`,
    frames: anims.generateFrameNumbers(spritesheet, { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });
};

export const botAnimation = (anims: Phaser.Animations.AnimationManager): void => {
  anims.create({
    key: `bot-right`,
    frames: [{ key: 'killbot', frame: 1 }],
    frameRate: 10,
  });

  anims.create({
    key: `bot-left`,
    frames: [{ key: 'killbot', frame: 2 }],
    frameRate: 10,
  });
};
