let TakeawayClass = function () {

    this.Helpers = new HelpersClass();
    this.GovermentAPI = new GovermentClass(this.Helpers);
    this.Helpers.getLocalUser();
    let self = this;
    self.initializeSizes();
    self.initializeNumpadNumbers();
    setTimeout(function () {
        self.initializeProducts();
        self.initializeCartButtons();


    }, 500)

    this.selectedProductID = null;
    this.selectedProductIndex = null;
    this.selectedProductBackColor = '';
    this.fullProducts = [];
    this.cartProducts = [];
    this.selectedInCartProduct = null;
    this.selectedProductsForDiscount = [];
    this.typeOfDiscount = 0;
    this.orderTotals = {};
    this.countNumpadNumbers = [];
    this.counter = 0;
    this.selectedCustomer = null;


}

TakeawayClass.prototype.initializeSizes = function() {

    let self = this;

    $('#append-cart-div').css('height', this.Helpers.cart_height)
    $('#send-order-btn').css('height', this.Helpers.send_order_height)
    $('#numpad-input').css('height', this.Helpers.numpad_input_height)
    $('#delete-numpad').css('height', this.Helpers.numpad_input_height)
    $('.numpad-btn').css('height', this.Helpers.numpad_numbers_height)
    $('.confirm-numpad-btn').css('height', this.Helpers.numpad_numbers_height)

}

TakeawayClass.prototype.initializeProducts = function () {

    let self = this;

    $.ajax({
        url: self.Helpers.LOCAL_API + "Products",
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (response) {

            if (response.status === 200) {
                for (i = 0; i < response.data.length; i++) {

                    //push category id into array so you can manage later.

                    self.fullProducts.push(response.data[i]);
                    $('#append-products').append(" <button id='product_" + response.data[i].product_id + "' data-product-index='" + i + "' data-product-background='" + response.data[i].product_color + "' class='product-btn' style='width:" + self.Helpers.products_width + ";height:" + self.Helpers.products_height + ";background-color: " + response.data[i].product_color + "'>" +
                        "                        <p id='product_name_" + response.data[i].product_id + "' class='product-name' style='font-size: " + response.data[i].product_font_size + "px'>" + response.data[i].product_name + "</p>\n" +
                        "                </button>")


                }

                $('.product-btn').on('click', function () {
                    var productIndex = $(this).data('product-index');
                    var productID = self.fullProducts[productIndex].product_id;

                    if (self.fullProducts[productIndex].product_free_price == 1) {

                        $(this).addClass('category-shadows')
                        $(this).attr('disabled', 'disabled')
                        $('#product_' + productID).css('background-color', 'black')
                        $('#product_name_' + productID).css('color', 'white')
                        if (self.selectedProductID !== 0 && self.selectedProductID !== productID) {
                            $('#product_' + self.selectedProductID).css("background-color", self.selectedProductBackColor).removeClass('category-shadows').attr('disabled', null)
                            $('#product_name_' + self.selectedProductID).css("color", "black")

                        }
                        self.selectedProductBackColor = $('#product_' + productID).data('product-background');
                        self.selectedProductID = productID;
                        self.selectedProductIndex = productIndex;


                    } else {

                        self.appendProductToCart(self.fullProducts[productIndex], null, false)

                    }


                })

                console.log("Categories initialization done.")

            } else {

                self.Helpers.toastrServerError();

            }


        },
        error: function (jqXHR, textStatus) {

            self.Helpers.swalServerError();
        }
    });


}

TakeawayClass.prototype.initializeNumpadNumbers = function() {

    let self = this;
    $('#numpad-input').val("0.00");
    $('.numpad-btn').on('click', function() {

        var typedNumber = $(this).data('number');
        self.typeNumpad(typedNumber)

    })

    $('.confirm-numpad-btn').on('click', function() {

        if (self.selectedProductIndex == null) {
            self.Helpers.toastr('warning', "Παρακαλώ επιλέξτε προϊόν.")


        } else {

            self.appendProductToCart(self.fullProducts[self.selectedProductIndex] , $('#numpad-input').val(), true)

        }



    })

    $('#delete-numpad').on('click', function() {

        self.clearNumpad();

    })





}

