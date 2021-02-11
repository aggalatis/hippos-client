let DashboardClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.getLocalUser();
    this.initializeSummaryCards();
    this.initializeButtons();

    $('#load-dashboard-refresh').on('click', function () {
        location.reload();
    })

    setInterval(function () {
        window.location.reload();
    }, 300000)
    this.lastDayClose = "";
}

DashboardClass.prototype.initializeSummaryCards = function () {
    let self = this;

    $.ajax({
        url: self.Helpers.LOCAL_API + "ManageIncome/LastDay",
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (response) {

            if (response.status === 200) {
                self.lastDayClose = self.Helpers.changeMysqlDateToNormal(response.last_day_closed);
                $('#last-close-date').html(self.lastDayClose);
                if (self.Helpers.admin_report == true) {
                    for (i = 0; i < response.data.length; i++) {

                        switch (response.data[i].order_payment_method) {
                            case 'cash':
                                $('#sum-cash').html(parseFloat(response.data[i].income_count).toFixed(2) + " €")
                                break;
                            case 'card':
                                $('#sum-card').html(parseFloat(response.data[i].income_count).toFixed(2) + " €")
                                break;
                            case 'summary':
                                $('#sum-customers').html(response.data[i].customer_count + "  ")
                                $('#sum-income').html(parseFloat(response.data[2].income_count).toFixed(2) + " €")
                                break;
                            default:
                                break;
                        }

                    }
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

DashboardClass.prototype.initializeButtons = function () {

    let self = this;

    $('#print-income').on('click', function () {


        $.ajax({
            url: self.Helpers.LOCAL_API + "ManageIncome/Reports/X",
            type: 'GET',
            dataType: 'json',
            data: '',
            success: function (response) {
                if (response.status === 200) {

                    if (self.Helpers.send_email_report === true) {

                        let emailData = {
                            emailData: {
                                store_id: self.Helpers.store_id,
                                subject: "ΑΝΑΛΥΣΗ ΤΑΜΕΙΟΥ: ",
                                userData: response.data,
                                lastCloseDate: self.lastDayClose

                            }

                        }

                        console.log(emailData);
                        $.ajax({
                            url: self.Helpers.REMOTE_API + "Mail/SendEmail",
                            type: 'POST',
                            dataType: 'json',
                            contentType: "application/json",
                            data: JSON.stringify(emailData),
                            success: function (response) {
                                if (response.status === 200) {
                                    swal({
                                        title: "Επιτυχία Αποστολής!",
                                        text: "Επιτυχής Αποστολή Ταμείου!",
                                        type: "success",
                                        showCancelButton: false,
                                        showConfirmButton: true,
                                        cancelButtonText: "Άκυρο",
                                        confirmButtonColor: "#2fdc17",
                                        confirmButtonText: "OK"

                                    })

                                } else {

                                    self.Helpers.toastrServerError();

                                }

                            }
                        })
                    } else {

                        swal({
                            title: "Επιτυχία Εκτύπωσης!",
                            text: "Επιτυχής Εκτύπωση Ταμείου!",
                            type: "success",
                            showCancelButton: false,
                            showConfirmButton: true,
                            cancelButtonText: "Άκυρο",
                            confirmButtonColor: "#2fdc17",
                            confirmButtonText: "OK"

                        })

                    }


                } else {

                    self.Helpers.toastrServerError();

                }

            },
            error: function (jqXHR, textStatus) {

                self.Helpers.swalServerError();
            }
        });


    })

    $('#close-income').on('click', function () {

        $(this).attr('disabled', 'disabled')

        $.ajax({
            url: self.Helpers.LOCAL_API + "ManageIncome/Reports/Z",
            type: 'GET',
            dataType: 'json',
            data: '',
            success: function (response) {
                if (response.status === 200) {

                    if (self.Helpers.send_email_report === true) {

                        let emailData = {
                            emailData: {
                                store_id: self.Helpers.store_id,
                                subject: "ΚΛΕΙΣΙΜΟ ΤΑΜΕΙΟΥ: ",
                                userData: response.data,
                                lastCloseDate: self.lastDayClose

                            }

                        }

                        $.ajax({
                            url: self.Helpers.REMOTE_API + "Mail/SendEmail",
                            type: 'POST',
                            dataType: 'json',
                            contentType: "application/json",
                            data: JSON.stringify(emailData),
                            success: function (response) {
                                if (response.status === 200) {
                                    swal({
                                        title: "Επιτυχία Κλεισίματος!",
                                        text: "Επιτυχής Κλείσιμο Ταμείου!",
                                        type: "success",
                                        showCancelButton: false,
                                        showConfirmButton: true,
                                        cancelButtonText: "Άκυρο",
                                        confirmButtonColor: "#2fdc17",
                                        confirmButtonText: "OK"

                                    }, function () {
                                        window.location.reload()
                                    })

                                } else {

                                    self.Helpers.toastrServerError();

                                }

                            }
                        })
                    } else {

                        swal({
                            title: "Επιτυχία Κλεισίματος!",
                            text: "Επιτυχής Κλείσιμο Ταμείου!",
                            type: "success",
                            showCancelButton: false,
                            showConfirmButton: true,
                            cancelButtonText: "Άκυρο",
                            confirmButtonColor: "#2fdc17",
                            confirmButtonText: "OK"

                        }, function () {
                            window.location.reload()
                        })

                    }

                } else {

                    self.Helpers.toastrServerError();

                }

            },
            error: function (jqXHR, textStatus) {
                $(this).attr('disabled', null)
                self.Helpers.swalServerError();
            }
        });


    })


}