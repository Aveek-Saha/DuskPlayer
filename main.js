const { app, BrowserWindow, dialog, Menu } = require('electron')
const path = require('path')
const url = require('url')
const join = require('path').join;

const fs = require('fs')
const openAboutWindow = require('about-window').default;

let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 1000, 
    height: 620,
    icon: __dirname + '/dusk.png' })

    var light = false

  fs.readFile('theme.txt', 'utf-8', function (err, buf) {
    if (err)
      return
    var temp = buf.toString();
    if (temp == "light")
      light = true
    // console.log(temp);
  });

  var menu = Menu.buildFromTemplate([
    {
      label: 'Folders',
      accelerator: 'CommandOrControl+o',
      click: function () {
        openFolderDialog()
      }
    },
    {
      label: 'Theme',
      submenu:[
        {
          label: 'Toggle', 
          type: "checkbox",
          checked: light,
          click: function () {
            var theme = ""
            if(light){
              theme = "dark"
              light = false
            }
            else{
              theme = "light"
              light = true
            }
            fs.writeFile('theme.txt', theme, function (err, data) {
                if (err) console.log(err);
              });
            // win.webContents.send('theme-change', msg)
          }
        }
      ]
    },
    {
      label: 'Info',
        click: function () {
            openAboutWindow({ product_name: "Dusk Player", copyright: "By Aveek Saha", icon_path: join(__dirname, 'build/icon.png'),})
        }
    }
  ])
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // fs.readFile('path.txt', 'utf-8', function (err, buf) {
  //   if (err) {
  //     return
  //   }
  //   var temp = [buf.toString()];
  //   scanDir(temp);

  // });

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

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
  dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  }, function (filePath) {

    if (filePath) {
      fs.writeFile('path.txt', filePath, function (err, data) {
        if (err) console.log(err);
      });
      // console.log(filePath);

      scanDir(filePath)
    }
  })
}

function scanDir(filePath) {
  if (!filePath || filePath[0] == 'undefined') return;

  fs.readdir(filePath[0], function (err, files) {
    var arr = [];
    for (var i = 0; i < files.length; i++) {
      if (files[i].substr(-4) === '.mp3' || files[i].substr(-4) === '.m4a'
        || files[i].substr(-5) === '.webm' || files[i].substr(-4) === '.wav'
        || files[i].substr(-4) === '.aac' || files[i].substr(-4) === '.ogg'
        || files[i].substr(-5) === '.opus') {
        arr.push(files[i]);
      }
    }
    // console.log(filePath);
    var objToSend = {};
    objToSend.files = arr;
    objToSend.path = filePath;

    win.webContents.send('selected-files', objToSend)
    // console.log(win.webContents);

  })
}