TakeawayClass.prototype.appendProductToCart = function (productObject , price, freePrice) {

    let self = this;

    //find how many products are alredy in cart.
    var cartIndex = 0;
    if (self.cartProducts.length != 0) {

        //there are more products already in the cart
        cartIndex = self.cartProducts[self.cartProducts.length - 1].cartIndex + 1;


    } else {

        cartIndex = 0;

    }


    if (freePrice) {
        //this means the product is free price and the price is given to me.

        if (price != "0.00") {

            var newProductObj = {

                cartIndex: cartIndex,
                product_quantity: 1,
                product_discount: 0,
                product_id: productObject.product_id,
                product_name: productObject.product_name,
                product_free_price: productObject.product_free_price,
                product_price: price,
                product_vat_id: productObject.product_vat_id,
                product_vat_percent: productObject.product_vat_percent

            }

            self.cartProducts.push(newProductObj);
            $('#append-cart-div').append("<div id='cart_index_" + cartIndex + "' class='product-in-cart' data-product-id='" + newProductObj.product_id + "' onclick='" + "myTakeaway.selectProductInCart(" + cartIndex + ")" + "'>" +
                "                    <div id='productincart_quantity" + cartIndex + "' class=\"cart-product-quantity-div-append\">" +
                "                        <p id='productincart_quantity_text" + cartIndex + "' class=\"cart-product-quantity-text\">1</p>" +
                "                    </div>" +
                "                    <div id='productincart_name" + cartIndex + "' class=\"cart-product-name-div-append\">" +
                "                        <p  id='productincart_name_text" + cartIndex + "' class=\"cart-product-name-text\">" + newProductObj.product_name + "</p>" +
                "                    </div>" +
                "                    <div id='productincart_price" + cartIndex + "' class=\"cart-product-price-div-append\">" +
                "                        <p id='productincart_price_text" + cartIndex + "' class=\"cart-product-price-text\">" + price + "</p>" +
                "                    </div>" +
                "                </div>");

            self.clearNumpad();
        } else {

            self.Helpers.toastr('warning', 'Παρακαλώ πληκτρολογήστε τιμή.')

        }



    } else {

        var newProductObj = {

            cartIndex: cartIndex,
            product_quantity: 1,
            product_discount: 0,
            product_id: productObject.product_id,
            product_name: productObject.product_name,
            product_free_price: productObject.product_free_price,
            product_price: productObject.product_price,
            product_vat_id: productObject.product_vat_id,
            product_vat_percent: productObject.product_vat_percent

        }

        self.cartProducts.push(newProductObj)
        $('#append-cart-div').append("<div id='cart_index_" + cartIndex + "' class='product-in-cart' data-product-id='" + newProductObj.product_id + "' onclick='" + "myTakeaway.selectProductInCart(" + cartIndex + ")" + "'>" +
            "                    <div id='productincart_quantity" + cartIndex + "' class=\"cart-product-quantity-div-append\">" +
            "                        <p id='productincart_quantity_text" + cartIndex + "' class=\"cart-product-quantity-text\">1</p>" +
            "                    </div>" +
            "                    <div id='productincart_name" + cartIndex + "' class=\"cart-product-name-div-append\">" +
            "                        <p id='productincart_name_text" + cartIndex + "' class=\"cart-product-name-text\">" + newProductObj.product_name + "</p>" +
            "                    </div>" +
            "                    <div id='productincart_price" + cartIndex + "' class=\"cart-product-price-div-append\">" +
            "                        <p id='productincart_price_text" + cartIndex + "' class=\"cart-product-price-text\">" + newProductObj.product_price + "</p>" +
            "                    </div>" +
            "                </div>");

    }
    self.selectProductInCart(cartIndex);
    self.refreshCartSummaries();




}

