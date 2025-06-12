import fs from 'fs'
import path from 'path'
import https from 'https'
import { URL } from 'url'
import Logger from './Logger.js'
import { getBaseAppPath } from '../helpers'

const VideoCache = new (class {
  constructor() {
    const baseDir = getBaseAppPath()
    this.cacheDir = path.join(baseDir, 'cache')

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true })
    }
  }

  async getVideoPath(url) {
    // não cacheia DASH ou formatos não suportados
    const unsupported = !url.match(/\.(mp4|webm|mov)(\?.*)?$/i)
    if (unsupported || url.includes('/dash/')) {
      Logger.debug('Formato não suportado para cache')
      return url
    }

    const fileName = this._getSafeFileName(url)
    const localPath = path.join(this.cacheDir, fileName)

    if (fs.existsSync(localPath)) {
      Logger.debug(`Video em cache ${localPath}`)
      return localPath
    }

    try {
      // faz o download de forma assincrona. Na próxima execução, usará a partir do cache
      this._download(url, localPath)

      // retorna a url do vídeo para que não seja preciso ficar à espera do download
      return url
    } catch (err) {
      Logger.error(`Erro ao fazer cache do vídeo ${url}: ${err}`)

      // fallback remoto
      return url
    }
  }


  _getSafeFileName(url) {
    const urlObj = new URL(url)
    const base = path.basename(urlObj.pathname)

    // Evita nomes perigosos ou duplicados com query
    const hash = Buffer.from(url).toString('base64').replace(/[\/=]/g, '')
    return `${hash}-${base}`
  }

  _download(url, destPath) {
    return new Promise((resolve, reject) => {
      Logger.debug(`Video ainda não guardado, baixando... ${url}`)
      const file = fs.createWriteStream(destPath)
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(`Status ${response.statusCode} ao baixar ${url}`)
          return
        }

        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
          Logger.debug(`Download concluido. Caminho do arquivo: ${destPath} `)
        })
      }).on('error', (err) => {
        fs.unlink(destPath, () => reject(err))
      })
    })
  }
})()

export default VideoCache
