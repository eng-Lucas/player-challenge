import path from 'path'
import os from 'os'

const getBaseAppPath = () => {
  const platform = process.platform
  const home = os.homedir()

  if (platform === 'win32') {
    return path.join(
      process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'),
      'player-challenge'
    )
  } else if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'player-challenge')
  } else {
    // Linux and others
    return path.join(home, '.config', 'player-challenge')
  }
}

export default getBaseAppPath
