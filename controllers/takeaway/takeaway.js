let TakeawayClass = function () {
    this.Helpers = new HelpersClass()
    this.Helpers.initSettings()
    this.Helpers.getLocalUser()
    let self = this
    self.initializeSizes()

    setTimeout(() => {
        if (this.Helpers.tameiaki_view == true) {
            self.initializeProductsLikeCategories()
            self.initializeNumpadNumbers("numpad-input")
        } else {
            self.initializeCategories()
            self.initializeProducts()
            self.initializeNumpadNumbers("modal-numpad-input")
        }
        self.initializeCartButtons()
    }, 500)

    this.selectedProductID = null
    this.selectedCategoryID = null
    this.selectedProductIndex = null
    this.selectedProductBackColor = ""
    this.selectedCategoryBackColor = ""
    this.fullProducts = []
    this.fullCategories = []
    this.cartProducts = []
    this.selectedInCartProduct = null
    this.selectedProductsForDiscount = []
    this.typeOfDiscount = 0
    this.orderTotals = {}
    this.countNumpadNumbers = []
    this.counter = 0
    this.selectedCustomer = null
}

TakeawayClass.prototype.initializeSizes = function () {
    let self = this
    $("#append-cart-div").css("height", this.Helpers.cart_height)
    $("#send-order-btn").css("height", this.Helpers.send_order_height)
    $("#numpad-input").css("height", this.Helpers.numpad_input_height)
    $("#modal-numpad-input").css("height", this.Helpers.numpad_input_height)
    $("#delete-numpad").css("height", this.Helpers.numpad_input_height)
    $("#modal-delete-numpad").css("height", this.Helpers.numpad_input_height)
    $(".numpad-btn").css("height", this.Helpers.numpad_numbers_height)
    $(".confirm-numpad-btn").css("height", this.Helpers.numpad_numbers_height)
    $("#categories-div").addClass(`col-md-${this.Helpers.categories_div} col-sm-${this.Helpers.categories_div} col-lg-${this.Helpers.categories_div}`)
    $("#products-div").addClass(`col-md-${this.Helpers.products_div} col-sm-${this.Helpers.products_div} col-lg-${this.Helpers.products_div}`)
    $("#cart-div").addClass(`col-md-${this.Helpers.cart_div} col-sm-${this.Helpers.cart_div} col-lg-${this.Helpers.cart_div}`)
    console.log(`Sizes initialized`)
}

TakeawayClass.prototype.initializeProductsLikeCategories = function () {
    let self = this

    $("#categories_paginator").html("Είδη")
    $("#products_paginator").html("Πληκτρολόγιο")
    $("#keyboard-layout").show()
    $("#products-layout").hide()
    $.ajax({
        url: self.Helpers.LOCAL_API + "products",
        type: "GET",
        dataType: "json",
        data: "",
        success: function (response) {
            if (response.status === 200) {
                for (i = 0; i < response.data.length; i++) {
                    //push category id into array so you can manage later.

                    self.fullProducts.push(response.data[i])
                    $("#append-categories").append(
                        " <button id='product_" +
                            response.data[i].product_id +
                            "' data-product-index='" +
                            i +
                            "' data-product-background='" +
                            response.data[i].product_color +
                            "' class='product-btn' style='width:" +
                            self.Helpers.products_width +
                            ";height:" +
                            self.Helpers.products_height +
                            ";background-color: " +
                            response.data[i].product_color +
                            "'>" +
                            "                        <p id='product_name_" +
                            response.data[i].product_id +
                            "' class='product-name' style='font-size: " +
                            response.data[i].product_font_size +
                            "px'>" +
                            response.data[i].product_name +
                            "</p>\n" +
                            "                </button>"
                    )
                }

                $(".product-btn").on("click", function () {
                    var productIndex = $(this).data("product-index")
                    var productID = self.fullProducts[productIndex].product_id

                    if (self.fullProducts[productIndex].product_free_price == 1) {
                        $(this).addClass("category-shadows")
                        $(this).attr("disabled", "disabled")
                        $("#product_" + productID).css("background-color", "black")
                        $("#product_name_" + productID).css("color", "white")
                        if (self.selectedProductID !== 0 && self.selectedProductID !== productID) {
                            $("#product_" + self.selectedProductID)
                                .css("background-color", self.selectedProductBackColor)
                                .removeClass("category-shadows")
                                .attr("disabled", null)
                            $("#product_name_" + self.selectedProductID).css("color", "black")
                        }
                        self.selectedProductBackColor = $("#product_" + productID).data("product-background")
                        self.selectedProductID = productID
                        self.selectedProductIndex = productIndex
                    } else {
                        self.appendProductToCart(self.fullProducts[productIndex], null, false)
                    }
                })

                console.log("Categories initialization done.")
            } else {
                self.Helpers.toastrServerError()
            }
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
        },
    })
}

