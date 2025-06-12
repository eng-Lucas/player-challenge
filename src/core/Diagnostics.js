import os from 'os'
import { config } from '../config'

/**
 * Diagnostics class provides functionality to display system and environment diagnostics information.
 * It can toggle a diagnostics overlay on the page, showing details such as OS, CPU, memory, and Node.js versions.
 *
 * @export
 * @class Diagnostics
 */
export default class Diagnostics {
  start() {
    if (config.diagnosticsEnabledOnStart) {
      this._toggleDiagnosticsOverlay()
    }

    document.addEventListener('keydown', (event) => {
      if (event.code === 'F2') {
        this._toggleDiagnosticsOverlay()
      }
    })
  }

  async _getDiagnosticsInfo() {
    return {
      os: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
        },
      },
      versions: process.versions,
    }
  }

  async _toggleDiagnosticsOverlay() {
    const overlay = document.getElementById('diagnostics-overlay')
    if (!overlay) {
      return
    }

    const isVisible = !overlay.classList.contains('hidden')

    if (isVisible) {
      overlay.classList.add('hidden')
    } else {
      const info = await this._getDiagnosticsInfo()

      overlay.textContent = JSON.stringify(info, null, 2)
      overlay.classList.remove('hidden')
    }
  }
}
