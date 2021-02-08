let preferencesClass = function () {

    this.Helpers = new HelpersClass();

    this.Helpers.getLocalUser();
    this.initliazePreferences();
    this.initializeButtons();


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
