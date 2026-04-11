import Phaser from 'phaser'

export class Hud {
  private readonly scoreText: Phaser.GameObjects.Text
  private readonly hearts: Phaser.GameObjects.Image[]

  constructor(scene: Phaser.Scene, width: number, lives: number) {
    this.scoreText = scene.add
      .text(width / 2, 34, '0', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#0f172a',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.hearts = [
      scene.add.image(34, 32, 'heart-full'),
      scene.add.image(86, 32, 'heart-full'),
      scene.add.image(138, 32, 'heart-full'),
    ]
    this.setLives(lives)
  }

  setScore(score: number) {
    this.scoreText.setText(String(score))
  }

  setLives(lives: number) {
    this.hearts.forEach((heart, index) => {
      const lifeValue = lives - index * 2
      const textureKey = lifeValue >= 2 ? 'heart-full' : lifeValue === 1 ? 'heart-half' : 'heart-empty'

      heart.setTexture(textureKey)
    })
  }
}
