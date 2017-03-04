$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    FastClick.attach(document.body);

    var rechargedata =
    {
        money:null,//充值金额
    };
    //充值成功弹出框
    var rechargeLayer = {
        state:false
    }
    new Vue({
        el:"#vuebox",
        data:{
            rechargedata:rechargedata,
            rechargeLayer:rechargeLayer
        },
        methods:{
            toDo:function(){//登录
                var money = $.trim(rechargedata.money);
                var payType = '1';
                if(!money){
                    $.toptip('充值金额不能为空','warning');
                    return false;
                }else{//填写数据正确提交数据
                    ajaxHelper.post('/api/deposits/userDep',
                        {
                        "amount":money, "payType":payType, "remark":"null"
                    },
                        function(result){
                            if(result.httpCode == "200"){
                                if(result.data.code == "000"){
                                    if(payType == '1'){
                                        //银联支付,弹出页面
                                        sessionStorage.setItem('html',result.data.msg);
                                        location = '/html/mycenter/chongzhi.html';
                                        document.querySelector("#newpage").onclick = loaclNewpage;
                                    }else{
                                        $.toptip('充值成功','success');
                                        $("#screenlayer").show();
                                        rechargeLayer.state = true;
                                        rechargedata.money="";
                                    }
                                }else{
                                    $.toptip(result.data.msg, 'warning');
                                }
                            }else if(result.httpCode == "401"){
                                $('#loadtiplayer').fadeIn(100);
                                $('.userNotLoad').fadeIn(100);
                            }else{
                                $.toptip(result.msg, 'warning');
                            }
                        })
                }
            },
            botNavLocation:function(url){
                util.goUrl(url)
            },
            continueRecharge:function(){
                $("#screenlayer").hide()
                rechargeLayer.state = false;
            },
            winBack:function(){
                window.history.back()
            }
        },
        created:function(){
            var that = this;
            setTimeout(function(){
                $("#screenlayer").click(function(){
                    $("#screenlayer").hide()
                    rechargeLayer.state = false;
                })
                //按钮效果交互
                touchFeed();
            },100)
        }
    });
})