
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content.firstChild;
}



//-------------------combobox-------------------------------------------------------------------------------------------------
var cbbs = document.querySelectorAll('.combobox .input');
var dataList = document.querySelector('.data-list');

if (cbbs) {
    cbbs.forEach(element => {
        element.addEventListener('click', (e) => {
            var top = e.target.getBoundingClientRect().top + 37;
            var left = e.target.getBoundingClientRect().left;
            var width = e.target.offsetWidth;
            console.log(top + "    " + left);
            dataList.setAttribute('forCbbId', element.parentElement.getAttribute('id'));
            loadComboboxList(element.parentElement.getAttribute('type'), element.parentElement.getAttribute('id'));
            dataList.style.cssText = `left: ${left}px; top: ${top}px; width: ${width}px;`;
            dataList.classList.add('data-list-show');
        });

        element.addEventListener('blur', (e) => {
            setTimeout(() => {
                dataList.classList.remove('data-list-show');
            }, 500);
        })
    });

    function eventForItem() {
        var items = document.querySelectorAll('.data-list .data-item');
        items.forEach(element => {
            element.addEventListener('click', () => {
                items.forEach(item => {
                    item.classList.remove('item-active');
                })
                console.log(element.getAttribute('valueid') + ' - ' + element.getAttribute('valuename'));
                element.classList.add('item-active');
                document.querySelector(`#${element.parentElement.getAttribute('forCbbId')}`).querySelector('.input').value = element.getAttribute('valuename');
                document.querySelector(`#${element.parentElement.getAttribute('forCbbId')}`).setAttribute('value', element.getAttribute('valueid'));


                if (element.getAttribute('valuetype') !== "w") {
                    showLoader();
                    // load list unit con cho unit vừa đc chọn
                    unitApi.getById(element.getAttribute('valueid'), 1, 70, "").then(res => {
                        console.log(res.data);
                        res.data.shift();
                        if (element.getAttribute('valuetype') == "p") {
                            localStorage.setItem("listDistrict", JSON.stringify(res.data));
                            document.querySelector('#valueDistrict input').value = "Chọn quận,huyện";
                            document.querySelector('#valueWard input').value = "Chọn xã,phường";
                        } else if (element.getAttribute('valuetype') == "d") {
                            localStorage.setItem("listWard", JSON.stringify(res.data));
                            document.querySelector('#valueWard input').value = "Chọn xã,phường";
                        }
                        hideLoader();
                    }).catch(error => {
                        console.log(error);
                    })
                }
            });
        })
    };

    function loadComboboxList(type, idCbb) {
        var dataList = document.querySelector('.data-list');
        dataList.innerHTML = '';
        listCbbData = JSON.parse(localStorage.getItem(`list${type}`));
        listCbbData.forEach(element => {
            if (element.unitCode == document.querySelector(`#${idCbb}`).getAttribute('value')) {
                dataList.append(parseHTML(`<div class="data-item item-active" valueid="${element.unitCode}" valuename="${element.unitName}" valuetype="${element.type}">${element.unitName}</div>`));
            } else {
                dataList.append(parseHTML(`<div class="data-item" valueid="${element.unitCode}" valuename="${element.unitName}" valuetype="${element.type}">${element.unitName}</div>`));
            }
        });
        eventForItem();
    };
};

function setValueCbb(cbbElement, value) {
    cbbElement.setAttribute('value', value)
    unitApi.getSingleUnitInfo(value).then(res => {
        cbbElement.querySelector('input').value = res.data.unitName;
    }).catch(error => {
        console.log(error);
    })
}

//----------------------------------------------------------------------------------------------------------------------------

