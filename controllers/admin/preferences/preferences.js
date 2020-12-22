let preferencesClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.getLocalUser();

    this.loadPreferencesValues();
    this.bindEventsOnPreferencesBtns();


}

preferencesClass.prototype.loadPreferencesValues = function() {
    let self = this;

    $.ajax({

        url: self.Helpers.LOCAL_API + "Preferences/Catalogue",
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (response) {

            if (response.status === 200) {

                for (i=0; i < response.data.length; i++) {

                    $('#' + response.data[i].preference_name).val(response.data[i].preference_value)

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

preferencesClass.prototype.bindEventsOnPreferencesBtns = function() {

    let self = this;

    $('#save_catelogue_preferences').on('click', function() {

        let preferencesObj = {

            cataloguePrefData: {
                "categories_per_page": $('#categories_per_page').val(),
                "products_per_page": $('#products_per_page').val(),
                "categories_height": $('#categories_height').val(),
                "categories_width": $('#categories_width').val(),
                "products_height": $('#products_height').val(),
                "products_width": $('#products_width').val()

            }

        }

        $.ajax({
            contentType: 'application/json',
            url: self.Helpers.LOCAL_API + "Preferences/Catalogue",
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify(preferencesObj),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr("success", response.message)

                } else {

                    self.Helpers.toastrServerError();

                }


            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });


    })

    $('#catelogue_restore_default').on('click', function() {


        $.ajax({

            url: self.Helpers.LOCAL_API + "Preferences/Catalogue/RestoreDefaults",
            type: 'GET',
            dataType: 'json',
            data: '',
            success: function (response) {

                if (response.status === 200) {

                   self.Helpers.toastr("success", response.message)
                    self.loadPreferencesValues();
                } else {

                    self.Helpers.toastrServerError();

                }


            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });

    })





}