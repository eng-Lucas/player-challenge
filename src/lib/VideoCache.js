import fs from 'fs'
import path from 'path'
import https from 'https'
import { URL } from 'url'
import Logger from './Logger.js'
import { getBaseAppPath } from '../helpers'

/**
 * VideoCache is a singleton class responsible for caching video files locally.
 * It checks if a video is already cached and returns the local path if available,
 * otherwise it downloads the video asynchronously for future use.
 *
 * - Only supports caching of MP4, WebM, and MOV formats.
 * - Skips caching for DASH or unsupported formats.
 * - Generates safe, unique filenames for cached videos.
 *
 * @class
 * @example
 * const localPath = await VideoCache.getVideoPath(videoUrl)
 */
const VideoCache = new (class {
  constructor() {
    const baseDir = getBaseAppPath()
    this._cacheDir = path.join(baseDir, 'cache')

    if (!fs.existsSync(this._cacheDir)) {
      fs.mkdirSync(this._cacheDir, { recursive: true })
    }

    Object.preventExtensions(this)
  }

  async getVideoPath(url) {
    // does not cache DASH or unsupported formats
    const unsupported = !url.match(/\.(mp4|webm|mov)(\?.*)?$/i)
    if (unsupported || url.includes('/dash/')) {
      Logger.debug('Format not supported for cache')
      return url
    }

    const fileName = this._getSafeFileName(url)
    const localPath = path.join(this._cacheDir, fileName)

    if (fs.existsSync(localPath)) {
      Logger.debug(`Video in cache ${localPath}`)
      return localPath
    }

    try {
      // downloads asynchronously. On the next run, it will use from cache
      this._download(url, localPath)

      // returns the video url so you don't have to wait for the download
      return url
    } catch (err) {
      Logger.error(`Error caching video ${url}: ${err}`)

      // remote fallback
      return url
    }
  }


  _getSafeFileName(url) {
    const urlObj = new URL(url)
    const base = path.basename(urlObj.pathname)

    // Avoids dangerous or duplicate names with query
    const hash = Buffer.from(url).toString('base64').replace(/[\/=]/g, '')
    return `${hash}-${base}`
  }

  _download(url, destPath) {
    return new Promise((resolve, reject) => {
      Logger.debug(`Video not cached yet, downloading... ${url}`)

      const file = fs.createWriteStream(destPath)
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(`Status ${response.statusCode} when downloading ${url}`)
          return
        }

        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)

          Logger.debug(`Download finished. File path: ${destPath} `)
        })
      }).on('error', (err) => {
        fs.unlink(destPath, () => reject(err))
      })
    })
  }
})()

export default VideoCache
