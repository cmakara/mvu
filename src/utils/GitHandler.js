import rimraf from 'rimraf'
import fs from 'fs'
import simpleGit from 'simple-git'

import Logger from './Logger'

var repositoryLocation = __dirname

function setRepositoryPath(newPath) {
  repositoryLocation = newPath
  if (fs.existsSync(repositoryLocation)) {
    rimraf.sync(repositoryLocation)
  }
  fs.mkdirSync(repositoryLocation)
  Logger.debug('Git repository path:', repositoryLocation)
}

function getRepositoryPath() {
  return repositoryLocation
}

const status = async () => {
  return new Promise(async (resolve, reject) => {
    await simpleGit(repositoryLocation).status(function (err, status) {
      if (err !== null) {
        reject(err)
      }
      resolve(status['files'].map(file => file['path']))
    })
  })
}

const getCurrentBranch = async () => {
  return new Promise(async (resolve) => {
    await simpleGit(repositoryLocation).branch(function (err, summary) {
      if (err !== null) {
        throw err
      }

      resolve(summary['current'])
    })
  })
}

// todo: handle remote name properly
const pushToRemote = async (elementToPush) => {
  const repository = simpleGit(repositoryLocation).silent(true)
  return new Promise(async (resolve, reject) => {
    await repository.push(['origin', elementToPush], function (err, result) {
      if (err !== null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

const pushBranch = async (branch) => {
  return pushToRemote(branch)
}

const pushTag = async (tag) => {
  await pushToRemote(tag)
}

const createTag = async (tagName) => {
  return new Promise(async (resolve, reject) => {
    await simpleGit(repositoryLocation).addTag(tagName, function (err, result) {
      if (err !== null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

const createCommit = async (message = '') => {
  return new Promise(async (resolve, reject) => {
    await simpleGit(repositoryLocation).add('./*').commit(message, function (err, result) {
      if (err !== null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

const revertRepository = async (hard = true) => {
  const mode = hard ? '--hard' : '--soft'
  return new Promise(async (resolve, reject) => {
    await simpleGit(repositoryLocation).reset([mode], function (err, result) {
      if (err !== null) {
        reject(err)
      }
      resolve(result)
    })
  })
}

module.exports = {
  status,
  getCurrentBranch,
  pushTag,
  pushBranch,
  createTag,
  createCommit,
  revertRepository,
  getRepositoryPath,
  setRepositoryPath
}