import Phaser from 'phaser'

export class Bird {
  readonly sprite: Phaser.Types.Physics.Arcade.ImageWithDynamicBody

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.image(x, y, 'bird-up').setScale(1.35)
    this.sprite.body.allowGravity = false
    this.sprite.setCollideWorldBounds(true)
  }

  enableGravity(gravityY: number) {
    this.sprite.body.allowGravity = true
    this.sprite.setGravityY(gravityY)
  }

  flap(velocityY: number) {
    this.sprite.setVelocityY(velocityY)
  }

  updateRotation() {
    this.sprite.setAngle(Phaser.Math.Clamp(this.sprite.body.velocity.y / 18, -22, 42))
  }

  stop() {
    this.sprite.setVelocity(0, 0)
    this.sprite.body.allowGravity = false
    this.sprite.setAngle(0)
    this.sprite.setAlpha(1)
  }

  setTexture(texture: string) {
    this.sprite.setTexture(texture)
  }

  setAlpha(alpha: number) {
    this.sprite.setAlpha(alpha)
  }

  getCollisionBounds() {
    const bounds = this.sprite.getBounds()
    Phaser.Geom.Rectangle.Inflate(bounds, -18, -14)

    return bounds
  }
}
