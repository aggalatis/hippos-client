
const electron = require('electron');
const {app, BrowserWindow, Menu, MenuItem, ipcMain, session} = electron;
const ipcRenderer = require('electron').ipcRenderer;
const machineID = require('node-machine-id');
const ip = require('ip');


global.didClientLogout = false;
global.machineUniqueID = machineID.machineIdSync();
global.ipAddress = ip.address();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// This method will be called when Electron has finished.
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', () => {

    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

    win = new BrowserWindow({
        width: 1024,
        height: 768,
        //frame: false, makes the application to have no frame at all
        webPreferences: {

            nodeIntegration: true

        }
    })
    win.loadFile('controllers/login/login.html')
// win.setMenu(null); //disables the menu and all the shortcuts
win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
})

win.on('close', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
})

ipcMain.on('restart', (event, arg) => {
    //console.log(arg) // prints "ping"
    //event.sender.send('updatePage', 'pong')
    app.relaunch();
app.quit();
})

ipcMain.on('quit', (event, arg) => {
    //console.log(arg) // prints "ping"
    //event.sender.send('updatePage', 'pong')
    app.isQuiting = true;
app.quit();
})




ipcMain.on('loadTakeaway', (event, arg) => {

    win_cashier = new BrowserWindow({

        //frame: false, makes the application to have no frame at all
        webPreferences: {

            nodeIntegration: true

        }})
    win_cashier.loadFile('controllers/takeaway/takeaway.html');
     win_cashier.maximize();
    // win_cashier.setFullScreen(true);
win_cashier.webContents.on('did-finish-load', () => {
    win_cashier.webContents.send('userData', arg)
    if (win)
        win.close();

})

win_cashier.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win_cashier = null
})

})

ipcMain.on('loadCatalogue', (event, arg) => {

    win_admin.loadFile('controllers/admin/catalogue/catalogue.html')

win_admin.webContents.on('did-finish-load', () => {
    win_admin.webContents.send('userData', arg)
})



})
ipcMain.on('loadUser', (event, arg) => {

    win_admin.loadFile('controllers/admin/users/users.html')

win_admin.webContents.on('did-finish-load', () => {
    win_admin.webContents.send('userData', arg)
})

})


ipcMain.on('loadPreferences', (event, arg) => {

    win_admin.loadFile('controllers/admin/preferences/preferences.html')

win_admin.webContents.on('did-finish-load', () => {
    win_admin.webContents.send('userData', arg)
})

})


ipcMain.on('loadDashboard', (event, arg) => {

    win_admin = new BrowserWindow({

        //frame: false, makes the application to have no frame at all
        webPreferences: {

            nodeIntegration: true

        }})
    win_admin.loadFile('controllers/admin/dashboard/dashboard.html')
win_admin.maximize();
win_admin.webContents.on('did-finish-load', () => {
    win_admin.webContents.send('userData', arg)
if (win) {
    win.close();
}

})

})

ipcMain.on('logout', (event, arg) => {

    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
    global.didClientLogout = true;
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        //frame: false, makes the application to have no frame at all
        webPreferences: {

            nodeIntegration: true

        }})
    win.loadFile('controllers/login/login.html')
win.webContents.on('did-finish-load', () => {
    win.webContents.send('notifyLogout', arg)
})
win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
})

win.on('close', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
})

})

})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
    app.quit()
}
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
    createWindow()
}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.