let LoginClass = function () {

    this.Helpers = new HelpersClass();
    this.initializeUsers();



}


LoginClass.prototype.initializeUsers = function() {

    //Getting users from local API - appending them in buttons.

    let self = this;

    $.ajax({
        contentType: 'application/json',
        url: self.Helpers.LOCAL_API + 'Users',
        type: 'GET',
        dataType: 'json',
        success: function (response) {

            for (i=0; i < response.users.length ; i++) {

                $('#users-div').append("<button data-username='" + response.users[i].user_name + "'  class='btn btn-primary user-btn'>" + response.users[i].user_name + "</button>")

            }

            $('.user-btn').on('click',function() {

                $('#username').val($(this).data("username"))

            })

        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError();
        }
    });




}

LoginClass.prototype.submitLoginForm = function() {

    let self = this;
    var user_name = $('#username').val();
    var user_password = $('#password').val();


    var userData = {

        userData: {

            username: user_name,
            password: user_password,
            login_datetime: self.Helpers.getTodayDate()
        }

    }



    $.ajax({
        contentType: 'application/json',
        url: self.Helpers.LOCAL_API + 'Users/Authenticate',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(userData),
        success: function (response) {

            if (response.status === 200) {

                console.log(response)
                ipcRenderer.send('redirectToTakeaway', response.user)

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
                    timer: 5000
                });

            }


        },
        error: function (jqXHR, textStatus) {

            self.Helpers.swalServerError();

        }
    });





}