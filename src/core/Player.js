import fs from 'fs'
import path from 'path'
import Logger from '../lib/Logger.js'
import VideoCache from '../lib/VideoCache.js'

export default class Player {
  constructor() {
    this.video1 = document.getElementById('video1')
    this.video2 = document.getElementById('video2')
    this.description = document.getElementById('description')

    this.playlist = []
    this.currentIndex = 0
    this.currentVideo = this.video1
    this.nextVideo = this.video2
    this.transitionInProgress = false
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
      this.playlist = json.playlist || []

      Logger.log(`Playlist loaded with ${this.playlist.length} items.`)
    } catch (error) {
      Logger.error(`Error loading playlist: ${error}`)
    }
  }

  _swapVideos() {
    const temp = this.currentVideo
    this.currentVideo = this.nextVideo
    this.nextVideo = temp
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
    if (this.playlist.length === 0) return

    const item = this.playlist[this.currentIndex]
    this.description.textContent = item.description || ''

    this._cleanupVideo(this.nextVideo)

    const localPath = await VideoCache.getVideoPath(item.url)

    this.nextVideo.src = localPath

    this.nextVideo.oncanplay = () => {
      this.nextVideo.play().catch((err) => {
        Logger.error(`Error starting video: ${item.description} - ${item.url} ${err}`)
        this._skipToNext()
      })
    }

    this.nextVideo.onplaying = () => {
      if (this.transitionInProgress) return
      this.transitionInProgress = true

      Logger.debug(`Playing: ${item.description} - ${this.nextVideo.src}`)

      this.nextVideo.classList.add('visible')
      this.currentVideo.classList.remove('visible')

      // waits a while to allow the fade before cleaning up
      setTimeout(() => {
        Logger.debug(`Timeout, cleaning up currentVideo`)

        this._cleanupVideo(this.currentVideo)
        this._swapVideos()

        // Updates the new currentVideo (after swap) to handle the end
        this.currentVideo.onended = () => {
          Logger.debug(`Video finished: ${this.playlist[this.currentIndex].description}`)
          this.transitionInProgress = false
          this._skipToNext()
        }
      }, 600)
    }

    this.nextVideo.onerror = () => {
      Logger.error(`Error loading video: ${item.url}`)
      this._skipToNext()
    }
  }

  _skipToNext() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length
    this._playNext()
  }

  _visibilityChangeHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        Logger.debug('App returned to focus')

        if (this.currentVideo && this.currentVideo.paused) {
          this.currentVideo.play().catch(err => {
            Logger.error(`Error resuming video on return: ${err}`)
          })
        }
      } else {
        Logger.debug('App lost focus (hidden/minimized)')
      }
    })
  }
}
