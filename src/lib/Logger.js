/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import { getBaseAppPath } from '../helpers'
import { config } from '../config'

/**
 * Logger utility for logging messages to both file and console with different log levels.
 *
 * @class
 * @classdesc
 * Provides methods to log messages with levels: log, debug, warning, and error.
 * Logs are saved to a file and also output to the console. Debug logs can be enabled or disabled.
 *
 * @property {string} logPath - The full path to the log file.
 * @property {boolean} enableDebug - Indicates if debug logging is enabled.
 *
 * @method log Logs a general message.
 * @param {string} message - The message to log.
 *
 * @method debug Logs a debug message (only if debug is enabled).
 * @param {string} message - The debug message to log.
 *
 * @method warn Logs a warning message.
 * @param {string} message - The warning message to log.
 *
 * @method error Logs an error message.
 * @param {string} message - The error message to log.
 *
 * @private
 * @method _write Handles the actual writing of log messages to file and console.
 * @param {string} level - The log level ('log', 'debug', 'warning', 'error').
 * @param {string} message - The message to log.
 */
const Logger = new (class {
  constructor() {
    const filename = config.logFilename
    const enableDebug = config.enableDebug

    const baseDir = getBaseAppPath()
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })

    this._logPath = path.join(baseDir, filename)
    this._enableDebug = enableDebug

    Object.preventExtensions(this)
  }

  log(message) {
    this._write('log', message)
  }

  debug(message) {
    this._write('debug', message)
  }

  warn(message) {
    this._write('warning', message)
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
      fs.appendFileSync(this._logPath, fullMessage)
    } catch (err) {
      console.error(`[${timestamp}] [ERROR] Erro ao salvar no arquivo de logs ${err}`)
    }

    // log to console
    switch (level) {
      case 'error':
        console.error(fullMessage.trim())
        break
      case 'debug':
        if (this._enableDebug) {
          console.debug(fullMessage.trim())
        }
        break
      case 'warning':
        console.warn(fullMessage.trim())
        break
      default:
        console.log(fullMessage.trim())
    }
  }
})()

export default Logger
