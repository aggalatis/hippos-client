let GovermentClass = function (helpers) {
    this.Helpers = helpers
}

GovermentClass.prototype.searchAfm = function (afm) {
    let self = this
    let searchData = {
        searchData: {
            afm: afm,
            storeID: self.Helpers.store_id,
        },
    }

    $.ajax({
        url: self.Helpers.REMOTE_API + "Government/SearchAfm",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(searchData),
        success: function (response) {
            console.log(response)
            if (response.status === 200) {
                $("#customer_fullname").val(response.data.basic.onomasia)
                $("#customer_tax_office").val(response.data.basic.doy_descr)
                $("#customer_address").val(response.data.basic.postal_address)
                $("#customer_address_number").val(response.data.basic.postal_address_no)
                $("#customer_area").val(response.data.basic.postal_area_description)
                $("#customer_postal_code").val(response.data.basic.postal_zip_code)
                $("#customer_bussiness").val(response.data.epaggelmata.item[0].firm_act_descr)
                self.Helpers.toastr("success", "Επιτυχής ανάκτηση δεδομένων από την ΑΑΔΕ.")
            } else {
                self.Helpers.toastr("error", response.message["0"])
            }
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
        },
    })
}
