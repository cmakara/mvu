/* eslint-env mocha */

import GitHandler from './GitHandler'
import path from 'path'
import { expect } from 'chai'
import childProcess from 'child_process'
import fs from 'fs'
import osTmpdir from 'os-tmpdir'

var tempDir = path.join(osTmpdir(), 'mvu_test_dir')
GitHandler.setRepositoryPath(tempDir)

describe('GitHandler', () => {
  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      deleteFolderRecursive(tempDir)
    }
    fs.mkdirSync(tempDir)
    childProcess.execSync(`cd ${tempDir} && git init`)
  })
  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      deleteFolderRecursive(tempDir)
    }
  })

  describe('status', async () => {
    it('should give back the uncommited changes', async () => {
      fs.writeFileSync(path.join(tempDir, 'new.file'), 'testdatastring')
      expect(await GitHandler.status()).to.be.eql(['new.file'])
    })
    it('should give back empty array if there are no uncommited changes', async () => {
      expect(await GitHandler.status()).to.be.eql([])
    })
  })
})

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
