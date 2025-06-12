/* eslint-disable no-console */
import fs from 'fs'
import Logger from '../../src/lib/Logger'
import { config } from '../../src/config'

// Mocks
jest.mock('fs')
jest.mock('path', () => ({
  join: jest.fn(() => '/mock/log/path/app.log'),
  resolve: jest.requireActual('path').resolve,
}))
jest.mock('../../src/helpers', () => ({
  getBaseAppPath: jest.fn(() => '/mock/log/path'),
}))

describe('Logger', () => {
  const originalDebug = config.enableDebug
  const logFilePath = '/mock/log/path/app.log'

  beforeEach(() => {
    config.enableDebug = true
    config.logFilename = 'app.log'

    jest.resetModules()
    jest.clearAllMocks()
    jest.mock('fs')
    jest.mock('../../src/helpers', () => ({
      getBaseAppPath: () => '/mock/log/path',
    }))
  })

  afterAll(() => {
    config.enableDebug = originalDebug
  })

  it('should create log directory if it does not exist', () => {
    const fs = require('fs')

    fs.existsSync = jest.fn().mockReturnValue(false)
    fs.mkdirSync = jest.fn()

    jest.doMock('fs', () => fs)
    jest.doMock('../../src/helpers', () => ({
      getBaseAppPath: () => '/mock/log/path',
    }))
    jest.doMock('../../src/config', () => ({
      config: {
        logFilename: 'app.log',
        enableDebug: true,
      },
    }))

    // import Logger after mocks
    require('../../src/lib/Logger').default

    expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/log/path', { recursive: true })
  })

  it('should write to file and console.log on log()', () => {
    fs.existsSync.mockReturnValue(true)
    fs.appendFileSync.mockImplementation(() => {})
    console.log = jest.fn()

    Logger.log('Test log')

    expect(fs.appendFileSync).toHaveBeenCalledWith(logFilePath, expect.stringContaining('Test log'))
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Test log'))
  })

  it('should call console.debug only if debug is enabled', () => {
    // Mock with debug enabled
    jest.doMock('../../src/config', () => ({
      config: {
        logFilename: 'app.log',
        enableDebug: true,
      },
    }))
    const consoleDebug = jest.spyOn(console, 'debug').mockImplementation(() => {})

    const Logger = require('../../src/lib/Logger').default
    Logger.debug('Debug on')

    expect(consoleDebug).toHaveBeenCalledWith(expect.stringContaining('Debug on'))

    // Mock with debug disabled
    jest.resetModules()
    consoleDebug.mockClear()
    jest.doMock('../../src/config', () => ({
      config: {
        logFilename: 'app.log',
        enableDebug: false,
      },
    }))
    const LoggerDisabled = require('../../src/lib/Logger').default
    LoggerDisabled.debug('Debug off')

    expect(consoleDebug).not.toHaveBeenCalled()
  })

  it('should call console.warn on warn()', () => {
    fs.existsSync.mockReturnValue(true)
    fs.appendFileSync.mockImplementation(() => {})
    console.warn = jest.fn()

    Logger.warn('Warning!')

    expect(fs.appendFileSync).toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Warning!'))
  })

  it('should call console.error on error()', () => {
    fs.existsSync.mockReturnValue(true)
    fs.appendFileSync.mockImplementation(() => {})
    console.error = jest.fn()

    Logger.error('Something went wrong')

    expect(fs.appendFileSync).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'))
  })

  it('should log file write error gracefully', () => {
    fs.existsSync.mockReturnValue(true)
    fs.appendFileSync.mockImplementation(() => {
      throw new Error('Disk full')
    })
    console.error = jest.fn()

    Logger.error('Disk issue')

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error saving to log file'))
  })
})
