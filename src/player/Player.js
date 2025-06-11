import fs from 'fs'
import path from 'path'
import Logger from '../helpers/Logger.js'
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
  }

  start() {
    this.loadPlaylist()
    this.playNext()
  }

  loadPlaylist() {
    try {
      const data = fs.readFileSync(path.join(__dirname, '../../assets/playlist.json'), 'utf-8')
      const json = JSON.parse(data)
      this.playlist = json.playlist || []

      Logger.log(`Playlist carregada com ${this.playlist.length} itens.`)
    } catch (error) {
      Logger.error(`Erro ao carregar a playlist: ${error}`)
    }
  }

  swapVideos() {
    const temp = this.currentVideo
    this.currentVideo = this.nextVideo
    this.nextVideo = temp
  }

  cleanupVideo(video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
    video.classList.remove('visible')
    video.oncanplay = null
    video.onplaying = null
    video.onerror = null
    video.onended = null
  }

  async playNext() {
    if (this.playlist.length === 0) return

    const item = this.playlist[this.currentIndex]
    this.description.textContent = item.description || ''

    this.cleanupVideo(this.nextVideo)


    const localPath = await VideoCache.getVideoPath(item.url)

    this.nextVideo.src = localPath

    this.nextVideo.oncanplay = () => {
      this.nextVideo.play().catch((err) => {
        Logger.error(`Erro ao iniciar o vídeo: ${item.description} - ${item.url} ${err}`)
        this.skipToNext()
      })
    }

    this.nextVideo.onplaying = () => {
      Logger.debug(`Tocando: ${item.description} - ${item.url}`)

      this.nextVideo.classList.add('visible')
      this.currentVideo.classList.remove('visible')

      setTimeout(() => {
        this.cleanupVideo(this.currentVideo)
        this.swapVideos()

        this.currentVideo.onended = () => {
          Logger.debug(`Vídeo finalizado: ${this.playlist[this.currentIndex].description}`)
          this.skipToNext()
        }
      }, 1000)
    }

    this.nextVideo.onerror = () => {
      Logger.error(`Erro ao carregar vídeo: ${item.url}`)
      this.skipToNext()
    }
  }

  skipToNext() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length
    this.playNext()
  }
}
