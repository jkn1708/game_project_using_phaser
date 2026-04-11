import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private bird?: Phaser.GameObjects.Image
  private groundTiles: Phaser.GameObjects.Image[] = []
  private pipePair: Phaser.GameObjects.Image[] = []
  private startPanel?: Phaser.GameObjects.Image
  private guideText?: Phaser.GameObjects.Text
  private isWingUp = true
  private isPlaying = false
  private groundSpeed = 220
  private pipeSpeed = 160

  constructor() {
    super('MainScene')
  }

  preload() {
    this.load.svg('background', '/assets/flappy/background.svg', { width: 800, height: 600 })
    this.load.svg('bird-up', '/assets/flappy/bird-up.svg', { width: 72, height: 54 })
    this.load.svg('bird-down', '/assets/flappy/bird-down.svg', { width: 72, height: 54 })
    this.load.svg('pipe', '/assets/flappy/pipe.svg', { width: 96, height: 520 })
    this.load.svg('ground', '/assets/flappy/ground.svg', { width: 800, height: 120 })
    this.load.svg('start-panel', '/assets/flappy/start-panel.svg', { width: 360, height: 160 })
  }

  create() {
    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height)

    this.pipePair = [
      this.add.image(width + 120, -150, 'pipe').setFlipY(true),
      this.add.image(width + 120, height - 260, 'pipe'),
    ]

    this.groundTiles = [
      this.add.image(0, height - 120, 'ground').setOrigin(0, 0).setDisplaySize(width, 120),
      this.add.image(width, height - 120, 'ground').setOrigin(0, 0).setDisplaySize(width, 120),
    ]

    this.bird = this.add.image(220, height / 2, 'bird-up').setScale(1.35)

    this.startPanel = this.add.image(width / 2, 130, 'start-panel')

    this.guideText = this.add
      .text(width / 2, 250, 'Asset preview scene', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '22px',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.time.addEvent({
      delay: 160,
      loop: true,
      callback: () => {
        this.isWingUp = !this.isWingUp
        this.bird?.setTexture(this.isWingUp ? 'bird-up' : 'bird-down')
      },
    })

    this.input.on('pointerdown', () => this.startGame())
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame())
  }

  update(_: number, delta: number) {
    if (!this.isPlaying) {
      return
    }

    const groundMoveAmount = (this.groundSpeed * delta) / 1000
    const pipeMoveAmount = (this.pipeSpeed * delta) / 1000
    const { width } = this.scale

    this.groundTiles.forEach((ground) => {
      ground.x -= groundMoveAmount

      if (ground.x <= -width) {
        ground.x += width * this.groundTiles.length
      }
    })

    this.pipePair.forEach((pipe) => {
      pipe.x -= pipeMoveAmount

      if (pipe.x < -80) {
        pipe.x = width + 120
      }
    })
  }

  private startGame() {
    if (this.isPlaying) {
      return
    }

    this.isPlaying = true
    this.startPanel?.setVisible(false)
  }
}
