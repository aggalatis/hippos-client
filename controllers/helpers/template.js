let TemplateClass = function () {
    let self = this
    this.bindPageLoads()
}

TemplateClass.prototype.bindPageLoads = function () {
    let self = this
    $("#load-dashboard").on("click", function () {
        ipcRenderer.send("loadAdminDashboard", self.userData)
    })

    $("#load-catalogue").on("click", function () {
        ipcRenderer.send("loadCatalogue", self.userData)
    })

    $("#load-users").on("click", function () {
        ipcRenderer.send("loadUser", self.userData)
    })

    $("#load-preferences").on("click", function () {
        ipcRenderer.send("loadPreferences", self.userData)
    })

    $("#load-customers").on("click", function () {
        ipcRenderer.send("loadCustomers", self.userData)
    })
}
