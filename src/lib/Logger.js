import fs from 'fs'
import path from 'path'
import { getBaseAppPath } from '../helpers'

const Logger = new (class {
  constructor(filename = 'app.log', enableDebug = true) {
    const baseDir = getBaseAppPath()
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })

    this.logPath = path.join(baseDir, filename)
    this.enableDebug = enableDebug
  }

  log(message) {
    this._write('log', message)
  }

  debug(message) {
    this._write('debug', message)
  }

  error(message) {
    this._write('error', message)
  }

  _write(level, message) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    const fullMessage = `${prefix} ${message}\n`

    try {
    // save to file
    fs.appendFileSync(this.logPath, fullMessage)
    } catch (err) {
      console.error(`[${timestamp}] [ERROR] Erro ao salvar no arquivo de logs ${err}`)
    }

    // log to console
    switch (level) {
      case 'error':
        console.error(fullMessage.trim())
        break
      case 'debug':
        if (this.enableDebug) {
          console.debug(fullMessage.trim())
        }
        break
      default:
        console.log(fullMessage.trim())
    }
  }
})()

export default Logger
