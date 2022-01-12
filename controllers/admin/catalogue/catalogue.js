let CatalogueClass = function () {
    this.Helpers = new HelpersClass()
    this.Helpers.initSettings()
    this.Helpers.getLocalUser()
    this.server = new ServerClass(this.Helpers)
    this.vats = []
    this.bindEventsOnButtons()
    this.initCategoriesTable()
    this.initProductsTable()
    this.initializeCategoriesProductSelect()
    this.initializeVatsSelect()
}

CatalogueClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#categories-row').hide()
    $('#products-row').hide()
    $('.catalogue-category').on('click', function () {
        $('#selections-row').addClass('animate__animated animate__bounceOutRight')
        $('#selections-row').on('animationend', () => {
            $('#selections-row').hide()
            let divSelected = $(this).data('selector')
            $(`#${divSelected}`).show()
        })
    })

    $('#create-category').on('click', function () {
        $('#category_id').val('')
        $('#category_order').val('')
        $('#category_name').val('')
        $('#category_font_size').val('')
        $('#category_color').val('')
        $('#category_deleted').prop('checked', null)
        $('#category-modal').modal('show')
    })

    $('#create-product').on('click', function () {
        $('#product_id').val('')
        $('#product_name').val('')
        $('#product_order').val('')
        $('#product_font_size').val('')
        $('#product_category_id').val('0')
        $('#product_color').val('')
        $('#product_price').val('')
        $('#product_vat_id').val('0')
        $('#product_deleted').prop('checked', null)
        $('#product_free_price').prop('checked', null)
        $('#product-modal').modal('show')
    })

    $('#save-category').on('click', async function () {
        $(this).attr('disabled', 'disabled')
        let categoryData = {
            categoryData: {
                categoryID: $('#category_id').val(),
                categoryName: $('#category_name').val(),
                categoryOrder: $('#category_order').val() == '' ? 0 : $('#category_order').val(),
                categoryFontSize: $('#category_font_size').val() == '' ? 15 : $('#category_font_size').val(),
                categoryColor: $('#category_color').val() == '#000000' ? 'white' : $('#category_color').val(),
                categoryDeleted: $('#category_deleted').is(':checked') ? 1 : 0,
            },
        }
        try {
            let response = null
            if (categoryData.categoryData.categoryID == '') {
                response = await self.server.postData('categories', categoryData)
            } else {
                response = await self.server.putData('categories', categoryData)
            }
            self.Helpers.toastr('success', response.message)
            self.categoriesTable.ajax.reload()
            $('#category-modal').modal('hide')
        } catch (err) {
            console.log(err)
            self.Helpers.toastrServerError()
        }
        $(this).attr('disabled', null)
    })

    $('#save-product').on('click', async function () {
        $(this).attr('disabled', 'disabled')
        if ($('#product_category_id').val() == null || $('#product_vat_id').val() == null || $('#product_price').val() == '') {
            self.Helpers.toastr('error', 'Αποτυχία! Κάποια υποχρεωτικά πεδία είναι κενά.')
            $(this).attr('disabled', null)
            return
        }
        let productData = {
            productData: {
                productID: $('#product_id').val(),
                productName: $('#product_name').val(),
                productOrder: $('#product_order').val() == '' ? 0 : $('#product_order').val(),
                productFontSize: $('#product_font_size').val() == '' ? 15 : $('#product_font_size').val(),
                productCategory: $('#product_category_id').val(),
                productColor: $('#product_color').val() == '#000000' ? 'white' : $('#product_color').val(),
                productPrice: parseFloat($('#product_price').val().replace(',', '.')).toFixed(2),
                productVatID: $('#product_vat_id').val(),
                prouductVatPercent: self.vats.find(el => el.vat_id == $('#product_vat_id').val()).vat_percent,
                productDeleted: $('#product_deleted').is(':checked') ? 1 : 0,
                productFreePrice: $('#product_free_price').is(':checked') ? 1 : 0,
            },
        }
        try {
            let response = null
            if (productData.productData.productID == '') {
                response = await self.server.postData('products', productData)
            } else {
                response = await self.server.putData('products', productData)
            }
            self.Helpers.toastr('success', response.message)
            self.productsTable.ajax.reload()
            $('#product-modal').modal('hide')
        } catch (err) {
            console.log(err)
            self.Helpers.toastrServerError()
            $(this).attr('disabled', null)
        }
        $(this).attr('disabled', null)
    })
}

