let preferencesClass = function () {

    this.Helpers = new HelpersClass();

    this.Helpers.getLocalUser();
    this.initliazePreferences();
    this.initializeButtons();
    this.initializeTerminalsTable();


}

preferencesClass.prototype.initliazePreferences = function () {

    let self = this;

    $.ajax({
        url: self.Helpers.LOCAL_API + "Companies",
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (response) {

            if (response.status === 200) {

                $('#company_name').val(response.company.company_name)
                $('#company_vat').val(response.company.company_vat)
                $('#company_emails').val(response.company.company_emails)
                $('#company_branch').val(response.company.company_branch)
                $('#company_mydata_user_id').val(response.company.company_mydata_user_id)
                $('#company_myData_api').val(response.company.company_myData_api),
                $('#company_header').val(response.company.company_header)

            } else {

                self.Helpers.toastrServerError();

            }


        },
        error: function (jqXHR, textStatus) {

            self.Helpers.swalServerError();
        }
    });

}

preferencesClass.prototype.initializeButtons = function () {

    let self = this;
    $('#save-company').on('click', function () {

        let companyData = {

            companyData: {
                company_name: $('#company_name').val(),
                company_vat: $('#company_vat').val(),
                company_emails: $('#company_emails').val(),
                company_branch: $('#company_branch').val(),
                company_mydata_user_id: $('#company_mydata_user_id').val(),
                company_myData_api: $('#company_myData_api').val(),
                company_header: $('#company_header').val(),

            }
        }

        $.ajax({
            url: self.Helpers.LOCAL_API + "Companies",
            type: 'PUT',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(companyData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)
                } else {

                    self.Helpers.toastr('error', response.message);

                }


            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });

    })
}

preferencesClass.prototype.initializeTerminalsTable = function() {

    let self = this;

    self.usersTable = $('#terminals-table').DataTable({
        "processing": false,
        "ajax": self.Helpers.LOCAL_API + "Terminals",
        "paging": false,
        "searching": false,
        "ordering": false,
        "bPaginate": false,
        "bInfo": false,
        "columns": [

            {"data": "terminal_id"},
            {"data": "terminal_name"},
            {"data": "terminal_ip"},
            {"data": "terminal_enabled_date"},
            {"data": "terminal_expire_date"},
            {
                "defaultContent": "<div class=\"btn-group categories-actions\" >\n" +
                "                            <a class=\"btn btn-default delete-terminal\" ><i class=\"fa fa-times\"></i></a>" +
                "                          </div>"
            },


        ]
    });


    $('#terminals-table').on('click', 'a', function () {

        var data = self.usersTable.row($(this).parents('tr')).data();

        if ($(this).hasClass("delete-terminal")) {


            swal({
                title: "Διαγραφή Τερματικού?",
                text: "Είστε σίγουροι πως θέλετε να διαγράψετε το τερματικό " + data.terminal_name +" ?",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Άκυρο",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Διαγραφή",
                closeOnConfirm: true
            }, function () {

                $.ajax({
                    url: self.Helpers.LOCAL_API + "Terminals/" + data.terminal_id,
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
