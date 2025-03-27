// Author: Brendan Weirtz 
// ----------------------

// Importing required modules
const {app, dialog, BrowserWindow, ipcMain} = require('electron');
const {spawn} = require('child_process');
var fs = require("fs");
const portfinder = require('portfinder');
const { response } = require('express');
const path = require('path');

// Application windows
let mainWindow
let appBookUtility

// settings file
var settingDir = app.getPath('userData') + "/settings.json"
var appSettings = {
  minOnRunApp: true
}

var exec = require('child_process').exec;

// Main app --------------------------------------------------

function createWindow () {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    minWidth: 415,
    minHeight: 590,
    width: 415,
    height: 590,
    frame:false,
    transparent: false,
    icon:'icon2.png',
    hasShadow: true
  })
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.loadFile('index.html')
  mainWindow.removeMenu()
  //mainWindow.webContents.openDevTools();
}

// Book report utility ----------------------------------------

function createBookUtilityWindow(){
  portfinder.getPortPromise().then((availablePort) => {
    if(appBookUtility){
      appBookUtility.restore();
      appBookUtility.focus();
    }else{
      appBookUtility = new BrowserWindow({
        width: 1000,
        height: 840,
        minWidth: 600,
        minHeight: 840,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });
      appBookUtility.loadFile('./applications/book-utility/public/loading.html')
      appBookUtility.removeMenu();
      //appBookUtility.webContents.openDevTools();

      function optionsGet(message){
        const options = {
          type: 'error',
          buttons: ['Cancel', 'Yes, please', 'No, thanks'],
          defaultId: 2,
          title: 'error',
          message: message,
          detail: message,
          checkboxLabel: 'Remember my answer',
          checkboxChecked: true
        };
        return options
      }
      
      let server = spawn('node', [path.resolve(__dirname, 'applications/book-utility/server.js'), availablePort]);

      server.stdout.once('data', (data) => {
        console.log("[BU Node Server]: " + data);
        appBookUtility.loadURL('http://localhost:' + availablePort);
        appBookUtility.focus();
      });
      
      server.stderr.on('data', err => {
        // dialog.showMessageBoxSync( err )
        // properties: [
        //       { name: 'issue1' }
        //     ]
        dialog.showMessageBoxSync(null, optionsGet(err.toString()), (response, checkboxChecked) =>{ });
      });
      
      server.on('error', err => {
        // dialog.showMessageBoxSync( err )
        dialog.showMessageBoxSync(null, optionsGet(err.toString()), (response, checkboxChecked) =>{ });
      });
      
      //appBookUtility.webContents.openDevTools();
  
      appBookUtility.on('closed', function () {
        if(server){
          console.log("PORT: " + availablePort + " - Killing node server...");
          server.kill();
          server = null;
          if(!server){
            console.log("PORT: " + availablePort + " - Node server killed...");
          }
        }else{
          console.log("PORT: " + availablePort + " - Node server killed...");
        }
        appBookUtility = null;
      });
  
      appBookUtility.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('[Book Report Utility] Application failed to load: ' + errorCode + " | " + errorDescription);
      })
    }
  });
}

