var ordersVue = new Vue({
    el: "#order-list",

    data: {
        // 下单数据
        orders_onOrder: [],
        // 成交数据
        orders_aDeal: []
    },

    init: this.fetchOrders,

    ready: function ready() {
        setInterval(this.fetchOrders, 2000);
    },

    methods: {
        fetchOrders: function fetchOrders() {
            var self = this;
            $.ajax({
                type: "GET",
                url: "/listOrders",
                dataType: "json",
                data: {
                    "start": "0",
                    "size": "20"
                },
                success: function success(resp) {
                    //console.log(resp);
                    // 1、下单队列数据处理。卖出数据：wAsk。买入数据：wBid。
                    var wAsk = new Array();
                    var wBid = new Array();
                    for (var m = 0; m < resp.length; m++) {
                        if (resp[m].side == 'ask') {
                            // 将reseponse中的卖单放入wAsk数组中
                            if (resp[m].number < 10) {
                                wAsk.push();
                            } else {
                                wAsk.push(resp[m]);
                            }
                        } else if (resp[m].side == 'bid') {
                            // 将reseponse中的买单放入wAsk数组中
                            if (resp[m].number < 10) {
                                wBid.push();
                            } else {
                                wBid.push(resp[m]);
                            }
                        }
                    }
                    // 根据价格进行降序排序
                    var askArray = wAsk.sort(self.compareDescRule('price', 'number'));
                    var bidArray = wBid.sort(self.compareDescRule('price', 'number'));
                    self.orders_onOrder = askArray.slice(0, 20).concat(bidArray.
                    slice(0, 20));

                    // 2、成交队列数据处理。成交数组 : orderForm[]
                    var orderForm = new Array();
                    // 卖出数据升序排列
                    var escAskArray = wAsk.sort(self.compareAscRule('price', 'number'));
                    // 计算订单成交过程
                    // 对手单数组 : rival[]
                    var rival = new Array();
                    outer: for (var i = 0; i < bidArray.length; i++) {
                        for (var j = 0; j < escAskArray.length; j++) {
                            //console.log(bidArray[0]);
                            if (escAskArray[j].quantity == 0) continue;
                            if (bidArray[i].quantity == 0) continue outer;
                            if (bidArray[i].price >= escAskArray[j].price) {
                                // 计算订单成交价格
                                var cPrice = (bidArray[i].price + escAskArray[j].price) / 2;
                                if (bidArray[i].quantity >= escAskArray[j].quantity) {
                                    // 对手方临时数组
                                    var rivalTem1 = {
                                        bid: bidArray[j],
                                        count: bidArray[i].quantity,
                                        cjPrice: cPrice
                                    };
                                    rival.push(rivalTem1);
                                    bidArray[i].quantity = bidArray[i].quantity - escAskArray[j].quantity;
                                } else {
                                    var rivalTem2 = {
                                        bid: bidArray[j],
                                        count: escAskArray[j].quantity,
                                        cjPrice: cPrice
                                    };
                                    rival.push(rivalTem2);
                                    escAskArray[j].quantity = escAskArray[j].quantity - bidArray[i].quantity;
                                }
                            }

                            // 成交队列中应该放的数据 : aDeal (订单/对手方)
                            var aDeal = {
                                ask: escAskArray[j],
                                ds: rival[j]
                            };
                            //console.log(aDeal.ds.count);
                            // 将所有计算好的数据放入成交队列(orderForm)中
                            orderForm.push(aDeal);
                        }
                    }
                    self.orders_aDeal = orderForm;
                    // 只显示最新的30条数据
                    if (orderForm.length > 30) {
                        self.orders_aDeal = orderForm.slice(0, 29);
                        //clearInterval(self.fetchOrders);
                    }
                },
                error: function error(jqXHR, exception) {
                    console.log("Failed to get chain height!");
                    self.orders = [];
                }
            });
        },
        // 降序
        descCompare: function descCompare(data1) {

            return function (a, b) {
                if (a == null) {
                    return null;
                }
                if (b == null) {
                    return null;
                }
                var value1 = a[data1];
                var value2 = b[data1];
                return value2 - value1;
            };
        },
        // 升序
        aseCompare: function aseCompare(data2) {
            return function (a, b) {
                if (a == null) {
                    return null;
                }
                if (b == null) {
                    return null;
                }
                var value1 = a[data2];
                var value2 = b[data2];
                return value1 - value2;
            };
        },
        // 降序排序规则
        compareDescRule: function compareDescRule(price, number) {
            var that = this;

            var a = function a(_a, b) {
                var value1 = _a[price];
                var value2 = b[price];
                return value1 - value2;
            };
            if (a == 0) {
                return that.aseCompare('number');
            }
            return that.descCompare('price');
        },
        // 升序排序规则
        compareAscRule: function compareAscRule(price, number) {
            var that = this;
            var a = function a(_a2, b) {
                var value1 = _a2[price];
                var value2 = b[price];
                return value1 - value2;
            };
            if (a == 0) {
                return that.aseCompare('number');
            }
            return that.aseCompare('price');
        }
    }
});

(function reset() {
    $.ajax({
        type: "GET",
        url: "/reset"
    });
})();
