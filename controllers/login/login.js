let LoginClass = function () {
    this.Helpers = new HelpersClass()
    this.Helpers.initSettings()
    ipcRenderer.on("notifyLogout", (event, message) => {
        this.Helpers.toastr("success", "Επιτυχής αποσύνδεση χρήστη " + message.user_name)
        this.Helpers.autologin = false
    })
    var remote = require("electron").remote
    var didClientLogout = remote.getGlobal("didClientLogout")
    var clientUniqueKey = remote.getGlobal("machineUniqueID")
    var clientIp = remote.getGlobal("ipAddress")
    // this.Helpers.submitLicense(clientUniqueKey, clientIp)
    let self = this

    if (self.Helpers.autologin == true && didClientLogout == false) {
        $("#username").val(self.Helpers.autologin_user)
        $("#password").val(self.Helpers.autologin_password)

        self.submitLoginForm()
    }
    self.initializeUsers()

    // setTimeout(function () {
    //     if (self.Helpers.serverKeyStatus == true) {

    //     } else {
    //         swal({
    //             title: "Λήξη άδειας!",
    //             text: "Λήξη άδειας τερματικού. Παρακαλώ επικοινωνήστε με την υποστήριξη.",
    //             type: "error",
    //             showCancelButton: false,
    //             showConfirmButton: false,
    //             cancelButtonText: "Άκυρο",
    //             confirmButtonColor: "#d9534f",
    //             confirmButtonText: "OK",
    //         })
    //     }
    // }, 1000)
}

LoginClass.prototype.initializeUsers = function () {
    //Getting users from local API - appending them in buttons.

    let self = this

    $.ajax({
        contentType: "application/json",
        url: self.Helpers.LOCAL_API + "users",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (!response.data) return
            for (i = 0; i < response.data.length; i++) {
                $("#users-div").append("<button data-username='" + response.data[i].user_name + "'  class='btn btn-primary user-btn'>" + response.data[i].user_name + "</button>")
            }

            $(".user-btn").on("click", function () {
                $("#username").val($(this).data("username"))
            })
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
        },
    })
}

LoginClass.prototype.submitLoginForm = function () {
    let self = this
    var user_name = $("#username").val()
    var user_password = $("#password").val()

    var userData = {
        userData: {
            username: user_name,
            password: user_password,
            login_datetime: self.Helpers.getTodayDate(),
        },
    }

    $.ajax({
        contentType: "application/json",
        url: self.Helpers.LOCAL_API + "users/authenticate",
        type: "POST",
        dataType: "json",
        data: JSON.stringify(userData),
        success: function (response) {
            if (response.status === 200) {
                console.log(response)

                if (response.data.user_role_id == 2) {
                    ipcRenderer.send("loadDashboard", response.data)
                } else {
                    ipcRenderer.send("loadTakeaway", response.data)
                }
            } else {
                swal({
                    title: "Αποτυχία",
                    text: "Το όνομα χρήστη ή ο κωδικός πρόσβασης είναι λάθος. Προσπαθήστε ξανά.",
                    type: "error",
                    showCancelButton: false,
                    showConfirmButton: false,
                    cancelButtonText: "Άκυρο",
                    confirmButtonColor: "#2fdc17",
                    confirmButtonText: "OK",
                    closeOnConfirm: true,
                    timer: 5000,
                })
            }
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
        },
    })
}
