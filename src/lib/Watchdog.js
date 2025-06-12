import { config } from '../config.js'
import Logger from './Logger.js'

// Watchdog singleton to monitor video playback and detect freezes
const Watchdog = new (class {
  constructor() {
    this._interval = null
    this._lastTime = null

    Object.preventExtensions(this)
  }

  /**
   * Starts monitoring the given video element for playback freezes.
   * @param {HTMLVideoElement} video - The video element to monitor.
   * @param {Function} onFreeze - Callback to call when a freeze is detected.
   */
  start(video, onFreeze) {
    this.stop()

    Logger.debug('Starting watchdog')

    this._lastTime = video.currentTime

    // Check every 5 seconds if the video is frozen
    this._interval = setInterval(() => {
      // If the window is not active and visible, the player will be paused and this is already handled in the player.
      // When it becomes active again, the player will resume playing from where it stopped.
      if (!video || document.visibilityState !== 'visible') {
        return
      }

      // If the currentTime hasn't changed, the video is frozen
      if (video.currentTime === this._lastTime) {
        Logger.warn(`Watchdog: video stuck at ${video.currentTime}s`)
        this.stop()
        if (typeof onFreeze === 'function') {
          onFreeze.call(this)
        }
      } else {
        this._lastTime = video.currentTime
      }
    }, config.watchdogTimeout)
  }

  /**
   * Stops monitoring the video.
   */
  stop() {
    Logger.debug('Stopping watchdog')

    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }
  }
})()

export default Watchdog
