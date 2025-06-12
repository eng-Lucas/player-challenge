import fs from 'fs'
import path from 'path'
import Logger from '../lib/Logger.js'
import VideoCache from '../lib/VideoCache.js'
import Watchdog from '../lib/Watchdog.js'

/**
 * Class responsible for managing seamless video playback,
 * including transitions, watchdog monitoring, and fallback.
 */
export default class Player {
  /**
   * Initializes video elements, description display, and internal state.
   */
  constructor() {
    /** @type {HTMLVideoElement} */
    const video1 = document.getElementById('video1')

    /** @type {HTMLVideoElement} */
    const video2 = document.getElementById('video2')

    /** @private @type {HTMLElement} */
    this._description = document.getElementById('description')

    /** @private @type {Array<Object>} */
    this._playlist = []

    /** @private @type {number} */
    this._currentIndex = 0

    /** @private @type {HTMLVideoElement} */
    this._currentVideo = video1

    /** @private @type {HTMLVideoElement} */
    this._nextVideo = video2

    /** @private @type {boolean} */
    this._transitionInProgress = false
  }

  /**
   * Starts the player by loading the playlist and playing the first video.
   */
  start() {
    this._visibilityChangeHandler()
    this._loadPlaylist()
    this._playNext()
  }

  /**
   * Loads the playlist from a JSON file and stores it internally.
   * Logs an error if the file cannot be read or parsed.
   *
   * @private
   */
  _loadPlaylist() {
    try {
      const data = fs.readFileSync(path.join(__dirname, '../../data/playlist.json'), 'utf-8')
      const json = JSON.parse(data)
      this._playlist = json.playlist || []

      Logger.log(`Playlist loaded with ${this._playlist.length} items.`)
    } catch (error) {
      Logger.error(`Error loading playlist: ${error}`)
    }
  }

  /**
   * Swaps the current and next video elements.
   *
   * @private
   */
  _swapVideos() {
    const temp = this._currentVideo
    this._currentVideo = this._nextVideo
    this._nextVideo = temp
  }

  /**
   * Resets a video element to a clean state to avoid issues on reuse.
   *
   * @private
   * @param {HTMLVideoElement} video - The video element to reset.
   */
  _cleanupVideo(video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
    video.classList.remove('visible')
    video.oncanplay = null
    video.onplaying = null
    video.onerror = null
    video.onended = null
  }

  /**
   * Plays the next video in the playlist, handling preloading,
   * transitions, watchdog monitoring, and fallbacks on failure.
   *
   * @private
   */
  async _playNext() {
    if (this._playlist.length === 0) {
      Logger.warn('Empty playlist')
      return
    }

    const item = this._playlist[this._currentIndex]
    this._description.textContent = item.description || ''

    this._cleanupVideo(this._nextVideo)

    const localPath = await VideoCache.getVideoPath(item.url)
    this._nextVideo.src = localPath

    // Start watchdog to detect playback freeze
    Watchdog.start(this._nextVideo, () => {
      Logger.debug('Watchdog detected a freeze. Skipping to the next.')

      this._skipToNext()
    })

    this._nextVideo.oncanplay = () => {
      this._nextVideo.play().catch((err) => {
        Logger.error(`Error starting video: ${item.description} - ${item.url} ${err}`)

        this._skipToNext()
      })
    }

    this._nextVideo.onplaying = () => {
      if (this._transitionInProgress) {
        return
      }

      this._transitionInProgress = true

      Logger.debug(`Playing: ${item.description} - ${this._nextVideo.src}`)

      this._nextVideo.classList.add('visible')
      this._currentVideo.classList.remove('visible')

      // Waits briefly to allow fade animation before cleanup
      setTimeout(() => {
        Logger.debug(`Timeout, cleaning up currentVideo`)

        this._cleanupVideo(this._currentVideo)
        this._swapVideos()

        // Assign onended to the new currentVideo (after swap)
        this._currentVideo.onended = () => {
          Logger.debug(`Video finished: ${this._playlist[this._currentIndex].description}`)
          this._transitionInProgress = false
          this._skipToNext()
        }
      }, 600)
    }

    this._nextVideo.onerror = () => {
      Logger.error(`Error loading video: ${item.url}`)
      this._skipToNext()
    }
  }

  /**
   * Advances to the next video in the playlist and starts playback.
   *
   * @private
   */
  _skipToNext() {
    this._transitionInProgress = false
    this._currentIndex = (this._currentIndex + 1) % this._playlist.length
    this._playNext()
  }

  /**
   * Handles visibility changes (e.g., tab hidden/shown).
   * Attempts to resume playback if returning to focus.
   *
   * @private
   */
  _visibilityChangeHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        Logger.debug('App returned to focus')

        if (this._currentVideo && this._currentVideo.paused) {
          this._currentVideo.play().catch((err) => {
            Logger.error(`Error resuming video on return: ${err}`)
          })
        }
      } else {
        Logger.debug('App lost focus (hidden/minimized)')
      }
    })
  }
}
