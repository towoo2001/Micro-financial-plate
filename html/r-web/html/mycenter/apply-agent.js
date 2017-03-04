$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })


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
            $("input.creatCode").css("background","none");
            $("input.creatCode").css("color","#fff");
            $("input.creatCode").css("border-color","#00a0e9");
            code = ""; //清除验证码。如果不清除，过时间后，输入收到的验证码依然有效
        }
        else {
            curCount--;
            $("input.creatCode").css("background","#ccc");
            $("input.creatCode").css("color","#777");
            $("input.creatCode").css("border-color","#ccc");
            $("input.creatCode").val("重新获取(" + curCount + ")");
        }
    }

    formData={
        vcode:null,//验证码
        userInfo:util.getUserInfo(),
    }

    new Vue({
        el:"#vuebox",
        data:{
            formData:formData,
        },
        methods:{
            createCode:function(){
                curCount = count;
                //设置button效果，开始计时
                $("input.creatCode").attr("disabled", "true");
                InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
                //向后台发送处理数据
                ajaxHelper.post('/api/broker/getvcode',null,function(result){
                    console.log(result);
                    if(result.httpCode == "200"){
                        $.toptip('验证码已发送!', 'success');
                    }else{
                        $.toptip(result.msg, 'warning');
                        return false;
                    }
                })
            },
            sendForm:function(){
                if(!formData.vcode){
                    $.toptip('验证码不能为空','warning')
                    return false;
                }else{
                    ajaxHelper.post('/api/broker/applyBroker',{"params":{"vcode":formData.vcode}},function(result){
                        console.log(result);
                        if(result.httpCode == "200"){

                        }else{
                            $.toptip(result.msg, 'warning');
                            return false;
                        }
                    })
                }
            }
        },
        created:function(){
            var that = this;
            setTimeout(
                function(){

                    touchFeed()

                }
                ,100)
        }
    });


})