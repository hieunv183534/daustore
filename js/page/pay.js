listItemPay = document.querySelector('.list-item-pay');

payPage = null;
window.onload = () => {
    payPage = new PayPage();

    Validator({
        form: '.buyer-info',
        rules: [
            Validator.isRequired('#valueBuyerName'),
            Validator.isRequired('#valuePhone'),
            Validator.isRequired('#valueWard'),
            Validator.isRequired('#valueAddress'),
        ],
        submitSelector: '#btnSubmitInfoForm',
        onSubmit: payPage.formBuyerInfoOnSubmit
    });
}

class PayPage extends Base {
    constructor() {
        super();
        this.orderForm = {
            buyerName: '',
            phone: '',
            unitCode: '',
            address: '',
            items: '',
            note: '',
            voucherId: '00000000-0000-0000-0000-000000000000',
        };
        this.items = [];
        this.totalMoney = 0;
        this.totalMoneyAfterVoucher = 0;

        /**
         * mode = 1: đơn đặt hàng từ giỏ hàng
         * mode = 2: đơn đặt hàng ngay. chỉ có 1 sản phẩm
         * mode = 3: xem thông tin đơn hàng có sẵn
         */
        this.url = new URL(window.location.href);
        var _mode = this.url.searchParams.get("mode");
        if (!_mode) {
            this.mode = 1;
        } else {
            this.mode = Number(_mode);
        }

        if (this.mode !== 3) {
            this.initEvent();
        } else {
            this.bindOrderToPage();
        }

        this.loadListItemPay();
    }

    initEvent() {
        document.querySelector('#valueBuyerName').focus();

        document.querySelectorAll('.move-button').forEach(move => {
            move.addEventListener('click', () => {
                let to = move.getAttribute('to');
                if (!(document.querySelector('.payment-content').getAttribute('step') == '1'))
                    document.querySelector('.payment-content').setAttribute('step', to);
            });
        });

        document.querySelectorAll('.pay-progress > *').forEach(move => {
            move.addEventListener('click', () => {
                let to = move.getAttribute('to');
                if (Number(document.querySelector('.payment-content').getAttribute('step')) > Number(to))
                    document.querySelector('.payment-content').setAttribute('step', to);
            });
        });

        document.querySelector('#btnPayOrder').addEventListener('click', () => {
            console.log(this.orderForm);
            this.API.addOrder(this.orderForm).done(res => {
                showToastMessenger('success', "Đặt hàng thành công!");
                sessionStorage.setItem('cart', '[]');
                sessionStorage.setItem('totalMoney', 0);
                this.loadCartCount();
                document.querySelector('#orderQrCode').setAttribute('src',
                `https://api.qrserver.com/v1/create-qr-code/?data=${res.data.orderCode}&size=200x200`);
                document.querySelector('#valueOrderCode').innerHTML = res.data.orderCode;
                document.querySelector('.payment-content').setAttribute('step', '4');
            }).fail(error => {
                console.log(error);
                showToastMessenger('danger', "Đặt hàng không thành công!");
                
            });
        });

        document.querySelector('#btnVoucher').addEventListener('click', () => {
            let voucherCode = document.querySelector('#infoVoucherCode').value;
            this.API.getVoucherByCode(voucherCode).done(res => {
                let voucher = res.data;
                console.log(voucher);
                if (!voucher) {
                    showToastMessenger('danger', "Mã khuyến mãi không đúng");
                    document.querySelector('#totalMoneyPay').innerHTML = `${this.totalMoney} VNĐ`;
                    document.querySelector('#infoVoucherDetail').value = '';
                    document.querySelector('#infoVoucherDetail').setAttribute('title', '');
                    this.orderForm.voucherId = '00000000-0000-0000-0000-000000000000';
                } else if (Number(new Date()) > Number(new Date(voucher.dateExpired))) {
                    showToastMessenger('danger', "Mã khuyến mãi hết hạn");
                    document.querySelector('#totalMoneyPay').innerHTML = `${this.totalMoney} VNĐ`;
                    document.querySelector('#infoVoucherDetail').value = '';
                    document.querySelector('#infoVoucherDetail').setAttribute('title', '');
                    this.orderForm.voucherId = '00000000-0000-0000-0000-000000000000';
                } else if (voucher.quota < 1) {
                    showToastMessenger('danger', "Mã khuyến mãi hết số lượng");
                    document.querySelector('#totalMoneyPay').innerHTML = `${this.totalMoney} VNĐ`;
                    document.querySelector('#infoVoucherDetail').value = '';
                    document.querySelector('#infoVoucherDetail').setAttribute('title', '');
                    this.orderForm.voucherId = '00000000-0000-0000-0000-000000000000';
                } else if (voucher.minTotal > this.totalMoney) {
                    showToastMessenger('danger', "Giá trị đơn hàng chưa đủ để áp dụng voucher này");
                    document.querySelector('#totalMoneyPay').innerHTML = `${this.totalMoney} VNĐ`;
                    document.querySelector('#infoVoucherDetail').value = '';
                    document.querySelector('#infoVoucherDetail').setAttribute('title', '');
                    this.orderForm.voucherId = '00000000-0000-0000-0000-000000000000';
                } else {
                    document.querySelector('#infoVoucherDetail').value = voucher.description;
                    document.querySelector('#infoVoucherDetail').setAttribute('title', voucher.description);
                    if (!voucher.saleRate) {
                        this.totalMoneyAfterVoucher = this.totalMoney - voucher.saleNumber;
                    } else {
                        let sale = (voucher.saleRate * this.totalMoney) > voucher.maxNumber ? voucher.maxNumber : (voucher.saleRate * this.totalMoney);
                        this.totalMoneyAfterVoucher = this.totalMoney - sale;
                    }
                    document.querySelector('#totalMoneyPay').innerHTML = `${this.totalMoneyAfterVoucher} VNĐ`;
                    showToastMessenger('success', "Áp dụng mã giảm giá thành công!");
                    this.orderForm.voucherId = voucher.voucherId;
                }
            }).fail(err => {
                console.log(err);
            })
        });
    }