TakeawayClass.prototype.initializeProducts = function () {
    let self = this

    $.ajax({
        url: self.Helpers.LOCAL_API + "products",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status === 200) {
                for (i = 0; i < response.data.length; i++) {
                    //push product id into array so you can manage later.

                    self.fullProducts.push(response.data[i])
                    $("#append-products").append(
                        `<button class='product-btn'  style='position: relative;display: none; width:${self.Helpers.products_width}; height:${self.Helpers.products_height}; background-color:${response.data[i].product_color}'
                         id='product_${response.data[i].product_id}'  data-product-index='${i}' data-product-background='${response.data[i].product_color}' data-product-category=${response.data[i].product_category_id}>
                            <p id='product_name_${response.data[i].product_id}' class='product-name' style='font-size:${response.data[i].product_font_size}px'>${response.data[i].product_name}</p>
                            <p class='product-price'>${response.data[i].product_price.toFixed(2)} €</p>
                        </button>`
                    )
                }

                $(".product-btn").on("click", function () {
                    var productIndex = $(this).data("product-index")
                    self.selectedProductIndex = productIndex
                    if (self.fullProducts[productIndex].product_free_price == 0) {
                        self.appendProductToCart(self.fullProducts[productIndex], null, false)
                    } else {
                        self.clearNumpad("modal-numpad-input")
                        $("#keyboard-modal").modal("show")
                    }
                })

                console.log("Products initialization done.")
            } else {
                self.Helpers.toastrServerError()
            }
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
        },
    })
}
TakeawayClass.prototype.initializeCategories = function () {
    let self = this

    $("#categories_paginator").html("Κατηγορίες")
    $("#products_paginator").html("Είδη")
    $("#keyboard-layout").hide()
    $("#products-layout").show()
    $.ajax({
        url: self.Helpers.LOCAL_API + "categories",
        type: "GET",
        dataType: "json",
        data: "",
        success: function (response) {
            if (response.status === 200) {
                for (i = 0; i < response.data.length; i++) {
                    self.fullCategories.push(response.data[i])
                    $("#append-categories").append(
                        " <button id='category_" +
                            response.data[i].category_id +
                            "' data-category-index='" +
                            i +
                            "' data-category-background='" +
                            response.data[i].category_color +
                            "' class='category-btn' style='width:" +
                            self.Helpers.categories_width +
                            ";height:" +
                            self.Helpers.categories_height +
                            ";background-color: " +
                            response.data[i].category_color +
                            "'>" +
                            "                        <p id='category_name_" +
                            response.data[i].category_id +
                            "' class='category-name' style='font-size: " +
                            response.data[i].category_font_size +
                            "px'>" +
                            response.data[i].category_name +
                            "</p>\n" +
                            "                </button>"
                    )
                }

                $(".category-btn").on("click", function () {
                    var categoryIndex = $(this).data("category-index")
                    var categoryID = self.fullCategories[categoryIndex].category_id
                    $(this).addClass("category-shadows")
                    $(this).attr("disabled", "disabled")
                    $("#category_" + categoryID).css("background-color", "black")
                    $("#category_name_" + categoryID).css("color", "white")
                    if (self.selectedCategoryID !== 0 && self.selectedCategoryID !== categoryID) {
                        $("#category_" + self.selectedCategoryID)
                            .css("background-color", self.selectedCategoryBackColor)
                            .removeClass("category-shadows")
                            .attr("disabled", null)
                        $("#category_name" + self.selectedCategoryID).css("color", "black")
                    }
                    self.selectedCategoryBackColor = $("#category_" + categoryID).data("category-background")
                    self.selectedCategoryID = categoryID
                    self.selectedCategoryIndex = categoryIndex
                    for (let prod of $(".product-btn")) {
                        $(prod).data("product-category") == categoryID ? $(prod).show() : $(prod).hide()
                    }
                })

                console.log("Categories initialization done.")
            } else {
                self.Helpers.toastrServerError()
            }
        },
        error: function (jqXHR, textStatus) {
            self.Helpers.swalServerError()
        },
    })
}

