listCartItem = document.querySelector('.list-cart-item');

cartPage = null;
window.onload = () => {
    cartPage = new CartPage();
}

class CartPage extends Base {
    constructor() {
        super();
        this.cart = JSON.parse(sessionStorage.getItem('cart'));
        this.totalMoney = 0;
        this.initEvent();
        this.loadCart();
    }

    initEvent() {
        document.querySelector('.buy-continue').addEventListener('click', () => {
            window.location.href = `../index.html`;
        });
    }

    async loadCart() {
        listCartItem.innerHTML = '';
        if ((this.cart == null || this.cart.length == 0)) {
            listCartItem.append(parseHTML(`<div style="background-color: #FCE3E5; width: 100%; 
                                            height: 100px; display: flex; align-items: center; 
                                            justify-content: center; font-size: 18px;">
                                                Giỏ hàng hiện trống !
                                            </div>`));
            return;
        }
        for (let i = 0; i < this.cart.length; i++) {
            let cartItem = this.cart[i];
            let item = {};
            await this.API.getItemById(cartItem.itemId).done(res => {
                if (res.data) {
                    item = res.data;
                    this.cart[i].realPrice = item.realPrice;
                    this.cart[i].saleRate = item.saleRate;
                    this.cart[i].itemName = item.itemName;
                    this.cart[i].avatar = item.medias.split(' ')[0];
                } else {
                    item = null;
                }
            }).fail(err => {
                showToastMessenger('danger', "Có lỗi!");
            });

            if (!item) continue;
            let cartItemRow = parseHTML(`<div class="cart-item" data="${cartItem.itemId}">
                                            <div class="row">
                                                <div class="col l-2 m-2 c-5">
                                                    <img src="${getMediaUrl(item.medias.split(' ')[0])}" alt="">
                                                </div>
                                                <div class="col l-10 m-10 c-7 item-cart-info">
                                                    <div class="item-cart-name">${item.itemName}</div>
                                                    <div class="item-cart-price">
                                                        <div class="item-cart-sale-price">${this.calculateSalePrice(item)} đ</div>
                                                        <div class="item-cart-real-price">${item.realPrice} đ</div>
                                                    </div>
                                                    <div class="item-cart-quantity">
                                                        <div class="down-quantity"><i class="fa-solid fa-minus"></i></div> 
                                                        <input type="number" min="1" class="input-quantity" value="${cartItem.quantity}">
                                                        <div class="up-quantity"><i class="fa-solid fa-plus"></i></div>
                                                    </div>
                                                    <div class="remove-item-cart"><i class="fa-solid fa-trash-can"></i></div>
                                                </div>
                                            </div>
                                        </div>`);
            listCartItem.append(cartItemRow);
        }
        this.calculateTotalMoney();
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
        this.initEVentListItemCart();
    }

    initEVentListItemCart() {
        document.querySelectorAll('.cart-item').forEach(cartItemElement => {
            let itemId = cartItemElement.getAttribute('data');
            cartItemElement.querySelector('.fa-trash-can').addEventListener('click', () => {
                this.cart = this.cart.filter(i => i.itemId !== itemId);
                sessionStorage.setItem('cart', JSON.stringify(this.cart));
                this.loadCartCount();
                cartItemElement.remove();
                this.calculateTotalMoney();
            });

            cartItemElement.querySelector('input').addEventListener('change', (e) => {
                let itemChanged = this.cart.find(i => i.itemId === itemId);
                itemChanged.quantity = Number(e.target.value);
                sessionStorage.setItem('cart', JSON.stringify(this.cart));
                this.calculateTotalMoney();
            });

            cartItemElement.querySelector('.down-quantity').addEventListener('click', () => {
                let newVal = Number(cartItemElement.querySelector('input').value) - 1;
                if (newVal > 0) {
                    cartItemElement.querySelector('input').value = newVal;
                    let itemChanged = this.cart.find(i => i.itemId === itemId);
                    itemChanged.quantity = newVal;
                    sessionStorage.setItem('cart', JSON.stringify(this.cart));
                    this.calculateTotalMoney();
                }
            });

            cartItemElement.querySelector('.up-quantity').addEventListener('click', () => {
                let newVal = Number(cartItemElement.querySelector('input').value) + 1;
                cartItemElement.querySelector('input').value = newVal;
                let itemChanged = this.cart.find(i => i.itemId === itemId);
                itemChanged.quantity = newVal;
                sessionStorage.setItem('cart', JSON.stringify(this.cart));
                this.calculateTotalMoney();
            });
        });
    }

    calculateTotalMoney() {
        let totalSale = 0;
        let totalReal = 0;
        this.cart.forEach(cartItem => {
            totalSale += cartItem.quantity * this.calculateSalePrice(cartItem);
            totalReal += cartItem.quantity * cartItem.realPrice;
        });

        sessionStorage.setItem('totalMoney', totalSale);

        document.querySelector('.total-sale-price span').innerHTML = "&nbsp;" + totalSale + "&nbsp;";
        document.querySelector('.total-save-money span').innerHTML = "&nbsp;" + (totalReal - totalSale) + "&nbsp;";
    }

    prePage() {
    }
    nextPage() {

    }
}