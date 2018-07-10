'use strict'

import winston from 'winston'

class Logger {
  constructor() {
    this.logger = new winston.Logger({
      transports: [
        new (winston.transports.Console)({
          showLevel: false,
          colorize: 'all',
          level: 'info'
        })
      ]
    })
  }

  info(message) {
    this.logger.info(message)
  }

  warn(message) {
    this.logger.warn(message)
  }

  error(message) {
    this.logger.error(message)
  }

  verbose(message) {
    this.logger.log('verbose', message)
  }

  debug(message) {
    this.logger.debug(message)
  }

  setLevel(level) {
    this.logger.level = level
  }
}

const instance = new Logger()

module.exports = instance
