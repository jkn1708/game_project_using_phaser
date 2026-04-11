import Phaser from 'phaser'

type SceneStartData = {
  autoStart?: boolean
}

export class MainScene extends Phaser.Scene {
  private bird?: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  private groundTiles: Phaser.GameObjects.Image[] = []
  private pipePair: Phaser.GameObjects.Image[] = []
  private startPanel?: Phaser.GameObjects.Image
  private guideText?: Phaser.GameObjects.Text
  private scoreText?: Phaser.GameObjects.Text
  private gameOverPanel?: Phaser.GameObjects.Container
  private isWingUp = true
  private isPlaying = false
  private isGameOver = false
  private pipeScored = false
  private score = 0
  private groundSpeed = 220
  private pipeSpeed = 160
  private birdGravity = 900
  private flapVelocity = -340

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

  create(data: SceneStartData) {
    this.resetGameState()

    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height)

    this.pipePair = [this.add.image(0, -150, 'pipe').setFlipY(true), this.add.image(0, height - 260, 'pipe')]
    this.resetPipePair(width + 120)

    this.groundTiles = [
      this.add.image(0, height - 120, 'ground').setOrigin(0, 0).setDisplaySize(width, 120),
      this.add.image(width, height - 120, 'ground').setOrigin(0, 0).setDisplaySize(width, 120),
    ]

    this.bird = this.physics.add.image(220, height / 2, 'bird-up').setScale(1.35)
    this.bird.body.allowGravity = false
    this.bird.setCollideWorldBounds(true)

    this.startPanel = this.add.image(width / 2, 130, 'start-panel')

    this.guideText = this.add
      .text(width / 2, 250, 'Click or press Space to start', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '22px',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.scoreText = this.add
      .text(width / 2, 34, String(this.score), {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#0f172a',
        strokeThickness: 6,
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

    this.input.on('pointerdown', () => this.flap())
    this.input.keyboard?.on('keydown-SPACE', () => this.flap())

    if (data.autoStart) {
      this.startGame()
      this.bird?.setVelocityY(this.flapVelocity)
    }
  }

  update(_: number, delta: number) {
    if (!this.isPlaying) {
      return
    }

    const groundMoveAmount = (this.groundSpeed * delta) / 1000
    const pipeMoveAmount = (this.pipeSpeed * delta) / 1000
    const { width } = this.scale
    const groundTop = this.scale.height

    this.groundTiles.forEach((ground) => {
      ground.x -= groundMoveAmount

      if (ground.x <= -width) {
        ground.x += width * this.groundTiles.length
      }
    })

    this.pipePair.forEach((pipe) => {
      pipe.x -= pipeMoveAmount
    })

    if (this.pipePair[0].x < -80) {
      this.resetPipePair(width + 120)
    }

    if (this.bird) {
      if (!this.pipeScored && this.pipePair[0].x < this.bird.x) {
        this.addScore()
      }

      if (this.bird.getBounds().bottom >= groundTop) {
        this.endGame()
        return
      }

      this.bird.setAngle(Phaser.Math.Clamp(this.bird.body.velocity.y / 18, -22, 42))
    }
  }

  private startGame() {
    if (this.isPlaying) {
      return
    }

    this.isPlaying = true
    this.startPanel?.setVisible(false)
    this.guideText?.setText('Click or press Space to flap')
    if (this.bird) {
      this.bird.body.allowGravity = true
    }
    this.bird?.setGravityY(this.birdGravity)
  }

  private flap() {
    if (this.isGameOver) {
      this.scene.restart({ autoStart: true } satisfies SceneStartData)
      return
    }

    if (!this.isPlaying) {
      this.startGame()
    }

    this.bird?.setVelocityY(this.flapVelocity)
  }

  private resetPipePair(x: number) {
    this.pipePair.forEach((pipe) => {
      pipe.x = x
    })
    this.pipeScored = false
  }

  private addScore() {
    this.score += 1
    this.pipeScored = true
    this.scoreText?.setText(String(this.score))
  }

  private endGame() {
    if (this.isGameOver || !this.bird) {
      return
    }

    const { width, height } = this.scale
    const groundTop = height - 120

    this.isPlaying = false
    this.isGameOver = true

    this.bird.setVelocity(0, 0)
    this.bird.body.allowGravity = false
    this.bird.setY(groundTop - this.bird.displayHeight / 2)
    this.bird.setAngle(0)

    this.gameOverPanel = this.add.container(width / 2, height / 2)
    this.gameOverPanel.add([
      this.add.rectangle(0, 0, 360, 220, 0xfff7ed, 0.95).setStrokeStyle(8, 0x7c2d12),
      this.add
        .text(0, -58, 'GAME OVER', {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '34px',
          fontStyle: 'bold',
          color: '#ea580c',
        })
        .setOrigin(0.5),
      this.add
        .text(0, 0, `Score: ${this.score}`, {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#0f172a',
        })
        .setOrigin(0.5),
      this.add
        .text(0, 62, 'Click or Space to restart', {
          fontFamily: 'Verdana, sans-serif',
          fontSize: '18px',
          color: '#475569',
        })
        .setOrigin(0.5),
    ])
  }

  private resetGameState() {
    this.groundTiles = []
    this.pipePair = []
    this.startPanel = undefined
    this.guideText = undefined
    this.scoreText = undefined
    this.gameOverPanel = undefined
    this.isWingUp = true
    this.isPlaying = false
    this.isGameOver = false
    this.pipeScored = false
    this.score = 0
  }
}
