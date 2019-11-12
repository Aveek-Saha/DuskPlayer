const { app, BrowserWindow, dialog, Menu } = require('electron')
const path = require('path')
const url = require('url')
const join = require('path').join;
const { autoUpdater } = require("electron-updater");
const fs = require('fs')
const openAboutWindow = require('about-window').default;
const storage = require('electron-json-storage');

const dataPath = storage.getDataPath();

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

  // fs.readFile('theme.txt', 'utf-8', function (err, buf) {
  //   if (err)
  //     return
  //   var temp = buf.toString();
  //   if (temp == "light")
  //     light = true
  //   // console.log(temp);
  // });

  storage.has('settings', function (error, hasKey) {
    if (error) throw error;
    if (hasKey) {
      storage.get('settings', function (error, data) {
        if (error) throw error;
        console.log(data.theme);
        if (data.theme == "light")
          light = true
      });
    }
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
            // fs.writeFile('theme.txt', theme, function (err, data) {
            //     if (err) console.log(err);
            //   });
            // win.webContents.send('theme-change', msg)
            storage.set('settings', { theme: theme }, function (error) {
              if (error) throw error;
            });
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

  storage.has('settings', function (error, hasKey) {
    if (error) throw error;
    if (hasKey) {
      storage.get('settings', function (error, data) {
        if (error) throw error;

        scanDir([data.path.toString()]);
      });
    }
  })

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify();
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
  dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  }, function (filePath) {

    if (filePath) {
      // fs.writeFile('path.txt', filePath, function (err, data) {
      //   if (err) console.log(err);
      // });
      // console.log(walkSync(filePath[0]));

      storage.set('settings', { path: filePath }, function (error) {
        if (error) throw error;
      });

      scanDir(filePath)
    }
  })
}

var walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.substr(-4) === '.mp3' || file.substr(-4) === '.m4a'
        || file.substr(-5) === '.webm' || file.substr(-4) === '.wav'
        || file.substr(-4) === '.aac' || file.substr(-4) === '.ogg'
        || file.substr(-5) === '.opus') {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

function scanDir(filePath) {
  if (!filePath || filePath[0] == 'undefined') return;

  var arr = walkSync(filePath[0]);

  var objToSend = {};
  objToSend.files = arr;
  objToSend.path = filePath;

  win.webContents.send('selected-files', objToSend)

}
