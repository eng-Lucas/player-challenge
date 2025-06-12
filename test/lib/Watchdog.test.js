/**
 * @jest-environment jsdom
 */

jest.useFakeTimers()

describe('Watchdog', () => {
  let Watchdog
  let video
  let onFreeze
  let loggerMock

  beforeEach(() => {
    jest.resetModules()

    jest.spyOn(global, 'setInterval')
    jest.spyOn(global, 'clearInterval')

    jest.mock('../../src/lib/Logger.js', () => {
      const logger = {
        debug: jest.fn(),
        warn: jest.fn(),
      }
      logger.__mock = logger
      return { __esModule: true, default: logger }
    })

    // Mock config
    jest.mock('../../src/config.js', () => ({
      config: {
        watchdogTimeout: 5000,
      },
    }))

    Watchdog = require('../../src/lib/Watchdog.js').default
    const loggerModule = require('../../src/lib/Logger.js')
    loggerMock = loggerModule.default.__mock

    video = { currentTime: 10 }
    onFreeze = jest.fn()

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('should start and log debug message', () => {
    Watchdog.start(video, onFreeze)

    expect(loggerMock.debug).toHaveBeenCalledWith('Starting watchdog')
    expect(setInterval).toHaveBeenCalled()
  })

  it('should detect freeze and call onFreeze', () => {
    Watchdog.start(video, onFreeze)
    video.currentTime = 10
    jest.advanceTimersByTime(5000)

    expect(loggerMock.warn).toHaveBeenCalledWith('Watchdog: video stuck at 10s')
    expect(onFreeze).toHaveBeenCalled()
  })

  it('should not call onFreeze if currentTime changed', () => {
    Watchdog.start(video, onFreeze)
    video.currentTime = 11
    jest.advanceTimersByTime(5000)

    expect(loggerMock.warn).not.toHaveBeenCalled()
    expect(onFreeze).not.toHaveBeenCalled()
  })

  it('should not do anything if document is not visible', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
    })

    Watchdog.start(video, onFreeze)
    video.currentTime = 10
    jest.advanceTimersByTime(5000)

    expect(loggerMock.warn).not.toHaveBeenCalled()
    expect(onFreeze).not.toHaveBeenCalled()
  })

  it('should stop interval and log debug message', () => {
    Watchdog.start(video, onFreeze)
    Watchdog.stop()

    expect(clearInterval).toHaveBeenCalled()
    expect(loggerMock.debug).toHaveBeenCalledWith('Stopping watchdog')
  })
})
