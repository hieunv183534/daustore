listItemPay = document.querySelector('.list-item-pay');

payPage = null;
window.onload = () => {
    payPage = new PayPage();
}

class PayPage extends Base {
    constructor() {
        super();
        this.initEvent();
        this.loadListItemPay();
    }

    initEvent() {
        document.querySelectorAll('.move-button').forEach(move => {
            move.addEventListener('click', () => {
                let to = move.getAttribute('to');
                document.querySelector('.payment-content').setAttribute('step', to);
            });
        });

        document.querySelectorAll('.pay-progress > *').forEach(move => {
            move.addEventListener('click', () => {
                let to = move.getAttribute('to');
                document.querySelector('.payment-content').setAttribute('step', to);
            });
        });
    }

    loadListItemPay(){
        let items = JSON.parse(localStorage.getItem('cart'));
        
    }

    prePage() { }
    nextPage() { }
}