var Logger = require('./Logger.js')

this.simpleErrorHandlerWithResult = (err) => {
  this.simpleErrorHandler(err)
}

this.simpleErrorHandler = (err) => {
  if (err) {
    Logger.error(err.message)
    Logger.debug(err.stack)
  }
}

this.simplePromiseRejectHandler = (reason, p) => {
  if (p) {
    Logger.error(reason)
    Logger.debug(p)
  }
}
