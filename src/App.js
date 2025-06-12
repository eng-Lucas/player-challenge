import Player from './core/Player.js'
import Diagnostics from './core/Diagnostics.js'

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