TakeawayClass.prototype.initializeNumpadNumbers = function (selector) {
    let self = this
    $(`#${selector}`).val("0.00")
    $(".numpad-btn").on("click", function () {
        var typedNumber = $(this).data("number")
        self.typeNumpad(typedNumber, selector)
    })

    $(".confirm-numpad-btn").on("click", function () {
        if (self.selectedProductIndex == null) {
            self.Helpers.toastr("warning", "Παρακαλώ επιλέξτε προϊόν.")
        } else {
            self.appendProductToCart(self.fullProducts[self.selectedProductIndex], $(`#${selector}`).val(), true)
            $("#keyboard-modal").modal("hide")
        }
    })

    $("#delete-numpad").on("click", function () {
        self.clearNumpad(selector)
    })
    $("#modal-delete-numpad").on("click", function () {
        self.clearNumpad(selector)
    })
}

TakeawayClass.prototype.appendProductToCart = function (productObject, price, freePrice) {
    let self = this

    //find how many products are alredy in cart.
    var cartIndex = 0
    if (self.cartProducts.length != 0) {
        //there are more products already in the cart
        cartIndex = self.cartProducts[self.cartProducts.length - 1].cartIndex + 1
    } else {
        cartIndex = 0
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
                product_subtotal: price,
                product_vat_id: productObject.product_vat_id,
                product_vat_percent: productObject.product_vat_percent,
            }

            self.cartProducts.push(newProductObj)
            $("#append-cart-div").append(
                "<div id='cart_index_" +
                    cartIndex +
                    "' class='product-in-cart' data-product-id='" +
                    newProductObj.product_id +
                    "' onclick='" +
                    "myTakeaway.selectProductInCart(" +
                    cartIndex +
                    ")" +
                    "'>" +
                    "                    <div id='productincart_quantity" +
                    cartIndex +
                    '\' class="cart-product-quantity-div-append">' +
                    "                        <p id='productincart_quantity_text" +
                    cartIndex +
                    '\' class="cart-product-quantity-text">1</p>' +
                    "                    </div>" +
                    "                    <div id='productincart_name" +
                    cartIndex +
                    '\' class="cart-product-name-div-append">' +
                    "                        <p  id='productincart_name_text" +
                    cartIndex +
                    '\' class="cart-product-name-text">' +
                    newProductObj.product_name +
                    "</p>" +
                    "                    </div>" +
                    "                    <div id='productincart_price" +
                    cartIndex +
                    '\' class="cart-product-price-div-append">' +
                    "                        <p id='productincart_price_text" +
                    cartIndex +
                    '\' class="cart-product-price-text">' +
                    price +
                    "</p>" +
                    "                    </div>" +
                    "                </div>"
            )

            self.clearNumpad()
        } else {
            self.Helpers.toastr("warning", "Παρακαλώ πληκτρολογήστε τιμή.")
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
            product_subtotal: productObject.product_price,
            product_vat_id: productObject.product_vat_id,
            product_vat_percent: productObject.product_vat_percent,
        }

        self.cartProducts.push(newProductObj)
        $("#append-cart-div").append(
            "<div id='cart_index_" +
                cartIndex +
                "' class='product-in-cart' data-product-id='" +
                newProductObj.product_id +
                "' onclick='" +
                "myTakeaway.selectProductInCart(" +
                cartIndex +
                ")" +
                "'>" +
                "                    <div id='productincart_quantity" +
                cartIndex +
                '\' class="cart-product-quantity-div-append">' +
                "                        <p id='productincart_quantity_text" +
                cartIndex +
                '\' class="cart-product-quantity-text">1</p>' +
                "                    </div>" +
                "                    <div id='productincart_name" +
                cartIndex +
                '\' class="cart-product-name-div-append">' +
                "                        <p id='productincart_name_text" +
                cartIndex +
                '\' class="cart-product-name-text">' +
                newProductObj.product_name +
                "</p>" +
                "                    </div>" +
                "                    <div id='productincart_price" +
                cartIndex +
                '\' class="cart-product-price-div-append">' +
                "                        <p id='productincart_price_text" +
                cartIndex +
                '\' class="cart-product-price-text">' +
                newProductObj.product_price +
                "</p>" +
                "                    </div>" +
                "                </div>"
        )
    }
    self.selectProductInCart(cartIndex)
    self.refreshCartSummaries()
}

