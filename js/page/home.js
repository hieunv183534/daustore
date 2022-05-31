homePage = null;
window.onload = () => {
    homePage = new HomePage();
}

class HomePage extends Base {
    constructor() {
        super();
        this.index = 0;
        this.count = 20;
        this.filterItem = {
            categoryCode: "",
            searchTerms: "",
            tag: "",
            orderState: 1
        };
        this.loadListItem();
        this.initEvent();
        this.loadCategory();
        this.loadListProvince();
    }

    loadListProvince() {
        this.API.getUnits('|').done(res => {
            localStorage.setItem('listProvince', JSON.stringify(res.data));
        }).fail(error => {
            showToastMessenger('danger', "Đã có lỗi trong lúc load danh sách tỉnh!");
        })
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

    loadListItem() {
        this.API.getItems(this.filterItem.categoryCode, this.filterItem.searchTerms,
            this.filterItem.tag, this.filterItem.orderState, this.index, this.count).done(res => {
                this.total = res.data.total;
                this.reloadPagingInfo();
                this.renderListItem(res.data.data);
            }).fail(error => {
                showToastMessenger('danger', "Lỗi không load được danh sách sản phẩm!")
            });
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