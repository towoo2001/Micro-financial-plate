/**
 * Created by Administrator on 2016/11/16.
 */
$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    var money={
        yue:null
    }

    ajaxHelper.post("/api/customers/account/get","",function (result) {
        console.log(result)
        if(result.httpCode == "200"){
            money.yue = util.formatMoney(result.data.balance);
        }else{
            money.yue=util.formatMoney('0')
        }
    })


    notloginguserinfo = {
        "id":"000000000",
        "enable":true,
        "remark":':-)',
        "createBy":"000000000",
        "createTime":000000000,
        "updateBy":"000000000",
        "updateTime":000000000,
        "mobile":"000000000",
        "password":null,
        "registTime":000000000,
        "memberName":"000000000",
        "agentId":':-)',
        "faceimg":null,
        "sex":1,
        "mtype":1,
        "nickname":':-)',
        "birthday":':-)'
    }
    userInfo = util.getUserInfo()||notloginguserinfo;
    new Vue({
        el:"#vuebox",
        data:{
            userInfo : userInfo,
            money:money
        },
        methods:{
            //底部导航跳转
            botNavLocation:function(url){
                util.goUrl(url)
            },
        },
        created:function(){
            var that = this;
            setTimeout(function(){

                //按钮反馈
                touchFeed();
            },100)
        }
    });

})