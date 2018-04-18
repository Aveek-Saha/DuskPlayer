const {app, BrowserWindow, dialog, Menu} = require('electron')
  const path = require('path')
  const url = require('url')

const fs = require('fs')  
  
  let win
  
  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({ width: 900, height: 550, icon: __dirname + '/music-player.ico'})

    var menu = Menu.buildFromTemplate([
      {
          label: 'Folders',
          accelerator: 'CommandOrControl+o',
          click: function(){
                openFolderDialog()
              }
      },
      {
          label: 'Info'
      }
  ])
    Menu.setApplicationMenu(menu)
  
    // and load the index.html of the app.
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'app/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  
    // Open the DevTools.
    // win.webContents.openDevTools()
  
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

function openFolderDialog(){
  dialog.showOpenDialog(win,{
    properties: ['openDirectory']
  },function(filePath){
    fs.readdir(filePath[0], function (err, files){
      var arr = [];
      for(var i = 0; i < files.length; i++){
        if (files[i].substr(-4) === '.mp3' || files[i].substr(-4) === '.m4a' 
          || files[i].substr(-4) === '.webm' || files[i].substr(-4) === '.wav'
          || files[i].substr(-4) === '.aac' || files[i].substr(-4) === '.ogg'
          || files[i].substr(-4) === '.opus') {
          arr.push(files[i]);
        }
      }
      console.log(arr);
      var objToSend = {};
      objToSend.files = arr;
      objToSend.path = filePath;
      win.webContents.send('modal-file-content', objToSend)
    })
    
  })
}