//-------------------------table-------------------------------------------------------------------------------------------
function loadTable(columns, datas, startIndex) {
    var index = startIndex;
    document.querySelector("table").innerHTML = "";

    var colgroup = parseHTML('<colgroup></colgroup>');
    colgroup.append(parseHTML(`<col style="min-width:60px; max-width:70px;">`));
    colgroup.append(parseHTML(`<col style="min-width:50px; max-width:60px;">`));
    columns.forEach(column => {
        var col = parseHTML(`<col style="${column.width} max-width:300px;">`);
        colgroup.append(col);
    });
    document.querySelector("table").append(colgroup);


    var thead = parseHTML('<thead></thead>');
    thead.append(parseHTML(`<th style="text-align: right;">
    <div class="checkbox" value="0">
    <i class="fas fa-check"></i>
    </div>
    </th>`));
    thead.append(parseHTML(`<th style="text-align: right;"><p>STT</p></th>`));
    console.log(thead);
    columns.forEach(col => {
        var th = parseHTML(`<th style="${col.style}"><p>${col.title}</p></th>`);
        thead.append(th);
    });
    document.querySelector("table").append(thead);

    var tbody = parseHTML('<tbody></tbody>');
    datas.forEach(item => {
        var tr = parseHTML(`<tr></tr>`);
        tr.setAttribute("myItem", JSON.stringify(item));
        tr.append(parseHTML(`<td style="text-align: right;">
        <div class="checkbox" value="0">
        <i class="fas fa-check"></i>
        </div>
        </td>`));
        tr.append(parseHTML(`<td style="text-align: right;"><p>${index++}</p></td>`));
        columns.forEach(col => {
            let value;
            if (col.format == 'boolean') {
                value = item[`${col.field}`] ?
                    `<i class="fas fa-check-square" style="color:#2CA029;"></i>` :
                    `<i class="fas fa-times-circle" style="color:#EC5504;"></i>`
            } else if (col.format == 'date') {
                value = formatDate(item[`${col.field}`]);
            } else if (col.format == "listitem") {
                let listItem = item[`${col.field}`];
                value = parseHTML('<div class="list-item-order"></div>');
                listItem.forEach(i => {
                    value.append(parseHTML(`<div class="item-order">
                                                <img src="${i.imgUrl}" alt="" style="width: 80px;">
                                                <span> <b>X${i.quantity}</b> ${i.name}</span>
                                            </div>`));
                })
            } else if (col.format == "orderer") {
                let orderer = item[`${col.field}`];
                value = `<b>${orderer.name}</b>,<br>${orderer.phone},<br>${orderer.address}`;
            }
            else {
                value = item[`${col.field}`];
            }
            if (col.format == "listitem") {
                var td = parseHTML(`<td style="${col.style}"></td>`);
                td.append(value);
                tr.append(td);
            } else if (col.format == "orderer") {
                var td = parseHTML(`<td style="${col.style}">${value}</td>`);
                tr.append(td);
            }
            else {
                var td = parseHTML(`<td style="${col.style}"><p>${value}</p></td>`);
                tr.append(td);
            }
        });
        tbody.append(tr);
    });
    document.querySelector("table").append(tbody);

    initEventCheckbox();
    initEventCheckboxTable();
    hideLoader();
}

function initEventCheckboxTable() {
    document.querySelector('th .checkbox').addEventListener('click', () => {
        setTimeout(() => {
            var val = document.querySelector('th .checkbox').getAttribute('value');
            document.querySelectorAll('table tbody .checkbox').forEach(item => {
                item.setAttribute("value", val);
            });
        }, 100);
    })
}

//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------loader-----------------------------------------------------------------------------------
var loader = document.querySelector('.loader');

function showLoader() {
    loader.setAttribute('isShow', 'show');
}

function hideLoader() {
    loader.setAttribute('isShow', 'hide');
}


//-----------------------------------------------------------------------------------------------------------------------
//-----------------------------toastMessenger---------------------------------------------------------------------------
var toastMessenger = document.querySelector('.toast-messenger');

function showToastMessenger(type, text) {
    toastMessenger.setAttribute('type', type);
    toastMessenger.querySelector('.mes-text').innerHTML = text;
    toastMessenger.setAttribute('isShow', 'show');
    setTimeout(() => {
        toastMessenger.setAttribute('isShow', 'hide');
    }, 4000);
}


//---------------------------------------------------------------------------------------------------------------------
//-----------------------radioButton-----------------------------------------------------------------------------------
var radioButtons = document.querySelectorAll('.radio-button');

