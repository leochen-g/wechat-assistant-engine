const {BrowserWindow, app, ipcMain} = require('electron')
const {startBot, stopBot} = require('./bot/index.js')
const path = require('path')
const fs = require('fs')
const util = require('util')

const TEMPPATH = 'temp'
const basePath = path.join(app.getPath('userData'), TEMPPATH)
fs.mkdir(basePath, {recursive: true}, err => {
    if (err) console.log(`mkdir path: ${basePath} err`)
})

const logPath = basePath + 'upgrade.log'
const logFile = fs.createWriteStream(logPath, {flags: 'w'})

console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n')
    process.stdout.write(util.format.apply(null, arguments) + '\n')
}

console.error = function () {
    logFile.write(util.format.apply(null, arguments) + '\n')
    process.stderr.write(util.format.apply(null, arguments) + '\n')
}
let mainWindow = null
let appTray = null
try {
    require('electron-reloader')(module);
} catch (_) {
}
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        resizable: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,  // 为了解决require 识别问题
            contextIsolation: false, //允许渲染进程使用Nodejs
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('index.html')
    // 打开开发工具
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        handleStopBot()
    })
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    // 监听前端页面调用的方法
    ipcMain.handle('startBot', handleStartBot)
    ipcMain.on('stopBot', handleStopBot)
})


// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
        handleStopBot()
    }
})

function handleStartBot(event, key, secret, hookPort = 8089, serverPort = 8055) {
    startBot({apiKey: key, apiSecret: secret, hookPort, serverPort})
    return logPath
}

function handleStopBot() {
    stopBot()
    app.quit()
}
