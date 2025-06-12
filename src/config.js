import dotenv from 'dotenv'
dotenv.config()

/**
 * Application configuration object.
 *
 * @property {boolean|string} diagnosticsEnabledOnStart - Indicates if diagnostics are enabled on start.
 *   Reads from the DIAGNOSTICS_ENABLED_ON_START environment variable or defaults to false.
 * @property {string} logFilename - The filename for application logs.
 *   Reads from the LOG_FILENAME environment variable or defaults to 'app.log'.
 * @property {boolean} enableDebug - Enables debug logging if the LOG_DEBUG environment variable is set to 'true'.
 */
export const config = {
  diagnosticsEnabledOnStart: process.env.DIAGNOSTICS_ENABLED_ON_START === 'true',
  logFilename: process.env.LOG_FILENAME || 'app.log',
  enableDebug: process.env.LOG_DEBUG === 'true',
}
