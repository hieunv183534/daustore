class BaseApi {
    constructor() {
        this.baseUrl = 'https://daustore.herokuapp.com/api/';
        this.accessToken = sessionStorage.getItem('access_token');
    }

    signup(account) {
        return $.ajax({
            url: this.baseUrl + 'signup',
            method: 'POST',
            data: JSON.stringify(account),
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    login(phone, password) {
        return $.ajax({
            url: this.baseUrl + 'login',
            method: 'POST',
            data: JSON.stringify({ phone, password }),
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    logout() {
        return $.ajax({
            url: this.baseUrl + 'logout',
            method: 'POST',
            headers: { "Authorization": this.accessToken },
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    changePassword(password, newPassword) {
        return $.ajax({
            url: this.baseUrl + `changePassword?password=${password}&newPassword=${newPassword}`,
            method: 'POST',
            headers: { "Authorization": this.accessToken },
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    updateAccount(newAccount) {
        return $.ajax({
            url: this.baseUrl + `updateAccount`,
            method: 'POST',
            headers: { "Authorization": this.accessToken },
            data: JSON.stringify(newAccount),
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    getCategorys() {
        return $.ajax({
            url: this.baseUrl + `getCategorys`,
            method: 'GET'
        })
    }

    getItems(categoryCode = null, searchTerms = null, tag = null, orderState = 1, index = 0, count = 50) {
        let _categoryCode = (categoryCode == null) ? '' : `&categoryCode=${categoryCode}`;
        let _searchTerms = (searchTerms == null) ? '' : `&searchTerms=${searchTerms}`;
        let _tag = (tag == null) ? '' : `&tag=${tag}`;
        return $.ajax({
            url: this.baseUrl + `getItems?index=${index}&count=${count}&orderState=${orderState}${_categoryCode}${_searchTerms}${_tag}`,
            method: 'GET'
        })
    }

    getItemById(itemId) {
        return $.ajax({
            url: this.baseUrl + `getItemById/${itemId}`,
            method: 'GET'
        })
    }

    getNotifications(index = 0, count = 50) {
        return $.ajax({
            url: this.baseUrl + `getNotifications?index=${index}&count=${count}`,
            method: 'GET',
            headers: { "Authorization": this.accessToken }
        })
    }

    seenAllNotification() {
        return $.ajax({
            url: this.baseUrl + `seenAllNotification`,
            method: 'POST',
            headers: { "Authorization": this.accessToken },
        })
    }

    getOrderById(orderId) {
        return $.ajax({
            url: this.baseUrl + `getOrderById/${orderId}`,
            method: 'GET',
            headers: { "Authorization": this.accessToken },
        })
    }


    lookupOrder(key) {
        return $.ajax({
            url: this.baseUrl + `lookupOrder/${key}`,
            method: 'GET'
        })
    }

    getOrders(orderStatus = null, searchTerms = null, startTime = null, endTime = null, orderTimeState = 1, index = 0, count = 50) {
        startTime = !startTime ? null : Number(new Date(startTime)) / 1000;
        endTime = !endTime ? null : Number(new Date(endTime)) / 1000;
        let _orderStatus = (!orderStatus) ? '' : `&orderStatus=${orderStatus}`;
        let _searchTerms = (!searchTerms) ? '' : `&searchTerms=${searchTerms}`;
        let _startTime = (!startTime) ? '' : `&startTime=${startTime}`;
        let _endTime = (!endTime) ? '' : `&endTime=${endTime}`;
        console.log(_orderStatus, _searchTerms, _endTime, _startTime);
        return $.ajax({
            url: this.baseUrl + `getOrders?orderTimeState=${orderTimeState}&index=${index}&count=${count}${_orderStatus}${_searchTerms}${_startTime}${_endTime}`,
            method: 'GET',
            headers: { "Authorization": this.accessToken },
        })
    }

    addOrder(order) {
        return $.ajax({
            url: this.baseUrl + `addOrder`,
            method: 'POST',
            data: JSON.stringify(order),
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    updateOrderByCustomer(order, orderId) {
        return $.ajax({
            url: this.baseUrl + `updateOrderByCustomer/${orderId}`,
            method: 'PUT',
            data: JSON.stringify(order),
            dataType: 'json',
            contentType: 'application/json'
        })
    }

    deleteOrder(orderId) {
        return $.ajax({
            url: this.baseUrl + `deleteOrder/${orderId}`,
            method: 'DELETE',
            headers: { "Authorization": this.accessToken }
        })
    }

    getVoucherByCode(voucherCode) {
        return $.ajax({
            url: this.baseUrl + `getVoucherByCode/${voucherCode}`,
            method: 'GET'
        })
    }
}