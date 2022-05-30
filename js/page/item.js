itemPage = null;
window.onload = () => {
    itemPage = new ItemPage();
}

class ItemPage extends Base {
    constructor() {
        super();
        this.itemForm = {};
        var url = new URL(window.location.href);
        var itemId = url.searchParams.get("itemId");
        this.loadItem(itemId);
        this.initEvent();
        this.loadCategory();
    }

    initEvent() {
        document.querySelectorAll('.tag-for-item').forEach(tagElement => {
            tagElement.addEventListener('click', () => {
                document.querySelectorAll('.tag-for-item').forEach(e => e.classList.remove('active'));
                tagElement.classList.add('active');
                this.filterItem.tag = tagElement.getAttribute('tag');
                this.loadListItem();
            })
        });

        document.querySelectorAll('.order-for-item').forEach(orderElement => {
            orderElement.addEventListener('click', () => {
                document.querySelectorAll('.order-for-item').forEach(e => e.classList.remove('active_'));
                orderElement.classList.add('active_');
                this.filterItem.orderState = Number(orderElement.getAttribute('value'));
                this.loadListItem();
            })
        });
    }

    loadItem(itemId) {
        this.API.getItemById(itemId).done(res => {
            console.log(res.data);
            this.itemForm = res.data;
            document.querySelector('.main-item-name').innerHTML = res.data.itemName;
            document.querySelector('.main-item-code').innerHTML = res.data.itemCode;
            document.querySelector('.main-sale-price').innerHTML = this.calculateSalePrice(res.data) + ' đ';
            document.querySelector('.main-real-price').innerHTML = res.data.realPrice + ' đ';
            document.querySelector('.main-sale-rate').innerHTML = '-' + res.data.saleRate + '%';
            document.querySelector('.main-item-img').setAttribute('src', getMediaUrl(res.data.medias.split(' ')[0]));
            this.itemForm.listMediaUrl = res.data.medias.split(' ');
            this.itemForm.listMediaUrl.forEach(function (part, index, theArray) {
                theArray[index] = getMediaUrl(theArray[index]);
            });

            let listCategory = JSON.parse(localStorage.getItem('category'));
            let thisCategory = listCategory.find(c => c.categoryCode == res.data.categoryCode);

            let listInfo = document.querySelector('.main-item-description ul');
            listInfo.innerHTML = '';
            for (let i = 0; i < thisCategory.categoryListDescription.length; i++) {
                let li = parseHTML(`<li>
                                        <b>${thisCategory.categoryListDescription[i]}: </b>
                                        <p>${res.data.listDescription[i]}</p>
                                    </li>`);
                listInfo.append(li);
            }

        }).fail(err => {
            console.log(err);
            showToastMessenger('danger', "Đã có lỗi xảy ra. Vui lòng tải lại trang!")
        })
    }

    prePage() {
        this.loadListItem();
    }
    nextPage() {
        if (this.index >= this.total) {
            this.index -= this.count
            showToastMessenger('danger', "Đã đến trang cuối!")
        } else {
            this.loadListItem();
        }
    }
}