TakeawayClass.prototype.selectProductInCart = function (cartIndex) {
    let self = this

    if (self.selectedInCartProduct !== null) {
        $("#productincart_quantity" + self.selectedInCartProduct)
            .css("background-color", "white")
            .css("color", "black")
        $("#productincart_name" + self.selectedInCartProduct)
            .css("background-color", "white")
            .css("color", "black")
        $("#productincart_price" + self.selectedInCartProduct).css("background-color", "white")
    }

    self.selectedInCartProduct = cartIndex
    $("#productincart_quantity" + cartIndex)
        .css("background-color", "#000000")
        .css("color", "white")
    $("#productincart_name" + cartIndex)
        .css("background-color", "#000000")
        .css("color", "white")
    $("#productincart_price" + cartIndex).css("background-color", "#000000")
}

TakeawayClass.prototype.addOneMoreProductInCart = function (cartIndex) {
    let self = this
    var productCurrentQuantity = $("#productincart_quantity_text" + cartIndex).html()
    var productNewQuantity = parseInt(productCurrentQuantity) + 1

    self.updateCartProduct(cartIndex, productNewQuantity, productCurrentQuantity)
}

TakeawayClass.prototype.minusOneProductInCart = function (cartIndex) {
    let self = this

    var productCurrentQuantity = $("#productincart_quantity_text" + cartIndex).html()

    if (productCurrentQuantity > 1) {
        var productNewQuantity = parseInt(productCurrentQuantity) - 1

        self.updateCartProduct(cartIndex, productNewQuantity, productCurrentQuantity)
    } else {
        self.Helpers.toastr("warning", "Μη επιτρεπτή ποσότητα. Παρακαλώ διαγράψτε το προϊόν.")
    }
}

TakeawayClass.prototype.deleteProductFromCart = function (cartIndex) {
    let self = this
    $("#cart_index_" + cartIndex).remove()
    for (i = 0; i < self.cartProducts.length; i++) {
        if (self.cartProducts[i].cartIndex == cartIndex) {
            self.cartProducts.splice(i, 1)
            break
        }
    }

    self.selectedInCartProduct = null
    if (self.cartProducts.length > 0) {
        self.selectProductInCart(self.cartProducts[self.cartProducts.length - 1].cartIndex)
        self.refreshCartSummaries()
    } else {
        self.emptyCartAndData()
    }
}

TakeawayClass.prototype.updateCartProduct = function (cartIndex, newQuantity, currentQuantity) {
    let self = this
    $("#productincart_quantity_text" + cartIndex).html(newQuantity)

    for (i = 0; i < self.cartProducts.length; i++) {
        if (self.cartProducts[i].cartIndex == cartIndex) {
            var productNewPrice = newQuantity * (self.cartProducts[i].product_subtotal / parseInt(currentQuantity))
            var productNewDiscount = self.cartProducts[i].product_discount * newQuantity
            self.cartProducts[i].product_quantity = newQuantity
            self.cartProducts[i].product_subtotal = productNewPrice.toFixed(2)
            $("#productincart_price_text" + cartIndex).html((productNewPrice - productNewDiscount).toFixed(2))
        }
    }
    self.refreshCartSummaries()
}

