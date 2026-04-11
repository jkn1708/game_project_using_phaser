import Phaser from 'phaser'

export class GameOverPanel {
  readonly container: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene, width: number, height: number, score: number, lives: number) {
    this.container = scene.add.container(width / 2, height / 2)
    this.container.add([
      scene.add.rectangle(0, 0, 360, 220, 0xfff7ed, 0.95).setStrokeStyle(8, 0x7c2d12),
      scene.add
        .text(0, -58, 'GAME OVER', {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '34px',
          fontStyle: 'bold',
          color: '#ea580c',
        })
        .setOrigin(0.5),
      scene.add
        .text(0, 0, `Score: ${score}`, {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#0f172a',
        })
        .setOrigin(0.5),
      scene.add
        .text(0, 62, `Lives: ${lives}  |  Click or Space to restart`, {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '18px',
          color: '#475569',
        })
        .setOrigin(0.5),
    ])
  }
}