CatalogueClass.prototype.initializeCategoriesProductSelect = function () {
    let self = this
    $.ajax({
        url: self.Helpers.LOCAL_API + 'categories/all',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.status === 200) {
                for (i = 0; i < response.data.length; i++) {
                    $('#product_category_id').append($('<option></option>').attr('value', response.data[i].category_id).text(response.data[i].category_name))
                }
            } else {
                self.Helpers.toastrServerError()
            }
        },
        error: function () {
            self.Helpers.swalServerError()
        },
    })
}

CatalogueClass.prototype.initializeVatsSelect = function () {
    let self = this
    $.ajax({
        url: self.Helpers.LOCAL_API + 'vats',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.status === 200) {
                self.vats = response.data
                for (i = 0; i < response.data.length; i++) {
                    $('#product_vat_id').append($('<option></option>').attr('value', response.data[i].vat_id).text(response.data[i].vat_percent))
                }
            } else {
                self.Helpers.toastrServerError()
            }
        },
        error: function () {
            self.Helpers.swalServerError()
        },
    })
}

CatalogueClass.prototype.initCategoriesTable = async function () {
    let self = this
    try {
        self.categoriesTable = $('#categories-table').DataTable({
            ajax: self.Helpers.LOCAL_API + 'categories/all',
            processing: false,
            paging: true,
            searching: true,
            ordering: false,
            bPaginate: false,
            bInfo: false,
            columns: [
                { title: 'ID', data: 'category_id' },
                { title: 'ΟΝΟΜΑ', data: 'category_name' },
                { title: 'ΘΕΣΗ', data: 'category_order' },
                { title: 'ΜΕΓΕΘΟΣ ΓΡΑΜΜΑΤΩΝ', data: 'category_font_size' },
                {
                    title: 'ΕΝΕΡΓΗ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.category_deleted == 0) {
                            $(td).html('ΝΑΙ').css('color', 'green').css('font-weight', 'bold')
                        } else {
                            $(td).html('ΟΧΙ').css('color', 'red').css('font-weight', 'bold')
                        }
                    },
                    data: 'category_deleted',
                },
                {
                    title: 'ΧΡΩΜΑ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).css('background-color', rowData.category_color).html('')
                    },
                    data: 'category_color',
                },
                {
                    title: 'ΕΝΕΡΓΕΙΕΣ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.cond_status != 'Done') {
                            $(td).children('.select-done-jobs').hide()
                        }
                    },
                    defaultContent: `<div class="btn-group categories-actions"><a class="btn btn-default edit-category"><i class="fa fa-pencil"></i></a><a class="btn btn-default delete-category"><i class="fa fa-times"></i></a></div>`,
                },
            ],
            // rowCallback: function (row, data, index, cells) {
            //     //Here I am changing background Color
            //     $("td", row).css("background-color", data.con_)
            // },
            order: [[1, 'asc']],
            pageLength: 10,
        })

        $('#categories-table').on('click', 'a.delete-category', function () {
            var data = self.categoriesTable.row($(this).parents('tr')).data()
            swal(
                {
                    title: 'Διαγραφή Κατηγορίας?',
                    text: 'Είστε σίγουροι πως θέλετε να διαγράψετε την κατηγορία? Όλα τα δεδομένα της κατηγορίας ' + data.category_name + ' δεν θα είναι διαθέσιμα μετά τη διαγραφή...',
                    type: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Άκυρο',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Διαγραφή',
                    closeOnConfirm: true,
                },
                function () {
                    $.ajax({
                        url: self.Helpers.LOCAL_API + 'categories/' + data.category_id,
                        type: 'delete',
                        dataType: 'json',
                        data: '',
                        success: function (response) {
                            if (response.status === 200) {
                                self.Helpers.toastr('success', response.message)
                            } else {
                                self.Helpers.toastrServerError()
                            }
                            self.categoriesTable.ajax.reload()
                        },
                        error: function (jqXHR, textStatus) {
                            self.Helpers.swalServerError()
                        },
                    })
                }
            )
        })

        $('#categories-table').on('click', 'a.edit-category', function () {
            var data = self.categoriesTable.row($(this).parents('tr')).data()

            $('#category_id').val(data.category_id)
            $('#category_name').val(data.category_name)
            $('#category_font_size').val(data.category_font_size)
            $('#category_color').val(data.category_color)
            $('#category_order').val(data.category_order)

            if (data.user_deleted == 1) {
                $('#category_deleted').prop('checked', 'checked')
            } else {
                $('#category_deleted').prop('checked', null)
            }

            $('#category-modal').modal('show')
        })
    } catch (err) {
        console.log('Exception Caught:', err)
    }
}

