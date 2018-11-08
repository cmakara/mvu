#!/usr/bin/env node

import gitHandler from './utils/GitHandler'
import Logger from './utils/Logger'
import ErrorHandler from './utils/ErrorHandler'
import Core from './MvuCore'
import program from 'commander'
import packageJson from '../package.json'
import path from 'path'
import ora from 'ora'

program
  .version(packageJson.version)
  .option('-w, --workingDirectory [workingDirectory]', 'Set the working directory', process.cwd())
  .option('-d, --debug', 'Set debug mode instead of info', false)

program
  .command('show-variables')
  .alias('sv')
  .description('show the variables usable in config file')
  .action(function () {
    Logger.info('\nThe following variables can be used in the config file:\n')
    Logger.info(Core.getPrettyConfigurationVariables())
  })

program
  .command('init')
  .alias('in')
  .description('create a configuration file for the current project')
  .action(function () {
    Core.createConfig(path.resolve(program.workingDirectory))
  })

program
  .command('patch')
  .alias('p')
  .description('increments the patch version and does the upgrade')
  .action(function () {
    Core.executeUpgrade(path.resolve(program.workingDirectory), 'patch')
  })

program
  .command('minor')
  .alias('mi')
  .description('increments the minor version and does the upgrade')
  .action(function () {
    Core.executeUpgrade(path.resolve(program.workingDirectory), 'minor')
  })

program
  .command('major')
  .alias('ma')
  .description('increments the major version and does the upgrade')
  .action(function () {
    Core.executeUpgrade(path.resolve(program.workingDirectory), 'major')
  })

program.parse(process.argv)

Logger.setLevel(program.debug ? 'debug' : 'info')

if (process.argv.length < 3) {
  program.help()
}

process.on('uncaughtException', ErrorHandler.simpleErrorHandler)

process.on('unhandledRejection', reason => {
  ErrorHandler.simpleErrorHandler(reason)
  if (Core.shouldRevertRepository()) {
    var spinner = ora()
    spinner.start('Reverting changes')
    try {
      gitHandler.revertRepository(true)
    } catch (e) {
      spinner.fail()
    }
    spinner.succeed()
  }
})
