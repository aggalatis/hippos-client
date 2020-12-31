let GovermentClass = function (helpers) {

    this.helpers = helpers;

}


GovermentClass.prototype.searchAfm = function (afm) {

    let self = this;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', 'https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2', true);
    // build SOAP request
    var sr =
        "<env:Envelope xmlns:env='http://www.w3.org/2003/05/soap-envelope' xmlns:ns1='http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd' xmlns:ns2='http://rgwspublic2/RgWsPublic2Service' xmlns:ns3='http://rgwspublic2/RgWsPublic2'>" +
            "<env:Header>" +
                "<ns1:Security>" +
                    "<ns1:UsernameToken>" +
                        "<ns1:Username>AGGALATIS2912</ns1:Username>" +
                        "<ns1:Password>K0dik0$eisodou</ns1:Password>" +
                    "</ns1:UsernameToken>" +
                "</ns1:Security>" +
            "</env:Header>" +
            "<env:Body>" +
                "<ns2:rgWsPublic2AfmMethod>" +
                    "<ns2:INPUT_REC>" +
                        "<ns3:afm_called_by>800890670</ns3:afm_called_by>" +
                        "<ns3:afm_called_for>" + afm +"</ns3:afm_called_for>" +
                    "</ns2:INPUT_REC>" +
                "</ns2:rgWsPublic2AfmMethod>" +
            "</env:Body>" +
        "</env:Envelope>";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                let xmlResponse = $.parseXML(xmlhttp.responseText);
                let errorMessage = xmlResponse.getElementsByTagName('error_descr')[0].textContent;
                if (errorMessage === "") {
                    $('#customer_fullname').val(xmlResponse.getElementsByTagName('onomasia')[0].textContent)
                    $('#customer_tax_office').val(xmlResponse.getElementsByTagName('doy_descr')[0].textContent)
                    $('#customer_address').val(xmlResponse.getElementsByTagName('postal_address')[0].textContent)
                    $('#customer_address_number').val(xmlResponse.getElementsByTagName('postal_address_no')[0].textContent)
                    $('#customer_area').val(xmlResponse.getElementsByTagName('postal_area_description')[0].textContent)
                    $('#customer_postal_code').val(xmlResponse.getElementsByTagName('postal_zip_code')[0].textContent)

                    let bussinesses = xmlResponse.getElementsByTagName('item')

                    for (i = 0; i < bussinesses.length; i++) {
                        if (bussinesses[i].getElementsByTagName('firm_act_kind_descr')[0].textContent == "ΚΥΡΙΑ") {
                            $('#customer_bussiness').val(bussinesses[i].getElementsByTagName('firm_act_descr')[0].textContent)
                            break;
                        }
                    }
                    $('#customer_phone').val("")
                    self.helpers.toastr("success", "Επιτυχής ανάκτηση δεδομένων από την ΑΑΔΕ.")
                } else {
                    self.helpers.toastr("error", errorMessage)
                }


            } else {

                self.helpers.toastrServerError();
            }
        }
    }
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'application/soap+xml');
    xmlhttp.setRequestHeader('Username', 'AGGALATIS2912');
    xmlhttp.setRequestHeader('Password', 'K0dik0$eisodou');
    xmlhttp.send(sr);
    // send request
    // ...
}