CatalogueClass.prototype.initProductsTable = function () {
    let self = this
    try {
        self.productsTable = $('#products-table').DataTable({
            ajax: self.Helpers.LOCAL_API + 'products/all',
            processing: false,
            paging: true,
            searching: true,
            ordering: false,
            bPaginate: false,
            bInfo: false,
            columns: [
                { title: 'ID', data: 'product_id' },
                { title: 'ΟΝΟΜΑ', data: 'product_name' },
                {
                    title: 'TIMH (€)',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).html(`${rowData.product_price.toFixed(2)}`)
                    },
                    data: 'product_price',
                },
                { title: 'ΚΑΤΗΓΟΡΙΑ', data: 'category_name' },
                { title: 'ΘΕΣΗ', data: 'product_order' },
                {
                    title: 'ΕΛΕΥΘΕΡΗ ΤΙΜΗ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.product_free_price == 0) {
                            $(td).html('ΟΧΙ').css('color', 'red').css('font-weight', 'bold')
                        } else {
                            $(td).html('ΝΑΙ').css('color', 'green').css('font-weight', 'bold')
                        }
                    },
                    data: 'product_deleted',
                },
                {
                    title: 'ΕΝΕΡΓΟ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.product_deleted == 0) {
                            $(td).html('ΝΑΙ').css('color', 'green').css('font-weight', 'bold')
                        } else {
                            $(td).html('ΟΧΙ').css('color', 'red').css('font-weight', 'bold')
                        }
                    },
                    data: 'product_deleted',
                },
                {
                    title: 'ΧΡΩΜΑ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).css('background-color', rowData.product_color).html('')
                    },
                    data: 'product_color',
                },
                {
                    title: 'ΕΝΕΡΓΕΙΕΣ',
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.cond_status != 'Done') {
                            $(td).children('.select-done-jobs').hide()
                        }
                    },
                    defaultContent: `<div class="btn-group categories-actions"><a class="btn btn-default edit-product"><i class="fa fa-pencil"></i></a><a class="btn btn-default delete-product"><i class="fa fa-times"></i></a></div>`,
                },
            ],
            // rowCallback: function (row, data, index, cells) {
            //     //Here I am changing background Color
            //     $("td", row).css("background-color", data.con_)
            // },
            order: [[1, 'asc']],
            pageLength: 10,
        })

        $('#products-table').on('click', 'a.delete-product', function () {
            var data = self.productsTable.row($(this).parents('tr')).data()
            swal(
                {
                    title: 'Διαγραφή Προϊόντος?',
                    text: 'Είστε σίγουροι πως θέλετε να διαγράψετε το προϊόν? Όλα τα δεδομένα του προϊόντος ' + data.ptoduct_name + ' δεν θα είναι διαθέσιμα μετά τη διαγραφή...',
                    type: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Άκυρο',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Διαγραφή',
                    closeOnConfirm: true,
                },
                function () {
                    $.ajax({
                        url: self.Helpers.LOCAL_API + 'products/' + data.product_id,
                        type: 'delete',
                        dataType: 'json',
                        data: '',
                        success: function (response) {
                            if (response.status === 200) {
                                self.Helpers.toastr('success', response.message)
                            } else {
                                self.Helpers.toastrServerError()
                            }
                            self.productsTable.ajax.reload()
                        },
                        error: function (jqXHR, textStatus) {
                            self.Helpers.swalServerError()
                        },
                    })
                }
            )
        })

        $('#products-table').on('click', 'a.edit-product', function () {
            var data = self.productsTable.row($(this).parents('tr')).data()

            $('#product_id').val(data.product_id)
            $('#product_name').val(data.product_name)
            $('#product_order').val(data.product_order)
            $('#product_font_size').val(data.product_font_size)
            $('#product_category_id').val(data.product_category_id)
            $('#product_color').val(data.product_color)
            $('#product_price').val(data.product_price)
            $('#product_vat_id').val(data.product_vat_id)
            data.product_deleted == 1 ? $('#product_deleted').prop('checked', 'checked') : $('#product_deleted').prop('checked', null)
            data.product_free_price == 1 ? $('#product_free_price').prop('checked', 'checked') : $('#product_free_price').prop('checked', null)
            $('#product-modal').modal('show')
        })
    } catch (err) {
        console.log('Exception Caught:', err)
    }
}
