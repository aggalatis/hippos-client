let CatalogueClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.getLocalUser();
    this.bindEventsOnButtons();
    this.initializeProductsTable();
    this.getVatsArray();


}


CatalogueClass.prototype.initializeProductsTable = function() {


    let self = this;

    self.productsTable = $('#products-table').DataTable({
        "processing": false,
        "ajax": self.Helpers.LOCAL_API + "Products/All",
        "paging": true,
        "searching": true,
        "ordering": false,
        "bPaginate": false,
        "bInfo": false,
        "columns": [

            {"data": "product_id"},
            {"data": "product_name"},
            {"data": "free_price_text"},
            {"data": "product_price"},
            {"data": "product_vat_percent"},
            {"data": "product_font_size"},
            {"data": "color_text"},
            {
                "data": "product_color",
                "visible": false
            },
            {"data": "product_deleted_text"},
            {"data": "product_order"},
            {
                "defaultContent": "<div class=\"btn-group products-actions\" >\n" +
                "                            <a class=\"btn btn-default edit-product\" style='width: 48%'><i class=\"fa fa-pencil\"></i></a><a class=\"btn btn-default delete-product-btn\" style='width: 48%'><i class=\"fa fa-times\"></i></a>\n" +
                "                          </div>"
            },


        ]
    });


    $('#products-table').on('click', 'a', function () {

        var data = self.productsTable.row($(this).parents('tr')).data();

        if ($(this).hasClass("delete-product-btn")) {


            swal({
                title: "Διαγραφή Προϊόντος?",
                text: "Είστε σίγουροι πως θέλετε να διαγράψετε την προϊόν?",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Άκυρο",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Διαγραφή",
                closeOnConfirm: true
            }, function () {

                $.ajax({
                    url: self.Helpers.LOCAL_API + "Products/" + data.product_id,
                    type: 'delete',
                    dataType: 'json',
                    data: '',
                    success: function (response) {

                        if (response.status === 200) {


                            self.Helpers.toastr('success', response.message)
                        } else {

                            self.Helpers.toastrServerError();

                        }


                        self.productsTable.ajax.reload();
                    },
                    error: function (jqXHR, textStatus) {

                        self.Helpers.swalServerError();
                    }
                });


            });


        } else if ($(this).hasClass("edit-product")) {

            $('#product_id').val(data.product_id);
            $('#product_name').val(data.product_name);
            $('#product_color').val(data.product_color);
            $('#product_order').val(data.product_order);
            $('#product_font_size').val(data.product_font_size);
            $('#product_price').val(data.product_price);
            $('#product_vat').val(data.product_vat_id);

            if (data.product_deleted == 1) {

                $('#product_deleted').prop('checked', 'checked')

            } else {

                $('#product_deleted').prop('checked', null)

            }
            if (data.product_free_price == 1) {

                $('#product_free_price').prop('checked', 'checked')

            } else {

                $('#product_free_price').prop('checked', null)

            }

            $('#product-modal').modal('show');

        } else {

            //console.log(data.product_id)
            $('#prices_product_name').val(data.product_name)

            $('#prices_product_id').val(data.product_id);

            $('#append-pricelist-prices').html('')

            $.ajax({
                url: self.Helpers.LOCAL_API + "Prices/Product/" + data.product_id,
                type: 'GET',
                dataType: 'json',
                data: '',
                success: function (response) {

                    if (response.status === 200) {



                        for(i=0; i < response.data.length; i++) {

                            let vatsString = '';

                            for (j = 0; j< self.vatsArray.length; j++) {

                                if (self.vatsArray[j].vat_id == response.data[i].price_product_vat_id) {

                                    vatsString += "<option value='" + self.vatsArray[j].vat_id +"' selected>" +self.vatsArray[j].vat_percent + "</option>"

                                } else {

                                    vatsString += "<option value='" + self.vatsArray[j].vat_id +"' >" +self.vatsArray[j].vat_percent + "</option>"
                                }

                            }

                            $('#append-pricelist-prices').append("<h5 style='text-align: center; text-decoration:underline'><b>" + response.data[i].pricelist_name +"</b></h5>" +
                                "                    </div><div class=\"form-group col-md-6 col-sm-6\">" +
                                "                                                        <label>Τιμή (€)</label>" +
                                "                                                        <input data-pricelist-id='" + response.data[i].price_pricelist_id +"' type=\"text\" class=\"form-control\" value='" + response.data[i].price_product_price +"'>" +
                                "                                                    </div>" +
                                "                    </div><div class=\"form-group col-md-6 col-sm-6\">" +
                                "                                                        <label>ΦΠΑ</label>" +
                                " <select data-pricelist-id='" +response.data[i].pricelist_id +"' class=\"form-control product-vat-select\">  " +
                                vatsString +
                                "</select></div>" )

                        }

                    } else {

                        self.Helpers.toastrServerError();

                    }



                },
                error: function (jqXHR, textStatus) {

                    self.Helpers.swalServerError();
                }
            });

            $('#prices-modal').modal('show');


        }

    })


}