TakeawayClass.prototype.refreshCartSummaries = function () {
    let self = this
    var sumStartPrice = 0
    var sumDiscount = 0
    var sumProductsQt = 0
    for (i = 0; i < self.cartProducts.length; i++) {
        sumStartPrice = parseFloat(sumStartPrice) + parseFloat(self.cartProducts[i].product_subtotal)
        sumDiscount = parseFloat(sumDiscount) + parseFloat(self.cartProducts[i].product_discount * self.cartProducts[i].product_quantity)
        sumProductsQt = sumProductsQt + self.cartProducts[i].product_quantity
    }
    $("#cart-sum-start-price").html("Αρχική τιμή: " + sumStartPrice.toFixed(2) + " €")
    $("#cart-sum-discount").html("Έκπτωση: " + sumDiscount.toFixed(2) + " €")
    $("#send-order-btn").html((sumStartPrice - sumDiscount).toFixed(2) + " €")

    self.orderTotals.sumStartPrice = sumStartPrice.toFixed(2)
    self.orderTotals.sumDiscount = sumDiscount.toFixed(2)
    self.orderTotals.sumTotal = (sumStartPrice - sumDiscount).toFixed(2)
    self.orderTotals.sumQt = sumProductsQt
}

TakeawayClass.prototype.emptyCartAndData = function () {
    let self = this
    self.cartProducts = []
    self.orderTotals = {}
    self.selectedProductsForDiscount = []
    self.typeOfDiscount = 0
    self.selectedCustomer = null

    $("#append-cart-div").html("")
    $("#cart-sum-start-price").html("Αρχική τιμή: 0,00 €")
    $("#cart-sum-discount").html("Έκπτωση: 0,00 €")
    $("#send-order-btn").html("0,00 €")
    $("#send-order-btn").css("background-color", "#25c6e4")
}

