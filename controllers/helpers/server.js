let ServerClass = function (helpers) {
    this.Helpers = helpers
    this.LOCAL_API = helpers.LOCAL_API
}

ServerClass.prototype.getData = async function (endpoint) {
    let self = this

    const resp = new Promise((resolve, reject) => {
        $.ajax({
            url: self.LOCAL_API + endpoint,
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) {
                if (response.status !== 200) self.Helpers.toastrServerError()
                resolve(response.data)
            },
            error: function (err) {
                self.Helpers.swalServerError()
                reject(err)
            },
        })
    })
    return resp
}

ServerClass.prototype.postData = async function (endpoint, data) {
    let self = this

    const resp = new Promise((resolve, reject) => {
        $.ajax({
            url: self.LOCAL_API + endpoint,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.status !== 200) self.Helpers.toastrServerError()
                resolve(response)
            },
            error: function (err) {
                self.Helpers.swalServerError()
                reject(err)
            },
        })
    })
    return resp
}

ServerClass.prototype.putData = async function (endpoint, data) {
    let self = this

    const resp = new Promise((resolve, reject) => {
        $.ajax({
            url: self.LOCAL_API + endpoint,
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.status !== 200) self.Helpers.toastrServerError()
                resolve(response)
            },
            error: function (err) {
                self.Helpers.swalServerError()
                reject(err)
            },
        })
    })
    return resp
}
