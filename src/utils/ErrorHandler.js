var Logger = require('./Logger.js')

const simpleErrorHandlerWithResult = (err) => {
  simpleErrorHandler(err)
}

const simpleErrorHandler = (err) => {
  if (err) {
    Logger.error(err.message)
    Logger.debug(err.stack)
  }
}

const simplePromiseRejectHandler = (reason, p) => {
  if (p) {
    Logger.error(reason)
    Logger.debug(p)
  }
}

module.exports = {
  simplePromiseRejectHandler,
  simpleErrorHandler,
  simpleErrorHandlerWithResult
}