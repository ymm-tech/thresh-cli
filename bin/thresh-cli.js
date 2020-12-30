#!/usr/bin/env node

const program = require('commander')
const co = require('co')
const prompt = require('co-prompt')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const packageInfo = require('../package.json')

let appName
const tip = ora('正在创建项目...')

program.version(packageInfo.version)
program
  .command('create <appName>')
  .description('创建 Dynamic Flutter 项目')
  .action(async source => {
    appName = source
    await co(function *() {
      const ensureAppName = yield prompt(
        chalk.bold(`使用${appName}作为项目/模块名称?`) +
        chalk.gray(' (y/N) ')
      )
      if (ensureAppName.toUpperCase() === 'N') {
        appName = yield prompt(chalk.bold(`请输入项目/模块名称: `))
        if (!appName) {
          console.log(chalk.red.bold('项目/模块名称不合法！'))
          process.exit()
        }
      }
    })

    try {
      tip.start()
      await checkDir()
      await cloneRepo()
      await modifyPackageInfo()
      await installDependencies()
      tip.stop()
      console.log(chalk.greenBright('创建项目成功'))
    } catch (err) {
      tip.stop()
      if (typeof err === 'string') {
        console.log(chalk.red.bold(err))
      } else {
        console.log(chalk.red.bold('创建项目失败！'))
        console.log(err)
      }
    } finally {
      process.exit()
    }
  })

program.parse(process.argv)
if(process.argv.length <= 2){
  program.help()
}

function checkDir () {
  return new Promise((resolve, reject) => {
    fs.readdir(process.cwd(), (err, res) => {
      if (err) {
        reject(err)
        return
      }
      if (res.indexOf(appName) > -1) {
        reject('当前目录下已存在同名项目，无法创建！')
        return
      }
      resolve()
    })
  })
}

function modifyPackageInfo () {
  return new Promise((resolve, reject) => {
    const packageFilePath = path.resolve(process.cwd(), `./${appName}/package.json`)
    fs.readFile(
      packageFilePath,
      'utf-8',
      (err, data) => {
        if (err) {
          reject(err)
          return
        }
        data = data.replace('thresh-lib-template', appName)
        fs.writeFile(packageFilePath, data, 'utf-8', error => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
  })
}

async function cloneRepo () {
  await execCmd(`git clone git@github.com:ymm-tech/thresh-template.git ${appName} && cd ${appName} && git checkout main`)
  deleteDir(path.resolve(process.cwd(), `./${appName}/.git`))
  deleteFile(path.resolve(process.cwd(), `./${appName}/package-lock.json`))
}

function deleteDir (path) {
  let files = []
    if(fs.existsSync(path)){
      files = fs.readdirSync(path)
      files.forEach(file => {
        let curPath = path + "/" + file
        if(fs.statSync(curPath).isDirectory()){
          deleteDir(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
    fs.rmdirSync(path)
  }
}

function deleteFile (path) {
  if (fs.existsSync(path) && fs.statSync(path).isFile()) {
    fs.unlinkSync(path)
  }
}

async function installDependencies () {
  tip.text = '正在安装依赖，请稍后...'
  await execCmd(`cd ${appName} && yarn install`)
}

function execCmd (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  }) 
}

