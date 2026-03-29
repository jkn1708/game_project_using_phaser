import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene')
  }

  create() {
    const { width, height } = this.scale

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x1b1f2a)
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 24, 'My Phaser Game', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: '#f8fafc',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 28, 'Start building your first scene here.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
  }
}
