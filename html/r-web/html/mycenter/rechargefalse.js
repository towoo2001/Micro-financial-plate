$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize();
    $(window).resize(function(){
        autoSize()
    });

    FastClick.attach(document.body);
    updateOrderStatus();
    var order ={
        orderInfo:null
    }

    function updateOrderStatus(){
        var orderId = util.getQueryString('orderId');
        ajaxHelper.post('/api/deposits/userDepCallBack',
            {
                "orderId":orderId, "result":2
            },
            function(result){
                if(result.httpCode == "200"){
                    order.orderInfo = result.data;
                    order.orderInfo.tranTime = util.formatTime(result.data.tranTime);
                }else if(result.httpCode == "401"){
                    $('#loadtiplayer').fadeIn(100);
                    $('.userNotLoad').fadeIn(100);
                }else{
                    $.toptip(result.msg, 'warning');
                }
            })
    }


    new Vue({
        el:"#vuebox",
        data:{
            orderInfo:order
        },
        methods:{
        },
        created:function(){
            var that = this;
            setTimeout(function(){
                $("#screenlayer").click(function(){
                    $("#screenlayer").hide()
                    rechargeLayer.state = false;
                })
                touchFeed();
            },100)
        }
    });
})