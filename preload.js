const Player = require('./dist/player/Player.js').default

window.addEventListener('DOMContentLoaded', () => {
  const player = new Player()
  player.start()
})
