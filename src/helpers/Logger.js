const fs = require('fs');
const path = require('path');

class Logger {
  constructor(filename = 'player.log', enableDebug = false) {
    this.logPath = path.join(__dirname, '..', filename);
    this.enableDebug = enableDebug;
  }

  _write(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const fullMessage = `${prefix} ${message}\n`;

    // save to file
    fs.appendFileSync(this.logPath, fullMessage);

    // log to console
    switch (level) {
      case 'error':
        console.error(fullMessage.trim());
        break;
      case 'debug':
        if (this.enableDebug) console.debug(fullMessage.trim());
        break;
      default:
        console.log(fullMessage.trim());
    }
  }

  log(message) {
    this._write('log', message);
  }

  debug(message) {
    this._write('debug', message);
  }

  error(message) {
    this._write('error', message);
  }
}

module.exports = Logger;
