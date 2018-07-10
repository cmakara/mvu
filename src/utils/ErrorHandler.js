import Logger from './Logger'

const simpleErrorHandlerWithResult = (error) => {
  simpleErrorHandler(error)
}

const simpleErrorHandler = (error) => {
  if (error) {
    Logger.error(error.message)
    Logger.debug(error.stack)
  }
}

const simplePromiseRejectHandler = (reason, promise) => {
  if (promise) {
    Logger.error(reason)
    Logger.debug(promise)
  }
}

module.exports = {
  simplePromiseRejectHandler,
  simpleErrorHandler,
  simpleErrorHandlerWithResult
}