if (radioButtons) {
    radioButtons.forEach(radioButton => {
        var rbGroup = radioButton.parentElement;
        radioButton.addEventListener('click', (e) => {
            if (e.target.getAttribute('value') == '1') {
                // e.target.setAttribute('value', '0');
                // rbGroup.setAttribute('value', null);
            } else {
                rbGroup.querySelectorAll('.radio-button').forEach(rb => {
                    rb.setAttribute('value', '0');
                })
                e.target.setAttribute('value', '1');
                rbGroup.setAttribute('value', e.target.getAttribute('label'));
            }
        });
    });
};

function setValueForRBG(RbgEle, newValue) {
    newValue = newValue + "";
    rbs = RbgEle.querySelectorAll(".radio-button");
    rbs.forEach(rb => {
        rb.setAttribute('value', '0');
        if (rb.getAttribute('label') == newValue) {
            rb.setAttribute('value', '1');
        }
    })
};

function getValueRGB(RbgEle) {
    value = RbgEle.getAttribute('value');
    datatype = RbgEle.getAttribute('datatype');
    switch (datatype) {
        case 'number':
            value = Number(value);
            break;
        case 'boolean':
            if (value === 'true') {
                value = true;
            } else {
                value = false;
            }
            break;
        case 'string':
            break;
    }
    return value;
}

function getBoolean(ele) {
    value = ele.getAttribute('value');
    datatype = ele.getAttribute('datatype');
    switch (datatype) {
        case 'boolean':
            if (value == 'Có') {
                value = true;
            }
            else if (value == 'Không') {
                value = false;
            }
            break;
    }
    return value;
}

//---------------------------------------------------------------------------------------------------------------------
//---------------post--------------------------------------------------------------------------------------------------
function loadListPost(posts) {
    var postList = document.querySelector(".post-list");
    postList.innerHTML = "";
    posts.forEach(post => {
        var postEle = parseHTML(`<div class="post">
        <div class="post-header">
            <div class="left">
                <p class="poster">${post.posterName}</p>
                <p class="post-time">${Util.formatDateTime(post.timePost)}</p>
            </div>
            <div class="right">
                <i class="fas fa-map-marker-alt"></i>
                <div class="post-position">${post.unitDetail}</div>
            </div>
            
        </div>
        <div class="post-body">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-content">${post.notificationContent}</p>
        </div>
    </div>`);

        var postFooter = parseHTML(`<div class="post-footer">
        <button class="button button-primary" id="btnUpdatePost">Chỉnh sửa</button>
        <button class="button button-secondary" id="btnDeletePost">Xóa</button>
        <button class="button button-primary" id="btnApprovePost">Duyệt</button>
        <button class="button button-secondary" id="btnRefusePost">Từ chối</button>
        </div>`);
        postFooter.setAttribute('myPost', JSON.stringify(post));
        postEle.append(postFooter);
        postList.append(postEle);
    });
    hideLoader();
}
//---------------------------------------------------------------------------------------------------------------------
//------------------dropdown-------------------------------------------------------------------------------------------
var dropdownmains = document.querySelectorAll('.dropdown-main');
if (dropdownmains) {

    dropdownmains.forEach(dropdownmain => {
        dropdownmain.addEventListener('click', () => {
            dropdownmain.parentElement.querySelector('.dropdown-data').classList.add('dropdown-data-show');
        });

        dropdownmain.addEventListener('blur', () => {
            setTimeout(() => {
                dropdownmain.parentElement.querySelector('.dropdown-data').classList.remove('dropdown-data-show');
            }, 500);
        })
    })
}



var dropdownItems = document.querySelectorAll('.dropdown-item');

if (dropdownItems) {
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            var dropdown = item.parentElement.parentElement;
            dropdown.querySelectorAll('.dropdown-item').forEach(ele => {
                ele.classList.remove('item-selected');
            })
            item.classList.add('item-selected');

            let valueName = item.getAttribute('valuename');

            dropdown.querySelector('.dropdown-main p').innerHTML = '';
            dropdown.querySelector('.dropdown-main p').innerHTML = valueName;
        })
    });
}
//---------------------------------------------------------------------------------------------------------------------
//--------------checkbox-----------------------------------------------------------------------------------------------

