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
            note: ''
        };
        this.items = [],
        this.initEvent();
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

        document.querySelector('#btnPayOrder').addEventListener('click',()=>{
            this.API.addOrder(this.orderForm).done(res=>{
                showToastMessenger('success',"Đặt hàng thành công!");
                console.log(res.data);
            }).fail(error=>{
                console.log(error);
                showToastMessenger('danger',"Đặt hàng không thành công!")
            });
        });
    }

    loadListItemPay() {
        listItemPay.innerHTML = '';
        this.items = JSON.parse(localStorage.getItem('cart'));
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

        document.querySelector('#totalMoneyPay').innerHTML = `${localStorage.getItem('totalMoney')} VNĐ`;
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
            buyerName : document.querySelector('#valueBuyerName').value,
            phone:document.querySelector('#valuePhone').value ,
            unitCode: document.querySelector('#valueWard').getAttribute('value'),
            address: document.querySelector('#valueAddress').value,
            items: payPage.getValueItemsFromCart(),
            note: document.querySelector('#valueNote').value
        }
        console.log(payPage.orderForm);
    }

    getValueItemsFromCart(){
        let itemsArr = [];
        this.items.forEach(item=>{
            itemsArr.push(`${item.quantity}|${item.itemId}`);
        });
        return itemsArr.join(' _and_ ');
    }

    prePage() { }
    nextPage() { }
}