    // bindOrderToPage(){
    //     let orderId = 
    // }

    async loadListItemPay() {
        listItemPay.innerHTML = '';
        // lấy và hiển thị lên danh sách item trong từng trường hợp
        switch (this.mode) {
            case 1:
                this.items = JSON.parse(sessionStorage.getItem('cart'));
                document.querySelector('#totalMoneyPay').innerHTML = `${sessionStorage.getItem('totalMoney')} VNĐ`;
                this.totalMoney = Number(sessionStorage.getItem('totalMoney'));
                break;
            case 2:
                let _itemId = this.url.searchParams.get("itemId");
                let _quantity = Number(this.url.searchParams.get("quantity"));
                await this.API.getItemById(_itemId).done(res => {
                    console.log(res);
                    this.items.push({
                        avatar: res.data.medias.split(' ')[0],
                        itemName: res.data.itemName,
                        realPrice: res.data.realPrice,
                        saleRate: res.data.saleRate,
                        quantity: _quantity,
                        itemId: _itemId
                    });
                    document.querySelector('#totalMoneyPay').innerHTML = `${this.calculateSalePrice(res.data) * _quantity} VNĐ`;
                    this.totalMoney = this.calculateSalePrice(res.data) * _quantity;
                });
                break;
            case 3:
                break;
            default:
                break;
        }
        this.items.forEach(item => {
            let itemPayElement = parseHTML(`<div class="cart-item">
                                                <div class="row">
                                                    <div class="col l-2 m-2 c-5">
                                                        <img src="${getMediaUrl(item.avatar)}">
                                                    </div>
                                                    <div class="col l-10 m-10 c-7 item-cart-info">
                                                        <div class="item-cart-name">${item.itemName}</div>
                                                        <div class="item-cart-price">
                                                            <div class="item-cart-sale-price">Đơn giá:&nbsp;</div>
                                                            <div class="item-cart-sale-price">${this.calculateSalePrice(item)} đ</div>
                                                        </div>
                                                        <div class="item-cart-price">
                                                            <div class="item-cart-sale-price">Số lượng:&nbsp;</div>
                                                            <div class="item-cart-sale-price">${item.quantity}</div>
                                                        </div>
                                                        <div class="item-cart-price">
                                                            <div class="item-cart-sale-price">Thành tiền:&nbsp;</div>
                                                            <div class="item-cart-sale-price">${this.calculateSalePrice(item) * item.quantity} đ</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`);
            listItemPay.append(itemPayElement);
        });
    }

    formBuyerInfoOnSubmit() {
        document.querySelector('.payment-content').setAttribute('step', 2);
        document.querySelector('#infoBuyerName').value = document.querySelector('#valueBuyerName').value;
        document.querySelector('#infoPhone').value = document.querySelector('#valuePhone').value;
        document.querySelector('#infoEmail').value = document.querySelector('#valueEmail').value;
        document.querySelector('#infoProvince').value = document.querySelector('#valueProvinceName').value;
        document.querySelector('#infoDistrict').value = document.querySelector('#valueDistrictName').value;
        document.querySelector('#infoWard').value = document.querySelector('#valueWardName').value;
        document.querySelector('#infoAddress').value = document.querySelector('#valueAddress').value;
        document.querySelector('#infoNote').value = document.querySelector('#valueNote').value;

        payPage.orderForm = {
            buyerName: document.querySelector('#valueBuyerName').value,
            phone: document.querySelector('#valuePhone').value,
            email: document.querySelector('#valueEmail').value,
            unitCode: document.querySelector('#valueWard').getAttribute('value'),
            address: document.querySelector('#valueAddress').value,
            items: payPage.getValueItemsFromCart(),
            note: document.querySelector('#valueNote').value,
            voucherId: '00000000-0000-0000-0000-000000000000'
        }
        console.log(payPage.orderForm);
    }

    getValueItemsFromCart() {
        console.log(this.items);
        let itemsArr = [];
        this.items.forEach(item => {
            itemsArr.push(`${item.quantity}|${item.itemId}`);
        });
        return itemsArr.join(' _and_ ');
    }

    prePage() { }
    nextPage() { }
}