TakeawayClass.prototype.initializeCartButtons = function () {
    let self = this

    $("#send-order-btn").on("click", function () {
        if (self.cartProducts.length != 0) {
            var typeOfPayment
            if ($("#cash-card-btn").html() == "ΜΕΤΡΗΤΑ") {
                typeOfPayment = "cash"
            } else {
                typeOfPayment = "card"
            }
            if (self.selectedCustomer === null) {
                //This is a receipt
                var orderObj = {
                    orderData: {
                        user_id: self.Helpers.userData.user_id,
                        user_name: self.Helpers.userData.user_name,
                        order_payment_method: typeOfPayment,
                        products: self.cartProducts,
                        totals: self.orderTotals,
                        datetime: self.Helpers.getTodayDate(),
                        document_number: 1,
                        customer: {
                            customer_id: 1,
                        },
                    },
                }
                console.log(JSON.stringify(orderObj))
                $.ajax({
                    contentType: "application/json",
                    url: self.Helpers.LOCAL_API + "orders/receipt",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(orderObj),
                    success: function (response) {
                        if (response.status === 200) {
                            self.Helpers.toastr("success", "Επιτυχής καταχώρηση παραγγελίας.")
                            $("#cash-card-btn").html("ΜΕΤΡΗΤΑ")
                            $("#cash-card-btn").removeClass("btn-success")
                            $("#cash-card-btn").removeClass("btn-danger")
                            $("#cash-card-btn").addClass("btn-success")
                            self.emptyCartAndData()
                        } else {
                            self.Helpers.toastr("error", "Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.")
                        }
                    },
                    error: function (jqXHR, textStatus) {
                        self.Helpers.toastrServerError()
                    },
                })
            } else {
                //this is an invoice

                var orderObj = {
                    orderData: {
                        user_id: self.Helpers.userData.user_id,
                        user_name: self.Helpers.userData.user_name,
                        order_payment_method: typeOfPayment,
                        products: self.cartProducts,
                        totals: self.orderTotals,
                        datetime: self.Helpers.getTodayDate(),
                        document_number: 2,
                        customer: self.selectedCustomer,
                    },
                }
                swal(
                    {
                        title: "Αποστολή Τιμολογίου?",
                        text: "Είστε σίγουροι πως θέλετε να εκδώσετε τιμολόγιο?",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonText: "ΑΚΥΡΟ",
                        confirmButtonColor: "#5cb85c",
                        confirmButtonText: "ΑΠΟΣΤΟΛΗ",
                        closeOnConfirm: true,
                    },
                    function () {
                        $.ajax({
                            contentType: "application/json",
                            url: self.Helpers.LOCAL_API + "orders/invoice",
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify(orderObj),
                            success: function (secondResponse) {
                                if (secondResponse.status === 200) {
                                    self.Helpers.toastr("success", "Επιτυχής καταχώρηση παραγγελίας.")
                                    $("#cash-card-btn").html("ΜΕΤΡΗΤΑ")
                                    $("#cash-card-btn").removeClass("btn-success")
                                    $("#cash-card-btn").removeClass("btn-danger")
                                    $("#cash-card-btn").addClass("btn-success")
                                    self.emptyCartAndData()
                                } else {
                                    self.Helpers.toastr("error", "Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.")
                                }
                            },
                            error: function (jqXHR, textStatus) {
                                console.log(jqXHR)
                                self.Helpers.toastrServerError()
                            },
                        })
                    }
                )
            }
        }
    })

    $("#plus-product-btn").on("click", function () {
        if (self.selectedInCartProduct !== null) {
            self.addOneMoreProductInCart(self.selectedInCartProduct)
        } else {
            self.Helpers.toastr("warning", "Παρακαλώ επιλέξτε ένα από τα προϊόντα του καλαθιού.")
        }
    })

    $("#minus-product-btn").on("click", function () {
        if (self.selectedInCartProduct !== null) {
            self.minusOneProductInCart(self.selectedInCartProduct)
        } else {
            self.Helpers.toastr("warning", "Παρακαλώ επιλέξτε ένα από τα προϊόντα του καλαθιού.")
        }
    })

    $("#delete-product-btn").on("click", function () {
        // console.log(self.selectedInCartProduct);
        if (self.selectedInCartProduct !== null) {
            self.deleteProductFromCart(self.selectedInCartProduct)
        } else {
            self.Helpers.toastr("warning", "Παρακαλώ επιλέξτε ένα από τα προϊόντα του καλαθιού.")
        }
    })

    $("#cash-card-btn").on("click", function () {
        if ($(this).html() === "ΜΕΤΡΗΤΑ") {
            $(this).html("ΚΑΡΤΑ")
            $(this).removeClass("btn-success")
            $(this).addClass("btn-danger")
        } else {
            $(this).html("ΜΕΤΡΗΤΑ")
            $(this).removeClass("btn-danger")
            $(this).addClass("btn-success")
        }
    })

    $("#discount-product-btn").on("click", function () {
        $("#discount_amount_div").hide()
        $("#final_discount_btn").hide()
        $("#percent_discount_btn").show()
        $("#amount_discount_btn").show()
        $("#discount_amount").val("")
        $("#discount-modal").modal("show")
        var discountTableData = []
        for (i = 0; i < self.cartProducts.length; i++) {
            discountTableData.push([self.cartProducts[i].product_id, self.cartProducts[i].cartIndex, self.cartProducts[i].product_quantity, self.cartProducts[i].product_name, self.cartProducts[i].product_subtotal])
        }
        var discountTable = $("#order-cart-table").DataTable({
            data: discountTableData,
            paging: false,
            ordering: false,
            searching: false,
            bInfo: false,
            columns: [{ title: "ID" }, { title: "Cart_id" }, { title: "Ποσότητα" }, { title: "Όνομα προϊόντος" }, { title: "Τιμή (€)" }],
            aoColumnDefs: [
                {
                    bVisible: false,
                    aTargets: [0, 1],
                },
            ],
        })

        self.typeOfDiscount = null
        $("#amount_discount_btn").prop("disabled", "disabled")
        self.selectedProductsForDiscount = []
        discountTable.on("click", "tr", function () {
            var clickedRowData = discountTable.row($(this)).data()

            if ($(this).css("color") !== "rgb(0, 0, 0)") {
                //product is un-selected
                $(this).css("color", "rgb(0, 0, 0)")
                $(this).css("background-color", "rgb(255, 255, 255)")

                for (i = 0; i < self.selectedProductsForDiscount.length; i++) {
                    if (self.selectedProductsForDiscount[i][1] == clickedRowData[1]) {
                        self.selectedProductsForDiscount.splice(i, 1)
                        break
                    }
                }
            } else {
                //product is selected
                $(this).css("color", "rgb(255, 255, 255)")
                $(this).css("background-color", "rgb(0, 0, 0)")
                self.selectedProductsForDiscount.push(clickedRowData)
            }

            if (self.selectedProductsForDiscount.length == 1) {
                $("#amount_discount_btn").prop("disabled", false)
            } else {
                $("#amount_discount_btn").prop("disabled", "disabled")
            }
        })
    })

    $("#close-discount-modal").on("click", function () {
        $("#order-cart-table").unbind("click")
        $("#order-cart-table").DataTable().destroy()
        $("#discount-modal").modal("hide")
    })

    $("#percent_discount_btn").on("click", function () {
        $("#order-cart-table").unbind("click")
        self.typeOfDiscount = 1
        $(this).hide()
        $("#amount_discount_btn").hide()
        $("#discount_amount_label").html("Ποσοστό έκπτωσης (%):")
        $("#discount_amount_div").show(500)
        $("#final_discount_btn").show()
    })

    $("#amount_discount_btn").on("click", function () {
        $("#order-cart-table").unbind("click")
        self.typeOfDiscount = 2
        $(this).hide()
        $("#percent_discount_btn").hide()
        $("#discount_amount_label").html("Ποσό έκπτωσης (€):")
        $("#discount_amount_div").show(500)
        $("#final_discount_btn").show()
    })

    $("#final_discount_btn").on("click", function () {
        var discountAmount = $("#discount_amount").val()
        var percentDiscountAmount = 0
        if (discountAmount <= 0) {
            self.Helpers.toastr("error", "Μη αποδεκτό ποσό έκπτωσης.")
        } else {
            if (self.typeOfDiscount == 1) {
                //discount with percent
                if (self.selectedProductsForDiscount.length == 0) {
                    for (i = 0; i < self.cartProducts.length; i++) {
                        percentDiscountAmount = (discountAmount * self.cartProducts[i].product_subtotal) / self.cartProducts[i].product_quantity / 100
                        self.cartProducts[i].product_discount = (parseFloat(self.cartProducts[i].product_discount) + parseFloat(percentDiscountAmount)).toFixed(2)
                        $("#productincart_price_text" + self.cartProducts[i].cartIndex).html((self.cartProducts[i].product_subtotal - self.cartProducts[i].product_discount * self.cartProducts[i].product_quantity).toFixed(2))
                        $("#close-discount-modal").trigger("click")
                    }
                } else {
                    for (i = 0; i < self.cartProducts.length; i++) {
                        for (j = 0; j < self.selectedProductsForDiscount.length; j++) {
                            if (self.cartProducts[i].cartIndex == self.selectedProductsForDiscount[j][1]) {
                                percentDiscountAmount = (discountAmount * self.selectedProductsForDiscount[j][4]) / self.cartProducts[i].product_quantity / 100
                                self.cartProducts[i].product_discount = (parseFloat(self.cartProducts[i].product_discount) + percentDiscountAmount).toFixed(2)
                                $("#productincart_price_text" + self.cartProducts[i].cartIndex).html((self.cartProducts[i].product_subtotal - self.cartProducts[i].product_discount * self.cartProducts[i].product_quantity).toFixed(2))
                                $("#close-discount-modal").trigger("click")
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
                            self.cartProducts[i].product_discount = parseFloat(discountAmount / self.cartProducts[i].product_quantity).toFixed(2)
                            $("#productincart_price_text" + self.cartProducts[i].cartIndex).html((self.cartProducts[i].product_subtotal - self.cartProducts[i].product_discount * self.cartProducts[i].product_quantity).toFixed(2))
                            $("#close-discount-modal").trigger("click")
                            break
                        }
                    }
                }
            } else {
                self.Helpers.toastr("error", "Αδυναμία έκπτωσης")
            }
            self.Helpers.toastr("success", "Επιτυχής εφαρμογή έκπτωσης.")
            self.refreshCartSummaries()
            self.typeOfDiscount = null
        }
    })

    $("#invoice-btn").on("click", function () {
        if (self.cartProducts.length === 0) {
            self.Helpers.toastr("warning", "Παρακαλώ προσθέστε προιόντα για την έκδοση τιμολογίου.")
        } else {
            self.customersTable = $("#customers-table").DataTable({
                processing: false,
                ajax: self.Helpers.LOCAL_API + "customers/all",
                paging: true,
                searching: true,
                ordering: false,
                bPaginate: false,
                bInfo: false,
                columns: [{ data: "customer_fullname" }, { data: "customer_bussiness" }, { data: "customer_vat_number" }, { data: "customer_address" }, { data: "customer_address_number" }, { data: "customer_area" }],
            })

            self.customersTable.on("click", "tr", function () {
                var clickedRowData = self.customersTable.row($(this)).data()
                self.customersTable.rows().every(function () {
                    let row = this.node()
                    $(row).css("color", "rgb(0, 0, 0)")
                    $(row).css("background-color", "rgb(255, 255, 255)")
                })

                $(this).css("color", "rgb(255, 255, 255)")
                $(this).css("background-color", "rgb(0, 0, 0)")

                self.selectedCustomer = clickedRowData
                $("#choose-customer").attr("disabled", null)
            })
            $("#invoice-modal").modal("show")
        }
    })

    $("#close-invoice-modal").on("click", function () {
        $("#choose-customer").attr("disabled", "disabled")
        self.customersTable.destroy()
        self.selectedCustomer = null
        $("#invoice-modal").modal("hide")
    })
    $("#choose-customer").on("click", function () {
        self.Helpers.toastr("success", "Έχει επιλεγεί πελάτης για αποστολή τιμολογιίου!")
        $("#send-order-btn").css("background-color", "#337ab7")
        self.customersTable.destroy()
        $("#invoice-modal").modal("hide")
    })
}

TakeawayClass.prototype.typeNumpad = function (number, selector = "numpad-input") {
    event.preventDefault()
    let self = this
    self.countNumpadNumbers.push(number)
    this.completeNumpadValue(selector)
}

TakeawayClass.prototype.clearNumpad = function (selector = "numpad-input") {
    event.preventDefault()

    let self = this
    self.countNumpadNumbers = []
    this.completeNumpadValue(selector)
}

TakeawayClass.prototype.completeNumpadValue = function (selector = "numpad-input") {
    let self = this
    var input_value = ""

    switch (self.countNumpadNumbers.length) {
        case 0:
            input_value = "0.00"
            break
        case 1:
            if (self.countNumpadNumbers[0] != 0) {
                input_value = "0.0" + self.countNumpadNumbers[0]
            } else {
                input_value = "0.00"
                self.countNumpadNumbers.splice(0, 1)
            }

            break
        case 2:
            input_value = "0." + self.countNumpadNumbers[0] + self.countNumpadNumbers[1]
            break
        default:
            for (i = 0; i < self.countNumpadNumbers.length; i++) {
                if (i == self.countNumpadNumbers.length - 3) {
                    input_value += self.countNumpadNumbers[i] + "."
                } else {
                    input_value += self.countNumpadNumbers[i]
                }
            }
    }

    $(`#${selector}`).val(input_value)
}
