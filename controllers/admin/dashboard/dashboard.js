let DashboardClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.getLocalUser();
    this.initializeSummaryCards();
    this.initializeButtons();

    $('#load-dashboard-refresh').on('click',function() {
        location.reload();
    })

}

DashboardClass.prototype.initializeSummaryCards = function() {
    let self = this;

    $.ajax({
        url: self.Helpers.LOCAL_API + "ManageIncome/LastDay",
        type: 'GET',
        dataType: 'json',
        data: '',
        success: function (response) {

            if (response.status === 200) {

                $('#last-close-date').html(response.last_day_closed);
                for(i=0; i < response.data.length; i++) {

                    switch(response.data[i].order_payment_method) {
                        case 'cash':
                            $('#sum-cash').html(response.data[i].income_count.toFixed(2) + " €")
                            break;
                        case 'card':
                            $('#sum-card').html(response.data[i].income_count.toFixed(2) + " €")
                            break;
                        case 'summary':
                            $('#sum-customers').html(response.data[i].customer_count + "  ")
                            $('#sum-income').html(response.data[2].income_count.toFixed(2) + " €")
                            break;
                        default:
                            break;
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

DashboardClass.prototype.initializeButtons = function() {

    let self = this;

    $('#print-income').on('click', function() {




    })



}