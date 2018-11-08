/* eslint-env mocha */

import sinon from 'sinon'
import { assert, expect } from 'chai'

import Logger from './Logger'
import { simpleErrorHandler, simpleErrorHandlerWithResult, simplePromiseRejectHandler } from './ErrorHandler'

var loggerInfoStub = null
var loggerDebugStub = null
var loggerErrorStub = null

describe('ErrorHandler', () => {
  beforeEach(function () {
    loggerInfoStub = sinon.stub(Logger, 'info')
    loggerDebugStub = sinon.stub(Logger, 'debug')
    loggerErrorStub = sinon.stub(Logger, 'error')
  })

  afterEach(function () {
    loggerInfoStub.restore()
    loggerDebugStub.restore()
    loggerErrorStub.restore()
  })

  describe('simpleErrorHandlerWithResult', () => {
    it('should log error message', () => {
      simpleErrorHandlerWithResult(new Error('sampleMessage'), 'someresult')
      assert(loggerErrorStub.calledOnce)
    })

    it('should log debug message', () => {
      simpleErrorHandlerWithResult(new Error('sampleMessage'), 'someresult')
      assert(loggerDebugStub.calledOnce)
    })

    it('called with null does nothing', () => {
      simpleErrorHandlerWithResult(null)
      assert(loggerErrorStub.callCount === 0)
    })
  })

  describe('simpleErrorHandler', () => {
    it('should log error message', () => {
      simpleErrorHandler(new Error('sampleMessage'))
      assert(loggerErrorStub.calledOnce)
    })

    it('should log debug message', () => {
      simpleErrorHandler(new Error('sampleMessage'))
      assert(loggerDebugStub.calledOnce)
    })

    it('called with null does nothing', () => {
      simpleErrorHandler(null)
      assert(loggerErrorStub.callCount === 0)
    })
  })

  describe('simplePromiseRejectHandler', () => {
    it('should log reason as error', () => {
      simplePromiseRejectHandler('reason', 'promise')
      assert(loggerErrorStub.calledWith('reason'))
    })

    it('should log promise as debug', () => {
      simplePromiseRejectHandler('reason', 'promise')
      assert(loggerDebugStub.calledWith('promise'))
    })

    it('called with null does nothing', () => {
      simplePromiseRejectHandler(null)
      expect(loggerErrorStub.callCount).to.equal(0)
    })
  })
})