initEventCheckbox();


function initEventCheckbox() {
    var checkboxs = document.querySelectorAll('.checkbox');
    if (checkboxs) {
        checkboxs.forEach(item => {
            item.addEventListener('click', () => {
                let val = item.getAttribute('value');
                if (val == "1") val = "0"
                else val = "1"
                item.setAttribute("value", val);
            })
        })
    }

}

//---------------------------------------------------------------------------------------------------------------------
//-----------------PopupDialog-----------------------------------------------------------------------------------------
function showPopupDialog(title, content, buttons) {
    var popupHeader = parseHTML(`<div class="popup-header">
                                    <h2>${title}</h2>
                                </div>`);
    var popupBody = parseHTML(`<div class="popup-body">
                                    <p>${content}</p>
                                </div>`);
    var popupFooter = parseHTML(`<div class="popup-footer"></div>`);
    var btn1 = parseHTML(`<button class="button button-secondary" id="btn1">${buttons[0].text}</button>`);
    var btn2 = parseHTML(`<button class="button button-primary" id="btn2">${buttons[1].text}</button>`);
    var btn3 = parseHTML(`<button class="button button-secondary" id="btn3">${buttons[2].text}</button>`);
    if (!buttons[0].enable) {
        btn1.classList.add('d-none');
    }
    if (!buttons[1].enable) {
        btn2.classList.add('d-none');
    }
    if (!buttons[2].enable) {
        btn3.classList.add('d-none');
    }
    let span1 = parseHTML(`<span></span>`);
    span1.append(btn1);
    let span2 = parseHTML(`<span></span>`);
    span2.append(btn2);
    span2.append(btn3);
    popupFooter.append(span1);
    popupFooter.append(span2);
    var popup = parseHTML(`<div class="popup"></div>`);
    popup.append(popupHeader);
    popup.append(popupBody);
    popup.append(popupFooter);
    document.body.appendChild(popup);
    return [btn1, btn2, btn3];
}

function hidePopupDialog() {
    document.querySelector('.popup').remove();
}
//---------------------------------------------------------------------------------------------------------------------
/**------------------------------------------------------------------
 * Hàm format ngày tháng
 * dạng ngày/tháng/năm
 * @param {any} _date
 * Author: hieunv 
 */
function formatDate(_date) {
    if (_date != null) {
        var date = new Date(_date);
        var day = date.getDate();
        day = (day < 10) ? '0' + day : day;
        var month = date.getMonth() + 1;
        month = (month < 10) ? '0' + month : month;
        var year = date.getFullYear();
        return day + '/' + month + '/' + year;
    }
    else {
        return '';
    }
}
//-----------qr code---------------------------------------------------------------------------------------------------

const cipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);

    return text => text.split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

if (document.querySelector('.btn-showqr')) {
    document.querySelector('.btn-showqr').addEventListener('click', () => {
        var phoneNumber = sessionStorage.getItem('phoneNumber');
        const myCipher = cipher('mySecretSalt')
        var phoneEncrypt = myCipher(phoneNumber);
        console.log(phoneEncrypt);
        var data = `https://hieunv183534.github.io/covidmanagement/page/qrcode/user-info.html?phoneNumber=${phoneEncrypt}`;
        showQrCode(data);
    })
}

function showUnitQr(unitCode) {
    var data = `https://hieunv183534.github.io/covidmanagement/page/qrcode/unit-info.html?unitCode=${unitCode}`;
    showQrCode(data);
}

function showQrCode(data) {
    console.log(data);
    var qr = parseHTML(`<div class="qr">
                            <div class="qr-modal"></div>
                            
                        </div>`);
    var qrContent = parseHTML(`<div class="qr-content">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?data=${data}&size=300x300" alt="">
                                </div>`);
    qr.append(qrContent);
    qr.addEventListener('click', () => {
        qr.remove();
    })
    document.body.appendChild(qr);
}
//-------------------------------------------------------------------------------------------------------------------------------
