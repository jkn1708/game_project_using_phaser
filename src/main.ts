import Phaser from 'phaser'

import { gameConfig } from './game/config'

const container = document.getElementById('app')

if (!container) {
  throw new Error('Game container "#app" was not found.')
}

container.innerHTML = ''
document.body.style.margin = '0'
document.body.style.backgroundColor = '#101418'

new Phaser.Game(gameConfig)
