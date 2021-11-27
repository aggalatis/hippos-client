const electron = require("electron")
const { app, BrowserWindow, Menu, MenuItem, ipcMain, session } = electron
const ipcRenderer = require("electron").ipcRenderer
const machineID = require("node-machine-id")
const ip = require("ip")

global.didClientLogout = false
global.machineUniqueID = machineID.machineIdSync()
global.ipAddress = ip.address()

let win

app.on("ready", () => {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
        },
    })
    win.loadFile("controllers/login/login.html")
    // win.setMenu(null); //disables the menu and all the shortcuts
    win.on("closed", () => {
        win = null
    })

    win.on("close", () => {
        win = null
    })

    ipcMain.on("restart", (event, arg) => {
        app.relaunch()
        app.quit()
    })

    ipcMain.on("quit", (event, arg) => {
        app.isQuiting = true
        app.quit()
    })

    ipcMain.on("loadTakeaway", (event, arg) => {
        win_cashier = new BrowserWindow({
            webPreferences: {
                width: 1024,
                height: 768,
                nodeIntegration: true,
            },
            icon: __dirname + "/assets/icons/hippofront.ico",
        })
        win_cashier.loadFile("controllers/takeaway/takeaway.html")
        // win_cashier.maximize()
        // win_cashier.setFullScreen(true)
        // win_cashier.setMenu(null)
        win_cashier.webContents.on("did-finish-load", () => {
            win_cashier.webContents.send("userData", arg)
            if (win) win.close()
        })

        win_cashier.on("closed", () => {
            win_cashier = null
        })
    })

    ipcMain.on("loadCatalogue", (event, arg) => {
        win_admin.loadFile("controllers/admin/catalogue/catalogue.html")
        win_admin.webContents.on("did-finish-load", () => {
            win_admin.webContents.send("userData", arg)
        })
    })
    ipcMain.on("loadUser", (event, arg) => {
        win_admin.loadFile("controllers/admin/users/users.html")

        win_admin.webContents.on("did-finish-load", () => {
            win_admin.webContents.send("userData", arg)
        })
    })

    ipcMain.on("loadPreferences", (event, arg) => {
        win_admin.loadFile("controllers/admin/preferences/preferences.html")
        // win_admin.setFullScreen(true);
        // win_admin.setMenu(null);
        win_admin.webContents.on("did-finish-load", () => {
            win_admin.webContents.send("userData", arg)
        })
    })

    ipcMain.on("loadAdminDashboard", (event, arg) => {
        win_admin.loadFile("controllers/admin/dashboard/dashboard.html")
        // win_admin.setFullScreen(true);
        // win_admin.setMenu(null);
        win_admin.webContents.on("did-finish-load", () => {
            win_admin.webContents.send("userData", arg)
        })
    })

    ipcMain.on("loadCustomers", (event, arg) => {
        win_admin.loadFile("controllers/admin/customers/customers.html")
        // win_admin.setFullScreen(true);
        // win_admin.setMenu(null);
        win_admin.webContents.on("did-finish-load", () => {
            win_admin.webContents.send("userData", arg)
        })
    })

    ipcMain.on("loadDashboard", (event, arg) => {
        win_admin = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
            },
            icon: __dirname + "/assets/icons/hippofront.ico",
        })
        win_admin.loadFile("controllers/admin/dashboard/dashboard.html")
        win_admin.maximize()
        // win_admin.setFullScreen(true);
        // win_admin.setMenu(null);
        win_admin.webContents.on("did-finish-load", () => {
            win_admin.webContents.send("userData", arg)
            if (win) {
                win.close()
            }
        })
    })

    ipcMain.on("logout", (event, arg) => {
        const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
        global.didClientLogout = true
        win = new BrowserWindow({
            width: 1024,
            height: 768,
            webPreferences: {
                nodeIntegration: true,
            },
            icon: __dirname + "/assets/icons/hippofront.ico",
        })
        win.loadFile("controllers/login/login.html")
        win.webContents.on("did-finish-load", () => {
            win.webContents.send("notifyLogout", arg)
        })
        win.on("closed", () => {
            win = null
        })

        win.on("close", () => {
            win = null
        })
    })
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (win === null) {
        createWindow()
    }
})
