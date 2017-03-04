$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    var id = util.getQueryString("id");

       var data = {
           position:null
       };

    ajaxHelper.post('/api/trades/position/get',{"params":{"id":id}},function(result){
        if(result.httpCode == "200"){
            result.data.openTime = util.formatTime(result.data.openTime)
            data.position = result.data;
        }else if(result.httpCode == "401"){
            //跳转到登录界面
        }else{
            $.toptip(result.msg, 'warning');
        }
    },true);


    var proId = null;
    new Vue({
        el:"#vuebox",
        data:{
            pos:data
        },
        methods:{
            toPC:function(index){
                $("#screenlayer").show()
                confirmState.state = true;
                proId = index;
            },
            //增加盈利跑出数
            addProfit:function(){
                if(data.position.limitProfit==100){
                    return
                }
                data.position.limitProfit+=10;
            },
            //减少盈利抛出数
            reduProfit:function(){
                if(data.position.limitProfit<10||data.position.limitProfit==10){
                    return
                }
                data.position.limitProfit-=10;
            },
            //增加亏损抛出数
            addLoss:function(){
                if(data.position.stop==100){
                    return
                }
                data.position.stop+=10
            },
            //减少亏损抛出数
            reduLoss:function(){
                if(data.position.stop<10||data.position.stop==10){
                    return
                }
                data.position.stop-=10
            },
        },
        created:function() {
            var that = this;

        }
    });
})