let CatalogueClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.getLocalUser();
    this.initializePricelistsTable();
    this.initializeCategoriesTable();
    this.initializeProductsTable();
    this.initializeModesSelect();
    this.getVatsArray();


}


CatalogueClass.prototype.initializePricelistsTable = function () {


    let self = this;
    var pricelistsTable = $('#pricelists-table').DataTable({
        "processing": false,
        "ajax": self.Helpers.LOCAL_API + "Pricelists",
        "paging": false,
        "searching": false,
        "ordering": false,
        "bPaginate": false,
        "bInfo": false,
        "columns": [

            {"data": "pricelist_id"},
            {"data": "pricelist_name"},
            {"data": "mode_name"},
            {"data": "pricelists_date_created"},
            {"data": "pricelists_status"},
            {"data": "pricelist_date_deleted"},
            {
                "defaultContent": "<div class=\"btn-group pricelists-actions\" >\n" +
                "                            <a class=\"btn btn-default edit-pricelist\"><i class=\"fa fa-pencil\"></i></a><a class=\"btn btn-default delete-pricelist\" ><i class=\"fa fa-times\"></i></a>                            \n" +
                "                          </div>"
            },


        ]
    });

    self.myPricelistTable = pricelistsTable;
    $('#pricelists-table').on('click', 'a', function () {

        var data = pricelistsTable.row($(this).parents('tr')).data();

        if ($(this).hasClass("delete-pricelist")) {

            swal({
                title: "Διαγραφή Τιμοκαταλόγου?",
                text: "Είστε σίγουροι πως θέλετε να διαγράψετε τον τιμοκατάλογο? Όλα τα δεδομένα δεν θα είναι διαθέσιμα μετά τη διαγραφή...",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Άκυρο",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Διαγραφή",
                closeOnConfirm: true
            }, function () {

                $.ajax({
                    url: self.Helpers.LOCAL_API + "Pricelists/" + data.pricelist_id,
                    type: 'delete',
                    dataType: 'json',
                    data: '',
                    success: function (response) {

                        if (response.status === 200) {

                            self.Helpers.toastr('success' , response.message)
                        } else {

                            self.Helpers.toastrServerError();

                        }


                        pricelistsTable.ajax.reload();
                    },
                    error: function (jqXHR, textStatus) {

                        self.Helpers.swalServerError();
                    }
                });


            });


        } else {

            $('#pricelist_id').val(data.pricelist_id)
            $('#pricelist_name').val(data.pricelist_name)
            $('#pricelist_mode_id').val(data.pricelist_mode_id)
            $('#pricelist-modal').modal('show');

            if (data.pricelist_deleted == 0) {

                $('#pricelist_deleted').prop('checked', null)

            } else {

                $('#pricelist_deleted').prop('checked', 'checked')
            }

        }

    })


}

