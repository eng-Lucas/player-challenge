import fs from 'fs'
import path from 'path'
import Logger from '../lib/Logger.js'
import VideoCache from '../lib/VideoCache.js'
import Watchdog from '../lib/Watchdog.js'

export default class Player {
  constructor() {
    const video1 = document.getElementById('video1')
    const video2 = document.getElementById('video2')

    this._description = document.getElementById('description')

    this._playlist = []
    this._currentIndex = 0
    this._currentVideo = video1
    this._nextVideo = video2
    this._transitionInProgress = false
  }

  start() {
    this._visibilityChangeHandler()
    this._loadPlaylist()
    this._playNext()
  }

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

  _swapVideos() {
    const temp = this._currentVideo
    this._currentVideo = this._nextVideo
    this._nextVideo = temp
  }

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

  async _playNext() {
    if (this._playlist.length === 0) {
      return
    }

    const item = this._playlist[this._currentIndex]
    this._description.textContent = item.description || ''

    this._cleanupVideo(this._nextVideo)

    const localPath = await VideoCache.getVideoPath(item.url)

    this._nextVideo.src = localPath

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

      // waits a while to allow the fade before cleaning up
      setTimeout(() => {
        Logger.debug(`Timeout, cleaning up currentVideo`)

        this._cleanupVideo(this._currentVideo)
        this._swapVideos()

        // Updates the new currentVideo (after swap) to handle the end
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

  _skipToNext() {
    this._transitionInProgress = false
    this._currentIndex = (this._currentIndex + 1) % this._playlist.length
    this._playNext()
  }

  _visibilityChangeHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        Logger.debug('App returned to focus')

        if (this._currentVideo && this._currentVideo.paused) {
          this._currentVideo.play().catch(err => {
            Logger.error(`Error resuming video on return: ${err}`)
          })
        }
      } else {
        Logger.debug('App lost focus (hidden/minimized)')
      }
    })
  }
}
