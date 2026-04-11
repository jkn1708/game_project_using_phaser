import { GAME_CONFIG } from '../game/constants'
import { Bird } from '../objects/Bird'
import { Ground } from '../objects/Ground'
import { PipePair } from '../objects/PipePair'
import { GameOverPanel } from '../ui/GameOverPanel'
import { Hud } from '../ui/Hud'

type SceneStartData = {
  autoStart?: boolean
}

export class MainScene extends Phaser.Scene {
  private bird?: Bird
  private ground?: Ground
  private pipePair?: PipePair
  private hud?: Hud
  private startPanel?: Phaser.GameObjects.Image
  private guideText?: Phaser.GameObjects.Text
  private isWingUp = true
  private isPlaying = false
  private isGameOver = false
  private isInvulnerable = false
  private score = 0
  private lives = GAME_CONFIG.maxLives

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
    this.load.svg('heart-full', '/assets/flappy/heart-full.svg', { width: 48, height: 44 })
    this.load.svg('heart-half', '/assets/flappy/heart-half.svg', { width: 48, height: 44 })
    this.load.svg('heart-empty', '/assets/flappy/heart-empty.svg', { width: 48, height: 44 })
  }

  create(data: SceneStartData) {
    this.resetGameState()

    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height)

    this.pipePair = new PipePair(this, height, GAME_CONFIG.pipeGap)
    this.pipePair.reset(width + 120)

    this.ground = new Ground(this, width, height, GAME_CONFIG.groundHeight)
    this.bird = new Bird(this, 220, height / 2)
    this.startPanel = this.add.image(width / 2, 130, 'start-panel')
    this.guideText = this.createGuideText(width)
    this.hud = new Hud(this, width, this.lives)

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
      this.bird?.flap(GAME_CONFIG.flapVelocity)
    }
  }

  update(_: number, delta: number) {
    if (!this.isPlaying || !this.bird || !this.ground || !this.pipePair) {
      return
    }

    this.ground.update(delta, GAME_CONFIG.groundSpeed)
    this.pipePair.update(delta, GAME_CONFIG.pipeSpeed, this.scale.width + 120)

    if (this.pipePair.hasPassed(this.bird.sprite.x)) {
      this.addScore()
    }

    if (this.bird.sprite.getBounds().bottom >= this.ground.getTop()) {
      this.takeDamage()
      return
    }

    if (this.pipePair.isTouching(this.bird.getCollisionBounds()) && !this.isInvulnerable) {
      this.takeDamage()
      return
    }

    this.bird.updateRotation()
  }

  private createGuideText(width: number) {
    return this.add
      .text(width / 2, 250, 'Click or press Space to start', {
        fontFamily: 'Verdana, sans-serif',
        fontSize: '22px',
        color: '#0f172a',
        stroke: '#ffffff',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
  }

  private startGame() {
    if (this.isPlaying) {
      return
    }

    this.isPlaying = true
    this.startPanel?.setVisible(false)
    this.guideText?.setText('Click or press Space to flap')
    this.bird?.enableGravity(GAME_CONFIG.birdGravity)
  }

  private flap() {
    if (this.isGameOver) {
      this.scene.restart({ autoStart: true } satisfies SceneStartData)
      return
    }

    if (!this.isPlaying) {
      this.startGame()
    }

    this.bird?.flap(GAME_CONFIG.flapVelocity)
  }

  private addScore() {
    if (!this.pipePair) {
      return
    }

    this.score += 1
    this.pipePair.markScored()
    this.hud?.setScore(this.score)
  }

  private takeDamage() {
    if (!this.bird || !this.pipePair || this.isInvulnerable) {
      return
    }

    this.lives -= 1
    this.hud?.setLives(this.lives)

    if (this.lives <= 0) {
      this.endGame()
      return
    }

    this.isInvulnerable = true
    this.bird.flap(GAME_CONFIG.flapVelocity * 0.6)
    this.pipePair.reset(this.scale.width + 120)

    this.tweens.add({
      targets: this.bird.sprite,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.bird?.setAlpha(1)
        this.isInvulnerable = false
      },
    })
  }

  private endGame() {
    if (this.isGameOver || !this.bird) {
      return
    }

    this.isPlaying = false
    this.isGameOver = true
    this.bird.stop()
    new GameOverPanel(this, this.scale.width, this.scale.height, this.score, this.lives)
  }

  private resetGameState() {
    this.bird = undefined
    this.ground = undefined
    this.pipePair = undefined
    this.hud = undefined
    this.startPanel = undefined
    this.guideText = undefined
    this.isWingUp = true
    this.isPlaying = false
    this.isGameOver = false
    this.isInvulnerable = false
    this.score = 0
    this.lives = GAME_CONFIG.maxLives
  }
}
