import os from 'os'

export default class Diagnostics {
  constructor() {
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

  async toggleDiagnosticsOverlay(info) {
    let overlay = document.getElementById('diagnostics-overlay')

    if (overlay) {
      // remove if is already visible
      overlay.remove()
      return
    }

    overlay = document.createElement('pre')
    overlay.id = 'diagnostics-overlay'
    overlay.textContent = JSON.stringify(info, null, 2)
    overlay.style.position = 'absolute'
    overlay.style.top = '0'
    overlay.style.right = '0'
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    overlay.style.color = 'lime'
    overlay.style.padding = '1rem'
    overlay.style.margin = '1rem'
    overlay.style.zIndex = '9999'
    overlay.style.maxWidth = '400px'
    overlay.style.fontSize = '12px'
    overlay.style.overflow = 'auto'
    overlay.style.whiteSpace = 'pre-wrap'

    document.body.appendChild(overlay)
  }
}