TakeawayClass.prototype.selectProductInCart = function (cartIndex) {

    let self = this;

    if (self.selectedInCartProduct !== null) {
        $('#productincart_quantity' + self.selectedInCartProduct).css('background-color', 'white').css('color', 'black')
        $('#productincart_name' + self.selectedInCartProduct).css('background-color', 'white').css('color', 'black')
        $('#productincart_price' + self.selectedInCartProduct).css('background-color', 'white')
    }

    self.selectedInCartProduct = cartIndex;
    $('#productincart_quantity' + cartIndex).css('background-color', '#000000').css('color', 'white')
    $('#productincart_name' + cartIndex).css('background-color', '#000000').css('color', 'white')
    $('#productincart_price' + cartIndex).css('background-color', '#000000')


}

TakeawayClass.prototype.addOneMoreProductInCart = function (cartIndex) {

    let self = this;
    var productCurrentQuantity = $('#productincart_quantity_text' + cartIndex).html();
    var productNewQuantity = parseInt(productCurrentQuantity) + 1;


    self.updateCartProduct(cartIndex, productNewQuantity, productCurrentQuantity)


}

TakeawayClass.prototype.minusOneProductInCart = function (cartIndex) {

    let self = this;

    var productCurrentQuantity = $('#productincart_quantity_text' + cartIndex).html();

    if (productCurrentQuantity > 1) {

        var productNewQuantity = parseInt(productCurrentQuantity) - 1;

        self.updateCartProduct(cartIndex, productNewQuantity, productCurrentQuantity)

    } else {

        self.Helpers.toastr('warning', 'Μη επιτρεπτή ποσότητα. Παρακαλώ διαγράψτε το προϊόν.')

    }


}

TakeawayClass.prototype.deleteProductFromCart = function (cartIndex) {
    let self = this;
    $('#cart_index_' + cartIndex).remove();
    for (i=0; i < self.cartProducts.length; i++) {

        if (self.cartProducts[i].cartIndex == cartIndex) {

            self.cartProducts.splice(i, 1)
            break;
        }

    }

    self.selectedInCartProduct = null;
    if (self.cartProducts.length > 0) {

        self.selectProductInCart(self.cartProducts[self.cartProducts.length - 1].cartIndex)
        self.refreshCartSummaries();
    } else {

        self.emptyCartAndData();
    }




}

TakeawayClass.prototype.updateCartProduct = function(cartIndex, newQuantity, currentQuantity) {

    let self = this;
    $('#productincart_quantity_text' + cartIndex).html(newQuantity)


    for (i=0; i < self.cartProducts.length; i++) {

        if (self.cartProducts[i].cartIndex == cartIndex) {


            var productNewDiscount = (self.cartProducts[i].product_discount / currentQuantity) * newQuantity;
            var productNewPrice = newQuantity * (self.cartProducts[i].product_price / parseInt(currentQuantity));
            self.cartProducts[i].product_quantity = newQuantity;
            self.cartProducts[i].product_discount = productNewDiscount;
            self.cartProducts[i].product_price = (productNewPrice).toFixed(2);
            $('#productincart_price_text' + cartIndex).html((productNewPrice - productNewDiscount).toFixed(2))


        }

    }
    self.refreshCartSummaries();


}

