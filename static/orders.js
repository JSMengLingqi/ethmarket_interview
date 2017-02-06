
var ordersVue = new Vue({
  el: "#order-list",

  data: {
      orders: [],
      orders_onOrder: [],
      orders_aDeal: []
  },

  init: this.fetchOrders,

  ready: function() {
    setInterval(this.fetchOrders, 2000);
  },

  methods: {
      fetchOrders: function () {
          var self = this;
          $.ajax({
              type: "GET",
              url: "/listOrders",
              dataType: "json",
              data: {
                  "start": "0",
                  "size": "100"
              },
              success: function (resp) {
                  console.log(resp);
                  self.orders = resp;
                  //  下单队列
                  var wAsk = new Array();
                  var wBid = new Array();
                  for(var m = 0 ; m < resp.length; m++){
                      if(resp[m].side == 'ask'){
                          wAsk.push(resp[m]);
                      } else if(resp[m].side == 'bid'){
                          wBid.push(resp[m]);
                      }
                  }
                  var askArray = wAsk.sort(self.compare('price'));
                  var bidArray = wBid.sort(self.compare('price'));
                  wBid.sort(self.compare('price'));
                  self.orders_onOrder = askArray.slice(0,20).concat(bidArray.slice(0,20));

                  // 成交队列
                  self.orders_ask = resp;
              },
              error: function (jqXHR, exception) {
                  console.log("Failed to get chain height!");
                  self.orders = [];
              }
          });
      },
      compare: function(data){
          return function(a,b){
            var value1 = a[data];
            var value2 = b[data];
            return value2 - value1;
          }
      }
  }
});

(function reset() {
  $.ajax({
	type: "GET",
	url: "/reset"
  })
})();
