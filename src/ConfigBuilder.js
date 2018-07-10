import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'

import Logger from './utils/Logger'

const configUpdaterFactory = new (require('./ConfigUpdaterFactory.js').ConfigUpdaterFactory)()

const defaultConfigName = 'mvu.json'
const obsoleteConfigName = 'phlox.json'

const configurationVariables = {
  'newVersion': 'the version after modification',
  'currentVersion': 'the version before modification'
}

const technologySelection = [
  {
    type: 'checkbox',
    message: 'Select technologies',
    name: 'technologies',
    choices: [
      new inquirer.Separator(' = Buildtools = '),
      { name: 'Gradle' },
      { name: 'Setuptools' },
      { name: 'Npm' },
      { name: 'Leiningen' },
      { name: 'Yarn' },
      new inquirer.Separator(' = Misc tools = '),
      { name: 'Helm' }
    ],
    validate: function (answer) {
      if (answer.length < 1) {
        return 'You must choose at least one technology.'
      }
      return true
    }
  }
]

const configPathQuestion = [
  {
    type: 'input',
    name: 'filePath',
    message: 'TO_FILL',
    default: function () {
      return null
    }
  }
]

const configQuestions = [
  {
    type: 'input',
    name: 'currentVersion',
    message: 'What\'s the current version?',
    default: function () {
      return '1.0.0'
    }
  },
  {
    type: 'input',
    name: 'createCommit',
    message: 'Should the config changes be commited?',
    default: function () {
      return true
    }
  },
  {
    type: 'input',
    name: 'createTag',
    message: 'Should a tag be created?',
    default: function () {
      return true
    }
  },
  {
    type: 'input',
    name: 'tagPattern',
    message: 'How should the tag look?',
    default: function () {
      return 'release-{newVersion}'
    }
  },
  {
    type: 'input',
    name: 'commitMessage',
    message: 'How should the commit message look?',
    default: function () {
      return 'Bump version: {currentVersion} → {newVersion}'
    }
  }
]

class MvuConfig {
  constructor(projectConfig) {
    this.currentVersion = projectConfig['currentVersion']
    configurationVariables['currentVersion'] = this.currentVersion
    this.createCommit = projectConfig['createCommit'] || projectConfig['commit']
    this.createTag = projectConfig['createTag'] || projectConfig['tagCreation']
    this.commitMessage = projectConfig['commitMessage']
    this.tagPattern = projectConfig['tagPattern']
    this.technologies = projectConfig['technologies']
    this.updateIfNeeded()
  }

  async updateVersion(newVersion) {
    this.currentVersion = newVersion
    configurationVariables['newVersion'] = newVersion
  }

  async getCommitMessage() {
    return resolveVariables(this.commitMessage)
  }

  async getTag() {
    return resolveVariables(this.tagPattern)
  }

  updateIfNeeded() {
    for (var tech in this.technologies) {
      if ((typeof this.technologies[tech]) !== 'object') {
        const oldValue = this.technologies[tech]
        this.technologies[tech] = {}
        this.technologies[tech]['configFiles'] = {}
        this.technologies[tech]['configFiles'][oldValue] = oldValue
      }
    }
  }

  async save(configPath) {
    fs.writeFileSync(path.resolve(configPath, defaultConfigName), JSON.stringify(this, null, '  ', 'utf8'))
  }
}

async function prepareQuestion(tech, config) {
  const customizedConfigPathQuestion = JSON.parse(JSON.stringify(configPathQuestion.slice()))
  customizedConfigPathQuestion[0]['message'] = `(${tech}) Where is the file '${config}' located?`
  customizedConfigPathQuestion[0]['default'] = () => {
    return config
  }
  return customizedConfigPathQuestion[0]
}

this.createConfig = async (configPath) => {
  const configDict = {}
  const configFullPath = path.resolve(configPath, defaultConfigName)
  inquirer.prompt(configQuestions).then(async (answers) => {
    configDict = answers
    inquirer.prompt(technologySelection).then(async (answers) => {
      configDict['technologies'] = {}
      const result = await getPathForTechs(configDict, answers)
      writeConfig(result, configFullPath)
    })
  })
}

this.buildConfig = async (configPath) => {
  var projectConfig = {}
  const configFullPath = path.resolve(configPath, defaultConfigName)

  // convert old configuration file if present
  if (fs.existsSync(path.resolve(configPath, obsoleteConfigName))) {
    fs.renameSync(path.resolve(configPath, obsoleteConfigName), configFullPath)
  }

  if (fs.existsSync(configFullPath)) {
    const configData = fs.readFileSync(configFullPath, 'utf8')
    try {
      projectConfig = JSON.parse(configData)
    } catch (e) {
      throw Error(`The mvu.json file is corrupt: \n ${e.message}`)
    }
  } else {
    throw new Error('There is no config for the actual project. Please run \'mvu init\'')
  }
  return new MvuConfig(projectConfig)
}

async function getPathForTechs(configDict, answers) {
  for (var tech of Object.values(answers)[0]) {
    configDict['technologies'][tech] = {}
    configDict['technologies'][tech]['configFiles'] = {}
    for (var config of configUpdaterFactory.getConfigFiles(tech.toLowerCase())) {
      const pathQuestion = await prepareQuestion(tech, config)
      const result = await getPathForTech(pathQuestion)
      configDict['technologies'][tech]['configFiles'][config] = result
    }
  }
  return new Promise(function (resolve) {
    resolve(configDict)
  })
}

async function getPathForTech(customizedConfigPathQuestion) {
  const result = await inquirer.prompt(customizedConfigPathQuestion)
  return new Promise(async (resolve) => {
    resolve(result['filePath'])
  })
}

function writeConfig(configDict, configPath) {
  fs.writeFileSync(configPath, JSON.stringify(configDict, null, '  '))
  Logger.info(`Configuration file created (${configPath})`)
  Logger.info('Please commit this file into version control!')
}

async function resolveVariables(stringToResolve) {
  const variableRegex = /(\{[a-zA-Z]*\})/g
  var result = stringToResolve
  var match
  while ((match = variableRegex.exec(stringToResolve)) !== null) {
    const element = match[0]
    const strippedElement = element.replace('{', '').replace('}', '')
    if (configurationVariables[strippedElement] === null) {
      throw new Error(`Unknown variable: ${strippedElement}`)
    }
    result = result.replace(element, configurationVariables[strippedElement])
  }
  return result
}

module.exports = {
  createConfig: this.createConfig,
  buildConfig: this.buildConfig,
  configurationVariables: configurationVariables,
  MvuConfig: MvuConfig,
  resolveVariables: resolveVariables
}