function createExtentionsWindow(){
  appExtensions = new BrowserWindow({
    width: 950,
    height: 650,
    minWidth: 750,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  appExtensions.loadFile('applications/extensions/index.html');
  appExtensions.removeMenu();
  appExtensions.on('closed', function () {
    appExtensions = null;
  })
  // appExtensions.webContents.openDevTools();
}

app.on('ready', function(){
  //create settings file if none exist
  if(!fs.existsSync(settingDir)){
    write_file(settingDir, JSON.stringify(appSettings));
  }
  createWindow();
  read_file(settingDir);
  // mainWindow.webContents.openDevTools();
})

app.on('resize', function(e,x,y){
  mainWindow.setSize(x, y);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
  
})

//navigation -----------------------------------------

ipcMain.on('close-app', (evt, arg) => {
  app.quit();
})

ipcMain.on('minimize-app', () => {
  mainWindow.minimize();
})

// ipcMain.on('create-shortcut', () => {
//   properties: [
//     { name: 'openDirectory' }
//   ]
//   shell.writeShortcutLink(
//     dialog.showOpenDialogSync([mainWindow]), properties
    
//     )
// })

//OneStream ClickOnce -----------------------------------------

var exeProd = "C:\\Windows\\System32\\PresentationHost.exe" + " -launchApplication https://DOMAIN.onestreamcloud.com/OneStreamWeb/ClickOnce/OneStreamDesktop/OneStreamDesktop.application";
var exeQA = "C:\\Windows\\System32\\PresentationHost.exe" + " -launchApplication https://DOMAIN-qa.onestreamcloud.com/OneStreamWeb/ClickOnce/OneStreamDesktop/OneStreamDesktop.application";
var exeDev = "C:\\Windows\\System32\\PresentationHost.exe" + " -launchApplication https://DOMAIN-dev.onestreamcloud.com/OneStreamWeb/ClickOnce/OneStreamDesktop/OneStreamDesktop.application";

var exeProdV8 = "C:\\Windows\\System32\\PresentationHost.exe" + " -launchApplication https://DOMAIN-v8.onestreamcloud.com/OneStreamWeb/ClickOnce/OneStreamDesktop/OneStreamDesktop.application";
var exeQAV8 = "C:\\Windows\\System32\\PresentationHost.exe" + " -launchApplication https://DOMAIN-qa-v8.onestreamcloud.com/OneStreamWeb/ClickOnce/OneStreamDesktop/OneStreamDesktop.application";
var exeDevV8 = "C:\\Windows\\System32\\PresentationHost.exe" + " -launchApplication https://DOMAIN-dev-v8.onestreamcloud.com/OneStreamWeb/ClickOnce/OneStreamDesktop/OneStreamDesktop.application";

ipcMain.on('run-prod', () => {
  exec(exeProd);
  if(appSettings.minOnRunApp){
    mainWindow.minimize();
  }
})

ipcMain.on('run-qa', () => {
  exec(exeQA);
  if(appSettings.minOnRunApp){
    mainWindow.minimize();
  }
})

ipcMain.on('run-dev', () => {
  exec(exeDev);
  if(appSettings.minOnRunApp){
    mainWindow.minimize();
  }
})

ipcMain.on('run-prod-v8', () => {
  exec(exeProdV8);
  if(appSettings.minOnRunApp){
    mainWindow.minimize();
  }
})

ipcMain.on('run-qa-v8', () => {
  exec(exeQAV8);
  if(appSettings.minOnRunApp){
    mainWindow.minimize();
  }
})

ipcMain.on('run-dev-v8', () => {
  exec(exeDevV8);
  if(appSettings.minOnRunApp){
    mainWindow.minimize();
  }
})

// Applications -------------------------------------------

ipcMain.on('appBookUtility', () => {
  createBookUtilityWindow();
})

ipcMain.on('appExtensions', () => {
  createExtentionsWindow();
})

// Application error handlers -----------------------------



//settings file -----------------------------------------

read_file = function(path){
  appSettings = JSON.parse(fs.readFileSync(path));

  //update html form settings
  mainWindow.webContents.once('dom-ready', () =>{
    mainWindow.webContents.send('set-minOnRunApp', appSettings.minOnRunApp)
    console.log("Update Client-Side HTML Settings")
    console.log("Minimize: " + appSettings.minOnRunApp)
  })
}

write_file = function(path, data){
  fs.writeFileSync(path, data);
}

ipcMain.on('setting-minOnRunApp', (event, isChecked) => {
  if(isChecked){
    appSettings.minOnRunApp = true
  }else{
    appSettings.minOnRunApp = false
  }
  write_file(settingDir, JSON.stringify(appSettings));
})