CatalogueClass.prototype.initializeCategoriesTable = function () {


    let self = this;
    self.categoriesTable = $('#categories-table').DataTable({
        "processing": false,
        "ajax": self.Helpers.LOCAL_API + "Categories/All",
        "paging": true,
        "searching": true,
        "ordering": false,
        "bPaginate": false,
        "bInfo": false,
        "columns": [

            {"data": "category_id"},
            {"data": "category_name"},
            {"data": "category_color_div"},
            {"data": "is_subcategory"},
            {"data": "root_category_name"},
            {"data": "category_order"},
            {"data": "category_font_size"},
            {"data": "category_status"},
            {
                "defaultContent": "<div class=\"btn-group categories-actions\" >\n" +
                "                            <a class=\"btn btn-default edit-category\"><i class=\"fa fa-pencil\"></i></a><a class=\"btn btn-default delete-category\" ><i class=\"fa fa-times\"></i></a>                            \n" +
                "                          </div>"
            },


        ]
    });


    $('#categories-table').on('click', 'a', function () {

        var data = self.categoriesTable.row($(this).parents('tr')).data();

        if ($(this).hasClass("delete-category")) {


            swal({
                title: "Διαγραφή Κατηγορίας?",
                text: "Είστε σίγουροι πως θέλετε να διαγράψετε την κατηγορία? Όλα τα δεδομένα δεν θα είναι διαθέσιμα μετά τη διαγραφή...",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Άκυρο",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Διαγραφή",
                closeOnConfirm: true
            }, function () {

                $.ajax({
                    url: self.Helpers.LOCAL_API + "Categories/" + data.category_id,
                    type: 'delete',
                    dataType: 'json',
                    data: '',
                    success: function (response) {

                        if (response.status === 200) {


                            self.Helpers.toastr('success', response.message)

                        } else {

                            self.Helpers.toastrServerError();

                        }


                        self.categoriesTable.ajax.reload();
                    },
                    error: function (jqXHR, textStatus) {

                        self.Helpers.swalServerError();
                    }
                });


            });


        } else {

            $('#category_id').val(data.category_id);
            $('#category_name').val(data.category_name);
            $('#category_color').val(data.category_color);
            $('#category_order').val(data.category_order);
            $('#category_font_size').val(data.category_font_size);

            if (data.category_subcategory == 1) {

                $('#category_is_subcategory').prop('checked', 'checked')
                $('#div_category_root_category').show();
                $('#category_root_category').val(data.category_root_category)

            } else {

                $('#category_is_subcategory').prop('checked', null)
                $('#category_root_category').val(0)
            }

            if (data.category_deleted == 1) {

                $('#category_deleted').prop('checked', 'checked')

            } else {

                $('#category_deleted').prop('checked', null)
            }


            $('#category-modal').modal('show');

        }

    })


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
            {"data": "category_name"},
            {"data": "is_freeprice"},
            {"data": "is_weighed"},
            {"data": "product_font_size"},
            {"data": "product_color_div"},
            {"data": "product_order"},
            {"data": "status"},
            {
                "defaultContent": "<div class=\"btn-group products-actions\" >\n" +
                "                            <a class=\"btn btn-default edit-product\" style='width: 33%'><i class=\"fa fa-pencil\"></i></a><a class=\"btn btn-default edit-prices-btn\" style='width: 33%'><i class=\"fa fa-dollar\"></i></a><a class=\"btn btn-default delete-product-btn\" style='width: 33%'><i class=\"fa fa-times\"></i></a>                            \n" +
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
            $('#product_category_id').val(data.product_category_id);

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
            if (data.product_weighed == 1) {

                $('#product_weighed').prop('checked', 'checked')

            } else {

                $('#product_weighed').prop('checked', null)

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

CatalogueClass.prototype.initializeModesSelect = function () {

    //Get enabled modes for selection

    let self = this;
    $.ajax({
        url: self.Helpers.LOCAL_API + "Modes",
        type: 'GET',
        dataType: 'json',
        success: function (response) {

            if (response.status === 200) {

                for (i = 0; i < response.modes.length; i++) {

                    $('#pricelist_mode_id').append($("<option></option>")
                        .attr("value", response.modes[i].mode_id)
                        .text(response.modes[i].mode_name));

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

CatalogueClass.prototype.submitPricelist = function () {

    let self = this;

    var id = $('#pricelist_id').val();
    var pricelist_deleted = 0;

    if ($('#pricelist_deleted').is(':checked')) {

        pricelist_deleted = 1

    } else {

        pricelist_deleted = 0;

    }

    let pricelistData = {

        pricelistData: {

            pricelist_id: $('#pricelist_id').val(),
            pricelist_name: $('#pricelist_name').val(),
            pricelist_mode_id: $('#pricelist_mode_id').val(),
            datetime: self.Helpers.getTodayDate(),
            pricelist_deleted: pricelist_deleted


        }


    }


    if (id == 0) {

        $.ajax({

            url: self.Helpers.LOCAL_API + "Pricelists",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(pricelistData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)

                } else {

                    self.Helpers.toastrServerError();

                }


                self.myPricelistTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });

    } else {


        $.ajax({
            url: self.Helpers.LOCAL_API + "Pricelists",
            type: 'PUT',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(pricelistData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)

                } else {

                    self.Helpers.toastrServerError();

                }


                self.myPricelistTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });
    }

    $('#pricelist-modal').modal('hide');
    $('#save-pricelist').attr('disabled', null);
    $('#save-pricelist').html('Αποθήκευση');

}

CatalogueClass.prototype.submitCategory = function() {


    let self = this;

    var id = $('#category_id').val();
    var category_subcategory = 0;
    var category_deleted = 0;
    var category_root_category = 0;
    if ($('#category_is_subcategory').is(':checked')) {

        category_subcategory = 1;
        category_root_category = $('#category_root_category').val();
    }
    if ($('#category_deleted').is(':checked')) {

        category_deleted = 1;
    }


    let categoryData = {

        categoryData: {

            category_id: id,
            category_name: $('#category_name').val(),
            category_color: $('#category_color').val(),
            category_subcategory: category_subcategory,
            category_root_category: category_root_category,
            category_order: ($('#category_order').val() == "") ? 0 : $('#category_order').val(),
            category_font_size: ($('#category_font_size').val() == "") ? 15 : $('#category_font_size').val(),
            category_deleted: category_deleted,
            datetime: self.Helpers.getTodayDate()


        }


    }


    if (id == 0) {

        $.ajax({

            url: self.Helpers.LOCAL_API + "Categories",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(categoryData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)

                } else {

                    self.Helpers.toastrServerError();

                }


                self.categoriesTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });

    } else {


        $.ajax({
            url: self.Helpers.LOCAL_API + "Categories",
            type: 'PUT',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(categoryData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)


                } else {

                    self.Helpers.toastrServerError();

                }


                self.categoriesTable.ajax.reload();
            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });
    }

    $('#category-modal').modal('hide');
    $('#save-category').attr('disabled', null);
    $('#save-category').html('Αποθήκευση');
    self.categoriesTable.ajax.reload();



}

CatalogueClass.prototype.submitProduct = function() {

    let self = this;
    var product_deleted = 0;
    var product_free_price = 0;
    var product_weighed = 0;
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
    if ($('#product_weighed').is(':checked')) {

        product_weighed = 1;

    } else {

        product_weighed = 0;

    }

    let productData = {

        productData: {
            product_id: product_id,
            product_name: $('#product_name').val(),
            product_color: $('#product_color').val(),
            product_order: $('#product_order').val(),
            product_font_size: $('#product_font_size').val(),
            product_category_id: $('#product_category_id').val(),
            product_deleted: product_deleted,
            product_weighed: product_weighed,
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

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)


                } else {

                    self.Helpers.toastrServerError();

                }


                self.categoriesTable.ajax.reload();
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


                self.categoriesTable.ajax.reload();
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

CatalogueClass.prototype.bindEventsOnButtons = function() {

    let self = this;

    $('#create-pricelist').on('click', function () {

        $('#pricelist_id').val(0);
        $('#pricelist_name').val("")
        $('#pricelist_mode_id').val(1)
        $('#pricelist_deleted').prop('checked', null)

        $('#pricelist-modal').modal('show');


    })


    $('#save-pricelist').on('click', function () {

        $(this).attr('disabled', 'disabled');
        $(this).html('Αποθήκευση...');
        self.submitPricelist();


    })

    $('#save-category').on('click', function () {

        $(this).attr('disabled', 'disabled');
        $(this).html('Αποθήκευση...');
        self.submitCategory();


    })

    $('#save-product').on('click', function () {

        $(this).attr('disabled', 'disabled');
        $(this).html('Αποθήκευση...');
        self.submitProduct();


    })


    $('#create-category').on('click', function () {

        $('#category_id').val(0);
        $('#category_name').val("");
        $('#category_color').val("#000000");
        $('#category_order').val(0);
        $('#category_font_size').val(0);
        $('#category_is_subcategory').prop('checked', null)
        $('#category_deleted').prop('checked', null)
        $('#category_root_category').val(0)

        $('#category-modal').modal('show');


    })
    $('#create-product').on('click', function() {

        $('#product_id').val(0);
        $('#product_name').val("");
        $('#product_color').val("#000000");
        $('#product_order').val(0);
        $('#product_font_size').val(0);
        $('#product_category_id').val(0);
        $('#product_deleted').prop('checked', null)
        $('#product_weighed').prop('checked', null)
        $('#product_free_price').prop('checked', null)


        $('#product-modal').modal('show');


    })



    $('#category_is_subcategory').on('click',function() {

        if($(this).is(':checked')) {

            $('#div_category_root_category').show(300)

        } else {

            $('#div_category_root_category').hide(300)


        }

    })



}

CatalogueClass.prototype.initializeSelects = function() {
    let self = this;


    $.ajax({

        url: self.Helpers.LOCAL_API + "Categories/All",
        type: 'GET',
        dataType: 'json',
        contentType: "application/json",
        success: function (response) {

            console.log(response)
            if (response.status === 200) {

                for(i = 0; i < response.data.length; i++) {



                    $('#category_root_category').append($('<option>',
                        {
                            value: response.data[i].category_id,
                            text : response.data[i].category_name
                        }));

                    $('#product_category_id').append($('<option>',
                        {
                            value: response.data[i].category_id,
                            text : response.data[i].category_name
                        }));

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
            } else {

                self.Helpets.toastrServerError();

            }



        },
        error: function (jqXHR, textStatus) {

            self.Helpers.swalServerError();
        }
    });



}