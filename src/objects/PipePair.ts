import Phaser from 'phaser'

export class PipePair {
  private readonly pipes: Phaser.GameObjects.Image[]
  private readonly gap: number
  private scored = false

  constructor(scene: Phaser.Scene, height: number, gap: number) {
    this.gap = gap
    this.pipes = [scene.add.image(0, -150, 'pipe').setFlipY(true), scene.add.image(0, height - 260, 'pipe')]
  }

  update(delta: number, speed: number, resetX: number) {
    const moveAmount = (speed * delta) / 1000

    this.pipes.forEach((pipe) => {
      pipe.x -= moveAmount
    })

    if (this.pipes[0].x < -80) {
      this.reset(resetX)
    }
  }

  reset(x: number) {
    const gapCenter = Phaser.Math.Between(170, 340)

    this.pipes.forEach((pipe) => {
      pipe.x = x
    })
    this.pipes[0].y = gapCenter - this.gap / 2 - this.pipes[0].displayHeight / 2
    this.pipes[1].y = gapCenter + this.gap / 2 + this.pipes[1].displayHeight / 2
    this.scored = false
  }

  hasPassed(x: number) {
    return !this.scored && this.pipes[0].x < x
  }

  markScored() {
    this.scored = true
  }

  isTouching(bounds: Phaser.Geom.Rectangle) {
    return this.pipes.some((pipe) => Phaser.Geom.Intersects.RectangleToRectangle(bounds, this.getPipeBounds(pipe)))
  }

  private getPipeBounds(pipe: Phaser.GameObjects.Image) {
    const bounds = pipe.getBounds()
    Phaser.Geom.Rectangle.Inflate(bounds, -16, -18)

    return bounds
  }
}
