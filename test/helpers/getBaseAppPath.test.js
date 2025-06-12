import path from 'path'

describe('getBaseAppPath', () => {
  let originalPlatform
  let originalEnv
  let os

  beforeEach(() => {
    jest.resetModules()
    originalPlatform = process.platform
    originalEnv = { ...process.env }
    os = require('os')

    jest.spyOn(os, 'homedir').mockReturnValue('/home/testuser')
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    })
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  const mockPlatform = (platform) => {
    Object.defineProperty(process, 'platform', {
      value: platform,
    })
  }

  it('should return path for Windows using LOCALAPPDATA', () => {
    mockPlatform('win32')
    process.env.LOCALAPPDATA = 'C:\\Users\\testuser\\AppData\\Local'

    const getBaseAppPath = require('../../src/helpers/getBaseAppPath').default
    const result = getBaseAppPath()

    expect(result).toBe(path.join('C:\\Users\\testuser\\AppData\\Local', 'player-challenge'))
  })

  it('should fallback to home path on Windows if LOCALAPPDATA is not set', () => {
    mockPlatform('win32')
    delete process.env.LOCALAPPDATA

    const getBaseAppPath = require('../../src/helpers/getBaseAppPath').default
    const result = getBaseAppPath()

    expect(result).toBe(path.join('/home/testuser', 'AppData', 'Local', 'player-challenge'))
  })

  it('should return path for macOS (darwin)', () => {
    mockPlatform('darwin')

    const getBaseAppPath = require('../../src/helpers/getBaseAppPath').default
    const result = getBaseAppPath()

    expect(result).toBe(
      path.join('/home/testuser', 'Library', 'Application Support', 'player-challenge')
    )
  })

  it('should return path for Linux/others', () => {
    mockPlatform('linux')

    const getBaseAppPath = require('../../src/helpers/getBaseAppPath').default
    const result = getBaseAppPath()

    expect(result).toBe(path.join('/home/testuser', '.config', 'player-challenge'))
  })
})
