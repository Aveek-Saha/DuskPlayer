const { app, BrowserWindow, dialog, Menu } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const openAboutWindow = require('about-window').default
const isDev = require('electron-is-dev');
const storage = require('electron-json-storage')

const dataPath = storage.getDataPath()

if (isDev) {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
    });
}

let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 620,
        icon: __dirname + '/dusk.png',
        webPreferences: {
            nodeIntegration: true
        }
    })

    var light = false
    var dark = false
    var disco = false

    storage.has('theme', function (error, hasKey) {
        if (error) throw error
        if (hasKey) {
            storage.get('theme', function (error, data) {
                if (error) throw error
                // console.log(data.theme)
                if (data.theme == 'light') light = true
                else if (data.theme == 'disco') disco = true
                else dark = true
            })
        }
    })

    function handleClick(menuItem, browserWindow, event) {
        // console.log(menuItem.label.toLowerCase())

        win.webContents.send('theme-change', { theme: menuItem.label.toLowerCase() })
        storage.set('theme', { theme: menuItem.label.toLowerCase() }, function (
            error
        ) {
            if (error) throw error
        })
    }

    /**
     * Because menu buttons on MacOS *require* at least one submenu,
     * store them in variables inorder to modify them if application is
     * running on Mac.
     */
    var openFolder = {
        label: 'Folders',
        accelerator: 'CommandOrControl+o',
        click: function () {
            openFolderDialog()
        }
    }

    var info = {
        label: 'Info',
        click: function () {
            openAboutWindow({
                product_name: 'Dusk Player',
                homepage: 'https://home.aveek.io',
                copyright: 'By Aveek Saha',
                icon_path: path.join(__dirname, 'build/icon.png')
            })
        }
    }

    var theme = {
        label: 'Theme',
        submenu: [
            { label: 'Light', type: 'radio', click: handleClick, checked: light },
            { label: 'Dark', type: 'radio', click: handleClick, checked: dark },
            { label: 'Disco', type: 'radio', click: handleClick, checked: disco }
        ]
    }

    if (process.platform === 'darwin') {
        openFolder = {
            label: 'Folders',
            submenu: [
                {
                    label: 'Open folder',
                    accelerator: 'CommandOrControl+o',
                    click: function () {
                        openFolderDialog()
                    }
                }
            ]
        }

        info = {
            label: 'Info',
            submenu: [
                {
                    label: 'Show info',

                    click: function () {
                        openAboutWindow({
                            product_name: 'Dusk Player',
                            homepage: 'https://home.aveek.io',
                            copyright: 'By Aveek Saha',
                            icon_path: path.join(__dirname, 'build/icon.png')
                        })
                    }
                }
            ]
        }

        createMenuMac(openFolder, theme, info)
    } else {
        createMenuOther(openFolder, theme, info)
    }

    // and load the index.html of the app.
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'public/index.html'),
            protocol: 'file:',
            slashes: true
        })
    )

    // Open the DevTools.
    if (isDev)
        win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', () => {
    createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

function openFolderDialog() {
    // console.log("here");
    dialog.showOpenDialog(
        win,
        {
            properties: ['openDirectory']
        },
        function (filePath) {
            // console.log(filePath);
            if (filePath) {

                storage.set('path', { path: filePath }, function (error) {
                    if (error) throw error
                })                

                scanDir(filePath)
            }
        }
    )
}

var walkSync = function (dir, filelist) {
    files = fs.readdirSync(dir)
    filelist = filelist || []
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist)
        } else {
            if (
                file.endsWith('.mp3')
                || file.endsWith('.m4a')
                || file.endsWith('.webm')
                || file.endsWith('.wav')
                || file.endsWith('.aac')
                || file.endsWith('.ogg')
                || file.endsWith('.opus')
            ) {
                filelist.push(path.join(dir, file))
            }
        }
    })
    return filelist
}


function scanDir(filePath) {
    if (!filePath || filePath[0] == 'undefined') return
    // console.log(filePath);
    
    win.webContents.send('selected-files', filePath)
}

function createMenuOther(openFolder, theme, info) {
    var menu = Menu.buildFromTemplate([openFolder, theme, info])
    Menu.setApplicationMenu(menu)
}

function createMenuMac(openFolder, theme, info) {
    var menu = Menu.buildFromTemplate([
        {
            label: require('electron').app.getName(),
            submenu: [
                {
                    role: 'quit',
                    accelerator: 'Cmd+Q'
                }
            ]
        },
        openFolder,
        theme,
        info
    ])
    Menu.setApplicationMenu(menu)
}
