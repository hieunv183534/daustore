class tableColumns {
    static Orders = [
        {
            title : "Mã đơn hàng",
            width : "min-width: 200px;",
            style : "text-align: center;",
            field: 'orderId'
        },
        {
            title : "Ngày đặt hàng",
            width : "min-width: 200px;",
            style : "text-align: center;",
            field: 'orderDate'
        },
        {
            title : "Sản phẩm",
            width : "min-width: 600px;",
            field: 'listItem',
            format: 'listitem'
        },
        {
            title : "Người đặt",
            width : "min-width: 200px;",
            style : "text-align: center;",
            field: 'orderer',
            format: 'orderer'
        },
        {
            title : "Trạng thái đơn",
            width : "min-width: 200px;",
            style : "text-align: center;",
            field: 'orderStatus'
        },
        {
            title : "Loại thanh toán",
            width : "min-width: 200px;",
            style : "text-align: center;",
            field: 'paymentMethod'
        },
        {
            title : "Đã thanh toán",
            width : "min-width: 200px;",
            field: 'paymentStatus',
            style : "text-align: center;",
            format: 'boolean'
        }
    ];
}