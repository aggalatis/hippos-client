let ModCustomersClass = function () {
    this.bindEventsOnButton()
    this.Helpers = new HelpersClass()
    this.Helpers.initSettings()
}

ModCustomersClass.prototype.bindEventsOnButton = function () {
    let self = this

    $("#add-customer-li").on("click", function () {
        $("#customer_id").val(0)
        $("#customer_fullname").val("")
        $("#customer_branch").val(0)
        $("#customer_vat_number").val("")
        $("#customer_bussiness").val("")
        $("#customer_tax_office").val("")
        $("#customer_phone").val("")
        $("#customer_address").val("")
        $("#customer_address_number").val("")
        $("#customer_area").val("")
        $("#customer_postal_code").val("")
        $("#customer_load").val("ΕΔΡΑ ΜΑΣ")
        $("#customer_destination").val("ΕΔΡΑ ΤΟΥΣ")
        $("#customers-modal").modal("show")
    })

    $("#search-customer").on("click", function () {
        let customerAfm = $("#customer_vat_number").val()
        if (customerAfm == "" || customerAfm.length != 9) {
            self.Helpers.toastr("error", "Ο ΑΦΜ δεν είναι έγκυρος!")
            return
        }
        self.getCustomerInfo(customerAfm, self.Helpers)
    })

    $("#save-customer").on("click", function () {
        $("#save-customerr").attr("disabled", "disabled")
        $("#save-customerr").html("Αποθήκευση...")

        let customerData = {
            customerData: {
                customer_id: 0,
                customer_fullname: $("#customer_fullname").val(),
                customer_phone: $("#customer_phone").val(),
                customer_branch: $("#customer_branch").val(),
                customer_address: $("#customer_address").val(),
                customer_address_number: $("#customer_address_number").val(),
                customer_area: $("#customer_area").val(),
                customer_vat_number: $("#customer_vat_number").val(),
                customer_tax_office: $("#customer_tax_office").val(),
                customer_postal_code: $("#customer_postal_code").val(),
                customer_bussiness: $("#customer_bussiness").val(),
                customer_load: $("#customer_load").val(),
                customer_destination: $("#customer_destination").val(),
                customer_date_created: self.Helpers.getTodayDate(),
            },
        }
        $.ajax({
            url: self.Helpers.LOCAL_API + "customers",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(customerData),
            success: function (response) {
                if (response.status === 200) {
                    self.Helpers.toastr("success", response.data)
                    $("#customers-modal").modal("hide")
                } else {
                    self.Helpers.toastr("error", response.data)
                }
            },
            error: function (jqXHR, textStatus) {
                self.Helpers.swalServerError()
                console.log(jqXHR)
            },
        })

        $("#save-customerr").attr("disabled", null)
        $("#save-customerr").html("Αποθήκευση")
    })
}

ModCustomersClass.prototype.getCustomerInfo = function (customerAfm) {
    let self = this
    $.ajax({
        url: `${self.Helpers.LOCAL_API}customers/searchVat/${customerAfm}`,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            console.log(response)
            if (response.status != 200) {
                self.Helpers.toastr("error", response.message)
                return
            }
            $("#customer_fullname").val(response.data.fullName)
            $("#customer_branch").val(response.data.branch)
            $("#customer_vat_number").val(response.data.vatNumber)
            $("#customer_bussiness").val(response.data.bussiness)
            $("#customer_tax_office").val(response.data.taxOffice)
            $("#customer_address").val(response.data.address)
            $("#customer_address_number").val(response.data.addressNumber)
            $("#customer_area").val(response.data.area)
            $("#customer_postal_code").val(response.data.postalCode)
            $("#customer_load").val("ΕΔΡΑ ΜΑΣ")
            $("#customer_destination").val("ΕΔΡΑ ΤΟΥΣ")
            self.Helpers.toastr("success", `Επιτυχία ανάκτησης δεδομένων από την ΑΑΔΕ!`)
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
            console.log(jqXHR)
        },
    })
}