TakeawayClass.prototype.refreshCartSummaries = function () {

    let self = this;
    var sumStartPrice = 0;
    var sumDiscount = 0;
    var sumProductsQt = 0;
    for (i = 0; i < self.cartProducts.length; i++) {

        sumStartPrice = (parseFloat(sumStartPrice) + parseFloat(self.cartProducts[i].product_price));
        sumDiscount = (parseFloat(sumDiscount) + parseFloat(self.cartProducts[i].product_discount));
        sumProductsQt = sumProductsQt + self.cartProducts[i].product_quantity

    }
    $('#cart-sum-start-price').html('Αρχική τιμή: ' + sumStartPrice.toFixed(2) + ' €')
    $('#cart-sum-discount').html('Έκπτωση: ' + sumDiscount.toFixed(2) + ' €')
    $('#send-order-btn').html((sumStartPrice - sumDiscount).toFixed(2) + ' €')

    self.orderTotals.sumStartPrice = sumStartPrice.toFixed(2);
    self.orderTotals.sumDiscount = sumDiscount.toFixed(2);
    self.orderTotals.sumTotal = (sumStartPrice - sumDiscount).toFixed(2);
    self.orderTotals.sumQt = sumProductsQt;

}

TakeawayClass.prototype.emptyCartAndData = function () {
    let self = this;
    self.cartProducts = [];
    self.orderTotals = {};
    self.selectedProductsForDiscount = [];
    self.typeOfDiscount = 0;
    self.selectedCustomer = null;

    $('#append-cart-div').html("");
    $('#cart-sum-start-price').html("Αρχική τιμή: 0,00 €")
    $('#cart-sum-discount').html("Έκπτωση: 0,00 €")
    $('#send-order-btn').html("0,00 €")


}

