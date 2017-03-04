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


    var InterValObj; //timer变量，控制时间
    var count = 60; //间隔函数，1秒执行
    var curCount;//当前剩余秒数
    var code = ""; //验证码
    var codeLength = 6;//验证码长度

    //timer处理函数
    function SetRemainTime() {
        if (curCount == 0) {
            window.clearInterval(InterValObj);//停止计时器
            $("input.creatCode").removeAttr("disabled");//启用按钮
            $("input.creatCode").val("重新获取");
            $("input.creatCode").css("background","#00a0e9");
            code = ""; //清除验证码。如果不清除，过时间后，输入收到的验证码依然有效
        }
        else {
            curCount--;
            $("input.creatCode").css("background","#639ec5");
            $("input.creatCode").val("重新获取(" + curCount + ")");
        }
    }

    var notloginguserinfo = {
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
        "nickname":':-)',
        "birthday":':-)'
    }
   var userInfo = util.getUserInfo()||notloginguserinfo

    var money={
        yue:null
    }

    ajaxHelper.post("/api/customers/account/get","",function (result) {
        if(result.httpCode == "200"){
            money.yue =result.data.balance;
        }else{
            money.yue="0"
        }
    })

    var cashdata =
    {
        money :null,
        bankname :null,
        username :null,
        account :null,
        pwd :null,
        code :null,
    };


    ajaxHelper.post("/api/customers/bankcard/getlist","",function (result) {
        if(result.httpCode == "200"){
            var bank=result.data;
            cashdata.bankname=bank.bankName;
            cashdata.username=bank.name;
            cashdata.account=bank.cardNo;
        }else{
            $.toptip(result.msg, 'warning');
        }
    })

    new Vue({
        el:"#vuebox",
        data:{
            cashdata:cashdata,
            money:money,
            userInfo:userInfo,
        },
        methods:{
            toDo:function(){
                var money = $.trim(cashdata.money);
                var bankname = $.trim(cashdata.bankname);
                var username = $.trim(cashdata.username);
                var account = $.trim(cashdata.account);
                var pwd = $.trim(cashdata.pwd);
                var code = $.trim(cashdata.code);
                if(!money){
                    $.toptip('提现金额不能为空','warning');
                    return false;
                }else if(!bankname){
                    $.toptip('银行不能为空','warning');
                    return false;
                }else if(!username){
                    $.toptip('姓名不能为空','warning');
                    return false;
                }else if(!account){
                    $.toptip('银行账号不能为空','warning');
                    return false;
                }else if(!pwd){
                    $.toptip('交易密码不能为空','warning');
                    return false;
                }else if(!code){
                    $.toptip('交易验证码不能为空','warning');
                    return false;
                }else{//填写数据正确提交数据
                    ajaxHelper.post('/api/withdraws/bankcard/cash',
                        {"params":{"money":money,"bankName":bankname,"name":username,"cardNo":account,"pwd":pwd,"vcode":code}},
                        function(result){
                            if(result.httpCode == "200"){
                                if(result.data.code == "000"){
                                    $.toptip('提现成功','success');
                                    window.location.reload();
                                }else{
                                    $.toptip(result.data.msg, 'warning');
                                }
                            }else if(result.httpCode=='401'){
                                $('#loadtiplayer').fadeIn(100);
                                $('.userNotLoad').fadeIn(100);
                            }else{
                                $.toptip(result.msg, 'warning');
                            }
                        })
                }
            },
            getVcode:function(){
                curCount = count;


                //向后台发送处理数据
                ajaxHelper.post('/api/withdraws/vcode/getvcode',{"params":{}},function(result){
                    console.log(result);
                    if(result.httpCode == "200"){
                        //在此判断如果手机号已被注册设置code为空
                        $.toptip('验证码已发送!', 'success');
                        //设置button效果，开始计时
                        $("input.creatCode").attr("disabled", "true");
                        InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                })

            },
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