const settingsFile = require("C:\\hippos\\client\\settings")
let HelpersClass = function () {
    let self = this

    let settings = settingsFile.init()

    self.store_id = settings.store_id
    self.LOCAL_API = settings.LOCAL_API
    self.REMOTE_API = settings.REMOTE_API
    self.autologin = settings.autologin
    self.autologin_user = settings.autologin_user
    self.autologin_password = settings.autologin_password
    self.use_server = settings.use_server
    self.products_height = settings.products_height
    self.products_width = settings.products_width
    self.numpad_input_height = settings.numpad_input_height
    self.numpad_numbers_height = settings.numpad_numbers_height
    self.cart_height = settings.cart_height
    self.send_order_height = settings.send_order_height
    self.admin_report = settings.admin_report
    self.userData = null
    self.serverKeyStatus = false
    self.bindLogout()
}

HelpersClass.prototype.toastr = function ($type, $message) {
    // notification popup
    toastr.options.closeButton = true
    toastr.options.positionClass = "toast-top-right"
    toastr.options.showDuration = 1000
    toastr[$type]($message)
}

HelpersClass.prototype.toastrServerError = function () {
    // notification popup
    toastr.options.closeButton = true
    toastr.options.positionClass = "toast-top-right"
    toastr.options.showDuration = 1000
    toastr["error"]("Αποτυχία. Δοκιμάστε ξανά.")
}

HelpersClass.prototype.swalServerError = function () {
    swal({
        title: "Αποτυχία",
        text: "Αδυναμία επικοινωνίας με το server!",
        type: "error",
        showCancelButton: false,
        showConfirmButton: true,
        cancelButtonText: "Άκυρο",
        confirmButtonColor: "#d9534f",
        confirmButtonText: "OK",
        closeOnConfirm: true,
    })
}

HelpersClass.prototype.getTodayDate = function () {
    var date = new Date()
    date = date.getUTCFullYear() + "-" + ("00" + (date.getUTCMonth() + 1)).slice(-2) + "-" + ("00" + date.getUTCDate()).slice(-2) + " " + ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getUTCMinutes()).slice(-2) + ":" + ("00" + date.getUTCSeconds()).slice(-2)

    return date
}

HelpersClass.prototype.bindLogout = function () {
    let self = this

    $(".logout").on("click", function () {
        let userData = {
            userData: {
                user_id: self.userData.user_id,
            },
        }
        $.ajax({
            contentType: "application/json",
            url: self.LOCAL_API + "users/authenticate/logout",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(userData),
            success: function (response) {
                if (response.status === 200) {
                    $(this).unbind().on("click")
                    ipcRenderer.send("logout", self.userData)
                    require("electron").remote.getCurrentWindow().close()
                } else {
                    self.toastrServerError()
                }
            },
            error: function (jqXHR, textStatus) {
                self.swalServerError()
            },
        })
    })
}

HelpersClass.prototype.getLocalUser = function () {
    let self = this

    require("electron").ipcRenderer.on("userData", (event, message) => {
        if (message) {
            console.log("I have data for user: " + message.user_name)
            $(".navbar-username").html(message.user_name)
            self.userData = message
        }
    })
}

HelpersClass.prototype.submitLicense = function (uniqueID, ipAddress) {
    let self = this
    let licenseObj = {
        terminalData: {
            licenseKey: uniqueID,
            ipAddress: ipAddress,
        },
    }

    $.ajax({
        contentType: "application/json",
        url: self.LOCAL_API + "Terminals",
        type: "POST",
        dataType: "json",
        data: JSON.stringify(licenseObj),
        success: function (response) {
            if (response.status === 200) {
                if (response.message != "") {
                    self.toastr("error", response.message)
                    self.serverKeyStatus = true
                } else {
                    self.serverKeyStatus = true
                }
            } else {
                self.serverKeyStatus = false
            }
        },
        error: function () {
            self.swalServerError()
        },
    })
}

HelpersClass.prototype.changeMysqlDateToNormal = function (dateTime) {
    let explodedDatetime = dateTime.split(" ")

    let dateArray = explodedDatetime[0].split("-")

    return dateArray[2] + "/" + dateArray[1] + "/" + dateArray[0] + " " + explodedDatetime[1]
}
