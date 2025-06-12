import os from 'os'

export default class Diagnostics {
  start() {
    document.addEventListener('keydown', async (event) => {
      if (event.code === 'F2') {
        const info = await this.getDiagnosticsInfo()
        this.toggleDiagnosticsOverlay(info)
      }
    })
  }

  async getDiagnosticsInfo() {
    return {
      os: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        }
      },
      versions: process.versions
    }
  }

  toggleDiagnosticsOverlay(info) {
    const overlay = document.getElementById('diagnostics-overlay')
    if (!overlay) return

    const isVisible = !overlay.classList.contains('hidden')

    if (isVisible) {
      overlay.classList.add('hidden')
    } else {
      overlay.textContent = JSON.stringify(info, null, 2)
      overlay.classList.remove('hidden')
    }
  }
}
