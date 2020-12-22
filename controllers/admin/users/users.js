let usersClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.getLocalUser();
    this.initializeUsersTable();
    this.initializeUsersRoleSelect();



}

usersClass.prototype.initializeUsersTable = function() {

    let self = this;

    self.usersTable = $('#users-table').DataTable({
        "processing": false,
        "ajax": self.Helpers.LOCAL_API + "users/All",
        "paging": true,
        "searching": true,
        "ordering": false,
        "bPaginate": false,
        "bInfo": false,
        "columns": [

            {"data": "user_id"},
            {"data": "user_fullname"},
            {"data": "user_name"},
            {"data": "user_role_name"},
            {"data": "status"},
            {"data": "user_date_created"},
            {
                "defaultContent": "<div class=\"btn-group categories-actions\" >\n" +
                "                            <a class=\"btn btn-default edit-user\"><i class=\"fa fa-pencil\"></i></a><a class=\"btn btn-default delete-user\" ><i class=\"fa fa-times\"></i></a>                            \n" +
                "                          </div>"
            },


        ]
    });


    $('#users-table').on('click', 'a', function () {

        var data = self.usersTable.row($(this).parents('tr')).data();

        if ($(this).hasClass("delete-user")) {


            swal({
                title: "Διαγραφή Χρήστη?",
                text: "Είστε σίγουροι πως θέλετε να διαγράψετε το χρήστη? Όλα τα δεδομένα του χρήστη" + data.user_name +" δεν θα είναι διαθέσιμα μετά τη διαγραφή...",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Άκυρο",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Διαγραφή",
                closeOnConfirm: true
            }, function () {

                $.ajax({
                    url: self.Helpers.LOCAL_API + "Users/" + data.user_id,
                    type: 'delete',
                    dataType: 'json',
                    data: '',
                    success: function (response) {

                        if (response.status === 200) {

                            self.Helpers.toastr('success', response.message)

                        } else {

                            self.Helpers.toastrServerError();

                        }


                        self.usersTable.ajax.reload();
                    },
                    error: function (jqXHR, textStatus) {

                        self.Helpers.swalServerError();
                    }
                });


            });


        } else {

            $('#user_id').val(data.user_id);
            $('#user_fullname').val(data.user_fullname);
            $('#user_name').val(data.user_name);
            $('#user_role_id').val(data.user_role_id);
            $('#user_password').val('');

            if (data.user_deleted == 1) {

                $('#user_deleted').prop('checked', 'checked')

            } else {

                $('#user_deleted').prop('checked', null)
            }

            $('#users-modal').modal('show');

        }

    })


}

usersClass.prototype.initializeUsersRoleSelect = function () {

    let self = this;
    $.ajax({
        url: self.Helpers.LOCAL_API + "Usersroles",
        type: 'GET',
        dataType: 'json',
        success: function (response) {

            if (response.status === 200) {

                for (i = 0; i < response.data.length; i++) {

                    $('#user_role_id').append($("<option></option>")
                        .attr("value", response.data[i].user_role_id)
                        .text(response.data[i].user_role_name));

                }

            } else {

                self.Helpers.toastrServerError();

            }


        },
        error: function (jqXHR, textStatus) {

            self.Helpers.swalServerError();
        }
    });





}

usersClass.prototype.bindClickEventOnButtons = function () {

    let self = this;
    $('#save-user').on('click', function() {

        self.submitUser();

    })

    $('#create-user').on('click', function() {
        $('#user_id').val(0)
        $('#user_fullname').val('')
        $('#user_name').val('')
        $('#user_password').val('')
        $('#user_role_id').val(0)
        $('#user_deleted').prop('checked', null)
        $('#users-modal').modal('show')



    })



}

usersClass.prototype.submitUser = function() {

    let self = this;

    $('#save-user').attr('disabled', 'disabled');
    $('#save-user').html('Αποθήκευση...');


    var id = $('#user_id').val();
    var user_deleted = 0;

    if ($('#user_deleted').is(':checked')) {

        user_deleted = 1;

    } else {

        user_deleted = 0;
    }

    let userData = {

        userData: {
            user_id: id,
            user_fullname: $('#user_fullname').val(),
            user_name: $('#user_name').val(),
            user_password: $('#user_password').val(),
            user_role_id: $('#user_role_id').val(),
            user_deleted: user_deleted,
            user_date_created: self.Helpers.getTodayDate()

        }

    }

    if (id == 0) {

        $.ajax({

            url: self.Helpers.LOCAL_API + "Users",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(userData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)

                } else {

                    self.Helpers.toastrServerError();

                }


                self.usersTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });

    } else {


        $.ajax({
            url: self.Helpers.LOCAL_API + "Users",
            type: 'PUT',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(userData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)


                } else {

                    self.Helpers.toastrServerError();

                }


                self.usersTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });
    }

    $('#users-modal').modal('hide');
    $('#save-user').attr('disabled', null);
    $('#save-user').html('Αποθήκευση');
    self.usersTable.ajax.reload();


}