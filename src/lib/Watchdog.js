import Logger from './Logger.js'

// Watchdog singleton to monitor video playback and detect freezes
const Watchdog = new (class {
  constructor() {
    this.interval = null
    this.lastTime = null
    this.video = null

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

    this.lastTime = video.currentTime

    // Check every 5 seconds if the video is frozen
    this.interval = setInterval(() => {
      if (!video || video.paused || video.ended) {
        return
      }

      // If the currentTime hasn't changed, the video is frozen
      if (video.currentTime === this.lastTime) {
        Logger.warn(`Watchdog: video stuck at ${video.currentTime}s`)
        this.stop()
        if (typeof onFreeze === 'function') {
          onFreeze.call(this)
        }
      } else {
        this.lastTime = video.currentTime
      }
    }, 5000)
  }

  /**
   * Stops monitoring the video.
   */
  stop() {
    Logger.debug('Stopping watchdog')

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
})()

export default Watchdog
