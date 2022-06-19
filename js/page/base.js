listItem = document.querySelector('.list-item');

class Base {
    constructor() {
        this.index = 0;
        this.count = 10;
        this.total = 0;
        this.API = new BaseApi();
        this.initEventBase();
    }

    initEventBase() {
        var seft = this;

        document.querySelector('.to-top').style.display = "none";
        window.onscroll = function () { scrollFunction() };
        function scrollFunction() {
            if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
                document.querySelector('.to-top').style.display = "flex";
            } else {
                document.querySelector('.to-top').style.display = "none";
            }
        }
        $(".to-top").click(function () {
            $("html, body").animate({ scrollTop: 0 }, "slow");
            return false;
        });

        if (document.querySelector('.paging-bar')) {

            document.querySelector(".paging-bar .next-page").addEventListener('click', () => {
                this.index += this.count;
                this.nextPage();
            });

            document.querySelector(".paging-bar .pre-page").addEventListener('click', () => {
                if ((this.index - this.count) < 0) {
                    this.index = 0;
                } else {
                    this.index -= this.count;
                    this.prePage();
                }
            });
        };

        document.querySelectorAll('.input.search-box').forEach(searchBox => {
            searchBox.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                    this.loadListItem();
                }
            });

            searchBox.addEventListener('input', (e) => {
                this.filterItem.searchTerms = e.target.value;
            })
        });

        document.querySelectorAll('.btn-search').forEach(s => {
            s.addEventListener('click', () => {
                this.loadListItem();
            })
        })
    }

    reloadPagingInfo() {
        document.querySelector('#pagingInfo strong').innerHTML =
            `Trang ${this.index / this.count + 1} / ${Math.ceil(this.total / this.count)}`;
    }

    initEventTable() {
        var trs = document.querySelectorAll('tbody tr');
        trs.forEach(tr => {
            tr.addEventListener('dblclick', () => {
                var item = JSON.parse(tr.getAttribute("myItem"));
                this.tableRowOnDBClick(item, tr);
            })
        });
    }

    async loadCategory() {
        await this.API.getCategorys().done(res => {
            localStorage.setItem('category', JSON.stringify(res.data));
            this.renderCategory(res.data, '');
            this.renderCategory(res.data, 'x');
            this.initEventCategory();
        }).fail(error => {
            showToastMessenger('danger', "Có lỗi");
        })
    }

    renderCategory(listCategory, tag) {
        document.querySelector(`#category${tag}`).append(parseHTML(`<div class="tree-nav__item-title" code="" name="Tất cả sản phẩm">
                                                                <p>Tất cả sản phẩm</p>
                                                            </div>`));

        if (listCategory) {
            for (let i = 0; i < listCategory.length; i++) {
                if ((listCategory[i].parentCode === '') && !listCategory[i].isExpandable) {
                    document.querySelector(`#category${tag}`).append(parseHTML(`<div class="tree-nav__item"></div>`));
                    break;
                }
            };
            listCategory.forEach(category => {
                let parentElement = document.querySelector(`#category${tag}${category.parentCode}`);
                if (!category.isExpandable) {
                    let str = `<div class="tree-nav__item-title" id="category${tag}${category.categoryCode}" code="${category.categoryCode}" name="${category.categoryName}">
                                    <p>${category.categoryName}</p>
                                </div>`;
                    let categoryElement = parseHTML(str);
                    if (parentElement.querySelector('.tree-nav__item'))
                        parentElement.querySelector('.tree-nav__item').append(categoryElement);
                } else {
                    let str = `<details class="tree-nav__item is-expandable" id="category${tag}${category.categoryCode}">
                                    <summary class="tree-nav__item-title">${category.categoryName}</summary>
                                    <div class="tree-nav__item">
                                        <div class="tree-nav__item-title" code="${category.categoryCode}"  name="${category.categoryName}">
                                            <p>Tất cả</p>
                                        </div>
                                    </div>
                                </details>`;
                    let categoryElement = parseHTML(str);
                    parentElement.append(categoryElement);
                }
            });
        }
    }

    initEventCategory() {
        document.querySelectorAll('#category div.tree-nav__item-title').forEach(element => {
            element.addEventListener('click', () => {
                document.querySelector('#categoryMain span').innerHTML = element.getAttribute('name');
                document.querySelectorAll('#category div.tree-nav__item-title').forEach(e => {
                    e.classList.remove('active');
                });
                element.classList.add('active');
                console.info(element);
                this.filterItem.categoryCode = element.getAttribute('code');
                this.loadListItem();
            });
        });
        document.querySelectorAll('#categoryx div.tree-nav__item-title').forEach(element => {
            element.addEventListener('click', () => {
                document.querySelector('#categoryMainx span').innerHTML = element.getAttribute('name');
                document.querySelectorAll('#categoryx div.tree-nav__item-title').forEach(e => {
                    e.classList.remove('active');
                })
                element.classList.add('active');
                console.info(element);
                this.filterItem.categoryCode = element.getAttribute('code');
                this.loadListItem();
            });
        });

    }

    calculateSalePrice(item) {
        return item.realPrice * (100 - item.saleRate) / 100;
    }

    renderListItem(items) {
        listItem.innerHTML = '';
        items.forEach(item => {
            let itemElement = parseHTML(`<div class="col l-3 m-4 c-6">
                                            <div class="item-item" data='${JSON.stringify(item)}'>
                                                <div class="sale-rate">-${item.saleRate}%</div>
                                                <img src="${getMediaUrl(item.medias.split(' ')[0])}">
                                                <div class="item-title">${item.itemName}</div>
                                                <div class="item-price">
                                                    <p class="sale-price">${this.calculateSalePrice(item)} <font>đ</font>
                                                    </p>
                                                    <p class="real-price">${item.realPrice} <font>đ</font>
                                                    </p>
                                                </div>
                                                <div class="item-footer">
                                                    <div class="like-item">
                                                        <i class="fa-solid fa-heart"></i>
                                                    </div>
                                                    <div class="add-to-cart">
                                                        <i class="fa-solid fa-cart-plus"></i>
                                                    </div>
                                                    <div class="buy-now">
                                                        Mua ngay
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`);
            listItem.append(itemElement);
        });

        document.querySelectorAll('.item-item').forEach(itemElement => {
            var itemData = JSON.parse(itemElement.getAttribute('data'));
            itemElement.addEventListener('click', () => {
                window.location.href = `./page/item.html?itemId=${itemData.itemId}`;
            });

            itemElement.querySelector('.like-item').addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                alert("Like item" + itemData.itemName);
            });

            itemElement.querySelector('.add-to-cart').addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                let cartJSON = sessionStorage.getItem('cart');
                let cart = [];
                if (cartJSON) {
                    cart = JSON.parse(cartJSON);
                }
                let sameItem = cart.find(i => i.itemId === itemData.itemId);
                if (sameItem) {
                    sameItem.quantity += 1;
                } else {
                    cart.push({ itemId : itemData.itemId, quantity: 1 });
                }
                sessionStorage.setItem('cart', JSON.stringify(cart));
                showToastMessenger('success', `Thêm thành công 1 ${itemData.itemName} vào giỏ hàng!`)
            });

            itemElement.querySelector('.buy-now').addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                alert("Mua ngay " + itemData.itemName);
                window.location.href = `./page/pay.html?mode=2&itemId=${itemData.itemId}&quantity=${1}`;
            });
        })
    }

    initEventListItem() {

    }

    prePage() { }
    nextPage() { }
    loadListItem() { }
    loadCart() { }
}