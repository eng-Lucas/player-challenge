import fs from 'fs'
import path from 'path'
import Logger from '../helpers/Logger.js'

export default class Player {
  constructor() {
    this.video1 = document.getElementById('video1')
    this.video2 = document.getElementById('video2')
    this.description = document.getElementById('description')
    this.logger = new Logger('player.log', true)

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

      this.logger.log(`Playlist carregada com ${this.playlist.length} itens.`)
    } catch (error) {
      this.logger.error(`Erro ao carregar a playlist: ${error}`)
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

  playNext() {
    if (this.playlist.length === 0) return

    const item = this.playlist[this.currentIndex]
    this.description.textContent = item.description || ''

    this.cleanupVideo(this.nextVideo)

    this.nextVideo.src = item.url
    this.nextVideo.load()

    this.nextVideo.oncanplay = () => {
      this.nextVideo.play().catch((err) => {
        this.logger.error(`Erro ao iniciar o vídeo: ${item.description} - ${item.url} ${err}`)
        this.skipToNext()
      })
    }

    this.nextVideo.onplaying = () => {
      this.logger.debug(`Tocando: ${item.description} - ${item.url}`)

      this.nextVideo.classList.add('visible')
      this.currentVideo.classList.remove('visible')

      setTimeout(() => {
        this.cleanupVideo(this.currentVideo)
        this.swapVideos()

        this.currentVideo.onended = () => {
          this.logger.debug(`Vídeo finalizado: ${this.playlist[this.currentIndex].description}`)
          this.skipToNext()
        }
      }, 1000)
    }

    this.nextVideo.onerror = () => {
      this.logger.error(`Erro ao carregar vídeo: ${item.url}`)
      this.skipToNext()
    }
  }

  skipToNext() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length
    this.playNext()
  }
}
