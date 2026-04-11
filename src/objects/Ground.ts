import Phaser from 'phaser'

export class Ground {
  private readonly tiles: Phaser.GameObjects.Image[]
  private readonly width: number
  private readonly height: number
  private readonly groundHeight: number

  constructor(scene: Phaser.Scene, width: number, height: number, groundHeight: number) {
    this.width = width
    this.height = height
    this.groundHeight = groundHeight
    this.tiles = [
      scene.add.image(0, height - groundHeight, 'ground').setOrigin(0, 0).setDisplaySize(width, groundHeight),
      scene.add.image(width, height - groundHeight, 'ground').setOrigin(0, 0).setDisplaySize(width, groundHeight),
    ]
  }

  update(delta: number, speed: number) {
    const moveAmount = (speed * delta) / 1000

    this.tiles.forEach((ground) => {
      ground.x -= moveAmount

      if (ground.x <= -this.width) {
        ground.x += this.width * this.tiles.length
      }
    })
  }

  getTop() {
    return this.height - this.groundHeight
  }
}
