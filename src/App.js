import Player from './player/Player.js'
import Diagnostics from './diagnostics/Diagnostics.js'
import os from 'os'

export default class App {
  constructor() {
    this.player = new Player()
    this.diagnostics = new Diagnostics()
  }

  init() {
    this.player.start()
    this.diagnostics.start()
  }
}
