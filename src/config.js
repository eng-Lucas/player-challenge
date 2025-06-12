import dotenv from 'dotenv'
dotenv.config()

/**
 * Application configuration object.
 *
 * @property {boolean|string} diagnosticsEnabledOnStart - Indicates if diagnostics are enabled on start.
 *   Reads from the DIAGNOSTICS_ENABLED_ON_START environment variable or defaults to false.
 * @property {boolean} enableDebug - Enables debug logging if the LOG_DEBUG environment variable is set to 'true'.
 *   Reads from the LOG_DEBUG environment variable.
 * @property {string} logFilename - The filename for application logs.
 *   Reads from the LOG_FILENAME environment variable or defaults to 'app.log'.
 * @property {boolean} watchdogTimeout - The timeout value (in milliseconds) for the application watchdog.
 *   Reads from the WATCHDOG_TIMEOUT environment variable or defaults to 3000.
 */
export const config = {
  diagnosticsEnabledOnStart: process.env.DIAGNOSTICS_ENABLED_ON_START === 'true',
  enableDebug: process.env.LOG_DEBUG === 'true',
  logFilename: process.env.LOG_FILENAME || 'app.log',
  watchdogTimeout: process.env.WATCHDOG_TIMEOUT || 3000,
}