CatalogueClass.prototype.getVatsArray = function() {

    let self = this;

    $.ajax({
        url: self.Helpers.LOCAL_API + "Vats",
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (response) {

            if (response.status === 200) {

                self.vatsArray = response.vats
                for(i =0; i < self.vatsArray.length; i++) {
                    $('#product_vat').append("<option value='" + self.vatsArray[i].vat_id +"'>" + self.vatsArray[i].vat_percent +"</option>")

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

CatalogueClass.prototype.bindEventsOnButtons = function() {

    let self = this;


    $('#save-product').on('click', function () {

        $(this).attr('disabled', 'disabled');
        $(this).html('Αποθήκευση...');
        self.submitProduct();


    })

    $('#create-product').on('click', function() {

        $('#product_id').val(0);
        $('#product_name').val("");
        $('#product_color').val("#000000");
        $('#product_order').val(0);
        $('#product_font_size').val(0);
        $('#product_price').val("");
        $('#product_vat').val("initialize");
        $('#product_deleted').prop('checked', null)
        $('#product_free_price').prop('checked', null)


        $('#product-modal').modal('show');


    })




}

CatalogueClass.prototype.submitProduct = function() {

    let self = this;
    var product_deleted = 0;
    var product_free_price = 0;
    var product_id = $('#product_id').val();
    if ($('#product_deleted').is(':checked')) {

        product_deleted = 1;

    } else {
        product_deleted = 0;

    }

    if ($('#product_free_price').is(':checked')) {

        product_free_price = 1;

    } else {
        product_free_price = 0;

    }

    let productData = {

        productData: {
            product_id: product_id,
            product_name: $('#product_name').val(),
            product_color: $('#product_color').val(),
            product_order: $('#product_order').val(),
            product_font_size: $('#product_font_size').val(),
            product_price: $('#product_price').val(),
            product_vat_id: $('#product_vat').val(),
            product_deleted: product_deleted,
            product_free_price: product_free_price,
            product_date_created: self.Helpers.getTodayDate()



        }

    }
    console.log(productData)
    if (product_id === "0") {

        //CREATE PRODUCT
        $.ajax({
            url: self.Helpers.LOCAL_API + "Products",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(productData),
            success: function (response) {

                console.log(response)
                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)


                } else {

                    self.Helpers.toastrServerError();

                }


                self.productsTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });


    } else {

        //MODIFY PRODUCT

        $.ajax({
            url: self.Helpers.LOCAL_API + "Products",
            type: 'PUT',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(productData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)


                } else {

                    self.Helpers.toastrServerError();

                }


                self.productsTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });





    }
    $('#product-modal').modal('hide');
    $('#save-product').attr('disabled', null);
    $('#save-product').html('Αποθήκευση');

    self.productsTable.ajax.reload();





}