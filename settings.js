// S-POS settings
module.exports = {


    init: function() {

        let self = this;
        return {
			"store_id": 1,
            "LOCAL_API": "http://127.0.0.1:8088/hippoApi/",
            "REMOTE_API": "http://174.138.4.153/sposServer/",
			"autologin": false,
			"autologin_user": "TAMEIO",
			"autologin_password": "1",
			"cart_height": "460px",
			"send_order_height": "120px",
			"products_height": "100px",
			"products_width": "100%",
			"numpad_input_height": "100px",
			"numpad_numbers_height": "130px",
			"admin_report": true,
			"mydata_invoices": true,
			"send_email_report": true
						
		}
	}
			
}