TakeawayClass.prototype.initializeCartButtons = function () {
    let self = this;

    $('#send-order-btn').on('click', function () {

        if (self.cartProducts.length !=0 ) {

            var typeOfPayment;
            if ($('#cash-card-btn').html() == "ΜΕΤΡΗΤΑ") {

                typeOfPayment = "cash";

            } else {

                typeOfPayment = "card";
            }
            if (self.selectedCustomer === null) {
                //This is a receipt
                var orderObj = {

                    orderData: {
                        "user_id": self.Helpers.userData.user_id,
                        "user_name": self.Helpers.userData.user_name,
                        "order_payment_method": typeOfPayment,
                        "products": self.cartProducts,
                        "totals": self.orderTotals,
                        "datetime": self.Helpers.getTodayDate(),
                        "document_number": 1

                    }

                }

                console.log(orderObj)

                $.ajax({
                    contentType: 'application/json',
                    url: self.Helpers.LOCAL_API + 'Orders',
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(orderObj),
                    success: function (response) {

                        if (response.status === 200) {

                            self.Helpers.toastr("success", "Επιτυχής καταχώρηση παραγγελίας.")
                            $('#cash-card-btn').html("ΜΕΤΡΗΤΑ");
                            $('#cash-card-btn').removeClass('btn-success')
                            $('#cash-card-btn').removeClass('btn-danger')
                            $('#cash-card-btn').addClass('btn-success')
                            self.emptyCartAndData();

                        } else {

                            self.Helpers.toastr("error", "Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.")

                        }


                    },
                    error: function (jqXHR, textStatus) {

                        self.Helpers.toastrServerError()

                    }
                });

            } else {
                //this is an invoice

                var orderObj = {

                    orderData: {
                        "user_id": self.Helpers.userData.user_id,
                        "user_name": self.Helpers.userData.user_name,
                        "customer": self.selectedCustomer,
                        "order_payment_method": typeOfPayment,
                        "products": self.cartProducts,
                        "totals": self.orderTotals,
                        "datetime": self.Helpers.getTodayDate(),
                        "document_number": 2

                    }

                }

                swal({
                    title: "Αποστολή Τιμολογίου?",
                    text: "Είστε σίγουροι πως θέλετε να εκδώσετε τιμολόγιο? Το τιμολόγιο θα σταλεί αυτόματα στην ΑΑΔΕ για πιστοποίηση.",
                    type: "warning",
                    showCancelButton: true,
                    cancelButtonText: "ΑΚΥΡΟ",
                    confirmButtonColor: "#5cb85c",
                    confirmButtonText: "ΑΠΟΣΤΟΛΗ",
                    closeOnConfirm: true
                }, function () {


                    $.ajax({
                        contentType: 'application/json',
                        url: self.Helpers.REMOTE_API + 'Aade/SendInvoice',
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(orderObj),
                        success: function (response) {

                            console.log(response)
                            if (response.status == 200) {

                                swal({
                                    title: "Επιτυχία διαβίβασης παραστατικού.",
                                    text: "Μοναδικός αριθμός καταχώρησης (ΜΑΡΚ): " + response.invoiceMark["0"],
                                    type: "success",
                                    showCancelButton: false,
                                    cancelButtonText: "ΑΚΥΡΟ",
                                    confirmButtonColor: "#5cb85c",
                                    confirmButtonText: "OK",
                                    closeOnConfirm: true
                                }, function () {

                                    orderObj.orderData.invoiceMark = response.invoiceMark["0"];

                                    console.log(orderObj)
                                    $.ajax({
                                        contentType: 'application/json',
                                        url: self.Helpers.LOCAL_API + 'Orders',
                                        type: 'POST',
                                        dataType: 'json',
                                        data: JSON.stringify(orderObj),
                                        success: function (secondResponse) {

                                            if (secondResponse.status === 200) {

                                                self.Helpers.toastr("success", "Επιτυχής καταχώρηση παραγγελίας.")
                                                $('#cash-card-btn').html("ΜΕΤΡΗΤΑ");
                                                $('#cash-card-btn').removeClass('btn-success')
                                                $('#cash-card-btn').removeClass('btn-danger')
                                                $('#cash-card-btn').addClass('btn-success')
                                                self.emptyCartAndData();

                                            } else {

                                                self.Helpers.toastr("error", "Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.")

                                            }


                                        },
                                        error: function (jqXHR, textStatus) {

                                            self.Helpers.toastrServerError()

                                        }
                                    });

                                    $('#cash-card-btn').html("ΜΕΤΡΗΤΑ");
                                    $('#cash-card-btn').removeClass('btn-success')
                                    $('#cash-card-btn').removeClass('btn-danger')
                                    $('#cash-card-btn').addClass('btn-success')
                                    self.emptyCartAndData();

                                })




                            } else {
                                console.log(response.errors)
                                swal({
                                    title: "Σφάλμα στη διαβίβαση παραστατικού!",
                                    text: "Κωδικός σφάλματος: " + response.statusCode["0"],
                                    type: "error",
                                    showCancelButton: false,
                                    cancelButtonText: "ΑΚΥΡΟ",
                                    confirmButtonColor: "#d9534f",
                                    confirmButtonText: "OK",
                                    closeOnConfirm: true
                                })

                            }





                        },
                        error: function (jqXHR, textStatus) {

                            self.Helpers.toastrServerError()
                        }


                    });
                })

            }



        }


    })

    $('#plus-product-btn').on('click', function () {


        if (self.selectedInCartProduct !== null) {

            self.addOneMoreProductInCart(self.selectedInCartProduct);


        } else {

            self.Helpers.toastr('warning', 'Παρακαλώ επιλέξτε ένα από τα προϊόντα του καλαθιού.');
        }
    })

    $('#minus-product-btn').on('click', function () {


        if (self.selectedInCartProduct !== null) {


            self.minusOneProductInCart(self.selectedInCartProduct);


        } else {

            self.Helpers.toastr('warning', 'Παρακαλώ επιλέξτε ένα από τα προϊόντα του καλαθιού.');
        }
    })

    $('#delete-product-btn').on('click', function () {


        // console.log(self.selectedInCartProduct);
        if (self.selectedInCartProduct !== null) {

            self.deleteProductFromCart(self.selectedInCartProduct);


        } else {

            self.Helpers.toastr('warning', 'Παρακαλώ επιλέξτε ένα από τα προϊόντα του καλαθιού.');
        }
    })

    $('#cash-card-btn').on('click', function () {

        if ($(this).html() === "ΜΕΤΡΗΤΑ") {

            $(this).html("ΚΑΡΤΑ")
            $(this).removeClass('btn-success')
            $(this).addClass('btn-danger')

        } else {

            $(this).html("ΜΕΤΡΗΤΑ")
            $(this).removeClass('btn-danger')
            $(this).addClass('btn-success')

        }

    })

    $('#discount-product-btn').on('click', function () {

        $('#discount_amount_div').hide()
        $('#final_discount_btn').hide()
        $('#percent_discount_btn').show()
        $('#amount_discount_btn').show()
        $('#discount_amount').val("")
        $('#discount-modal').modal('show');
        var discountTableData = [];
        for (i = 0; i < self.cartProducts.length; i++) {
            discountTableData.push([
                self.cartProducts[i].product_id,
                self.cartProducts[i].cartIndex,
                self.cartProducts[i].product_quantity,
                self.cartProducts[i].product_name,
                self.cartProducts[i].product_price
            ])

        }
        var discountTable = $('#order-cart-table').DataTable({
            data: discountTableData,
            paging: false,
            ordering: false,
            searching: false,
            bInfo: false,
            columns: [
                {title: "ID"},
                {title: "Cart_id"},
                {title: "Ποσότητα"},
                {title: "Όνομα προϊόντος"},
                {title: "Τιμή (€)"}
            ],
            aoColumnDefs: [{
                "bVisible": false,
                "aTargets": [0, 1]
            }]
        })

        self.typeOfDiscount = null;
        $('#amount_discount_btn').prop('disabled', 'disabled')
        self.selectedProductsForDiscount = [];
        discountTable.on("click", "tr", function () {

            var clickedRowData = discountTable.row($(this)).data();


            if ($(this).css('color') !== 'rgb(0, 0, 0)') {
                //product is un-selected
                $(this).css('color', 'rgb(0, 0, 0)')
                $(this).css('background-color', 'rgb(255, 255, 255)')

                for (i = 0; i < self.selectedProductsForDiscount.length; i++) {
                    if (self.selectedProductsForDiscount[i][1] == clickedRowData[1]) {
                        self.selectedProductsForDiscount.splice(i, 1)
                        break;
                    }

                }

            } else {
                //product is selected
                $(this).css('color', 'rgb(255, 255, 255)')
                $(this).css('background-color', 'rgb(0, 0, 0)')
                self.selectedProductsForDiscount.push(clickedRowData)


            }

            if (self.selectedProductsForDiscount.length == 1) {

                $('#amount_discount_btn').prop('disabled', false)

            } else {

                $('#amount_discount_btn').prop('disabled', 'disabled')

            }


        })

    })

    $('#close-discount-modal').on('click', function () {
        $('#order-cart-table').unbind('click')
        $('#order-cart-table').DataTable().destroy();
        $('#discount-modal').modal('hide');

    })

    $('#percent_discount_btn').on('click', function () {
        $('#order-cart-table').unbind('click')
        self.typeOfDiscount = 1;
        $(this).hide();
        $('#amount_discount_btn').hide();
        $('#discount_amount_label').html("Ποσοστό έκπτωσης (%):")
        $('#discount_amount_div').show(500)
        $('#final_discount_btn').show()

    })

    $('#amount_discount_btn').on('click', function () {
        $('#order-cart-table').unbind('click')
        self.typeOfDiscount = 2;
        $(this).hide();
        $('#percent_discount_btn').hide();
        $('#discount_amount_label').html("Ποσό έκπτωσης (€):")
        $('#discount_amount_div').show(500)
        $('#final_discount_btn').show()

    })

    $('#final_discount_btn').on('click', function () {

        var discountAmount = $('#discount_amount').val();
        var percentDiscountAmount = 0;
        if (discountAmount <= 0) {

            self.Helpers.toastr("error", "Μη αποδεκτό ποσό έκπτωσης.")

        } else {

            if (self.typeOfDiscount == 1) {

                //discount with percent
                if (self.selectedProductsForDiscount.length == 0) {

                    for (i = 0; i < self.cartProducts.length; i++) {

                        percentDiscountAmount = (discountAmount * self.cartProducts[i].product_price / 100);
                        self.cartProducts[i].product_discount = (parseFloat(self.cartProducts[i].product_discount) + parseFloat(percentDiscountAmount)).toFixed(2);
                        $('#productincart_price_text' + self.cartProducts[i].cartIndex).html((self.cartProducts[i].product_price - self.cartProducts[i].product_discount).toFixed(2))
                        $('#close-discount-modal').trigger('click')

                    }

                } else {

                    for (i = 0; i < self.cartProducts.length; i++) {
                        for (j = 0; j < self.selectedProductsForDiscount.length; j++) {

                            if (self.cartProducts[i].cartIndex == self.selectedProductsForDiscount[j][1]) {

                                percentDiscountAmount = (discountAmount * self.selectedProductsForDiscount[j][4] / 100);
                                self.cartProducts[i].product_discount = (parseFloat(self.cartProducts[i].product_discount) + percentDiscountAmount).toFixed(2);
                                $('#productincart_price_text' + self.cartProducts[i].cartIndex).html((self.cartProducts[i].product_price - self.cartProducts[i].product_discount).toFixed(2))
                                $('#close-discount-modal').trigger('click')

                            }

                        }


                    }


                }


            } else if (self.typeOfDiscount == 2) {

                //discount with amount

                if (discountAmount >= parseFloat(self.selectedProductsForDiscount[0][4])) {

                    self.Helpers.toastr("error", "Μη αποδεκτό ποσό έκπτωσης")

                } else {

                    for (i = 0; i < self.cartProducts.length; i++) {

                        if (self.cartProducts[i].cartIndex == self.selectedProductsForDiscount[0][1]) {

                            self.cartProducts[i].product_discount = (parseFloat(self.cartProducts[i].product_discount) + parseFloat(discountAmount)).toFixed(2);
                            $('#productincart_price_text' + self.cartProducts[i].cartIndex).html((self.cartProducts[i].product_price - self.cartProducts[i].product_discount).toFixed(2))
                            $('#close-discount-modal').trigger('click')
                        }

                    }

                }

            } else {

                self.Helpers.toastr('error', 'Αδυναμία έκπτωσης')
            }
            self.Helpers.toastr('success', 'Επιτυχής εφαρμογή έκπτωσης.')
            self.refreshCartSummaries();
            self.typeOfDiscount = null;
        }

    })

    $('#invoice-btn').on('click', function() {

        if (self.cartProducts.length === 0) {

            self.Helpers.toastr('warning', 'Παρακαλώ προσθέστε προιόντα για την έκδοση τιμολογίου.');


        } else {
            self.customersTable =  $('#customers-table').DataTable({
                "processing": false,
                "ajax": self.Helpers.LOCAL_API + "Customers/All",
                "paging": true,
                "searching": true,
                "ordering": false,
                "bPaginate": false,
                "bInfo": false,
                "columns": [
                    {"data": "customer_fullname"},
                    {"data": "customer_bussiness"},
                    {"data": "customer_vat_number"},
                    {"data": "customer_address"},
                    {"data": "customer_address_number"},
                    {"data": "customer_area"},


                ]
            });

            self.customersTable.on("click", "tr", function () {

                var clickedRowData = self.customersTable.row($(this)).data();
                self.customersTable.rows().every(function() {
                    let row = this.node()
                    $(row).css('color', 'rgb(0, 0, 0)')
                    $(row).css('background-color', 'rgb(255, 255, 255)')
                })

                $(this).css('color', 'rgb(255, 255, 255)')
                $(this).css('background-color', 'rgb(0, 0, 0)')

                self.selectedCustomer = clickedRowData;
                $('#choose-customer').attr('disabled', null)

            })
            $('#invoice-modal').modal('show')

        }

    })

    $('#close-invoice-modal').on('click', function() {
        $('#choose-customer').attr('disabled', 'disabled')
        self.customersTable.destroy();
        self.selectedCustomer = null;
        $('#invoice-modal').modal('hide')
    })

    $('#choose-customer').on('click', function() {
        self.Helpers.toastr("success", "Έχει επιλεγεί πελάτης για αποστολή τιμολογιίου!")
        self.customersTable.destroy();
        $('#invoice-modal').modal('hide')
    })

    $('#add-customer-li').on('click', function() {
        $('#customer_id').val(0)
        $('#customer_fullname').val('')
        $('#customer_branch').val(0)
        $('#customer_vat_number').val('')
        $('#customer_bussiness').val('')
        $('#customer_tax_office').val('')
        $('#customer_phone').val('')
        $('#customer_address').val('')
        $('#customer_address_number').val('')
        $('#customer_area').val('')
        $('#customer_postal_code').val('')
        $('#customer_load').val('ΕΔΡΑ ΜΑΣ')
        $('#customer_destination').val('ΕΔΡΑ ΤΟΥΣ')
        $('#customers-modal').modal('show')
    })

    $('#search-customer').on('click',function() {

        let customerAfm = $('#customer_vat_number').val()
        self.GovermentAPI.searchAfm(customerAfm)


    })

    $('#save-customer').on('click', function() {

        $('#save-customerr').attr('disabled', 'disabled');
        $('#save-customerr').html('Αποθήκευση...');

        let customerData = {
            customerData: {
                customer_id: 0,
                customer_fullname: $('#customer_fullname').val(),
                customer_phone: $('#customer_phone').val(),
                customer_branch: $('#customer_branch').val(),
                customer_address: $('#customer_address').val(),
                customer_address_number: $('#customer_address_number').val(),
                customer_area: $('#customer_area').val(),
                customer_vat_number: $('#customer_vat_number').val(),
                customer_tax_office: $('#customer_tax_office').val(),
                customer_postal_code: $('#customer_postal_code').val(),
                customer_bussiness: $('#customer_bussiness').val(),
                customer_load: $('#customer_load').val(),
                customer_destination: $('#customer_destination').val(),
                customer_date_created: self.Helpers.getTodayDate()

            }

        }
        $.ajax({

            url: self.Helpers.LOCAL_API + "Customers",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(customerData),
            success: function (response) {

                if (response.status === 200) {

                    self.Helpers.toastr('success', response.message)
                    $('#customers-modal').modal('hide')
                } else {

                    self.Helpers.toastr('error', response.message);

                }

                            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });

        $('#save-customerr').attr('disabled', null);
        $('#save-customerr').html('Αποθήκευση');

    })


}

TakeawayClass.prototype.typeNumpad = function (number) {
    event.preventDefault();
    let self = this;
    self.countNumpadNumbers.push(number);
    this.completeNumpadValue();


}

TakeawayClass.prototype.clearNumpad = function () {
    event.preventDefault();

    let self = this;
    self.countNumpadNumbers = [];
    this.completeNumpadValue();
}

TakeawayClass.prototype.completeNumpadValue = function () {
    let self = this;
    var input_value = '';

    switch (self.countNumpadNumbers.length) {
        case 0:
            input_value = "0.00";
            break;
        case 1:
            if (self.countNumpadNumbers[0] != 0) {
                input_value = "0.0" + self.countNumpadNumbers[0];
            } else {

                input_value = "0.00";
                self.countNumpadNumbers.splice(0, 1)
            }

            break;
        case 2:
            input_value = "0." + self.countNumpadNumbers[0] + self.countNumpadNumbers[1]
            break;
        default:

            for (i = 0; i < self.countNumpadNumbers.length; i++) {
                if (i == self.countNumpadNumbers.length - 3) {
                    input_value += self.countNumpadNumbers[i] + '.'

                } else {
                    input_value += self.countNumpadNumbers[i]
                }

            }


    }


    $('#numpad-input').val(input_value);

}


