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
            $("input.creatCode").css("background","none");
            code = ""; //清除验证码。如果不清除，过时间后，输入收到的验证码依然有效
        }
        else {
            curCount--;
            $("input.creatCode").css("background","#639ec5");
            $("input.creatCode").val("重新获取(" + curCount + ")");
        }
    }



    var regdata =
    {
        tel:null,//手机号
        name:null,//姓名
        pwd:null,//交易密码
        meccode:null,//机构代码
        vercode:null,//验证码
    };

    new Vue({
        el:"#vuebox",
        data:{
            regdata:regdata,
        },
        methods:{
            telfilter:function(){//11为手机号过滤器
                if(regdata.tel){
                    regdata.tel = (regdata.tel).replace(/\D/g,'')
                    if(regdata.tel>11){
                        regdata.tel = (regdata.tel).substring(0,11)
                    }
                }
            },
            pwdfilter:function(){//密码长度限制
                if(regdata.pwd){
                    if(regdata.pwd.length>18){
                        regdata.pwd = (regdata.pwd).substring(0,18)
                        $.toptip('密码长度不能超过18位!', 'warning');
                    }
                }
            },
            createCode:function(){
                curCount = count;
                var phone=regdata.tel;//手机号码
                if(checkForm.isCellPhone(phone)){
                    //产生验证码
                    for (var i = 0; i < codeLength; i++) {
                        code += parseInt(Math.random() * 9).toString();
                    }
                    console.log(code);
                    //设置button效果，开始计时
                    $("input.creatCode").attr("disabled", "true");
                    InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
                    //向后台发送处理数据
                    ajaxHelper.post('###',{tel:phone,code:code},function(result){
                        console.log(result)
                        //在此判断如果手机号已被注册设置code为空
                        $.toptip('验证码已发送!', 'warning');
                    })
                }else if(!phone){
                    $.toptip('手机号不能为空!', 'warning');
                    return false;
                }else{
                    $.toptip('手机号码格式错位!', 'warning');
                    return false;
                }
            },
            checkTel:function(){//验证手机号
                var tel = $.trim(regdata.tel);
                if(!tel){
                    $.toptip('手机号不能为空!', 'warning');
                    return false;
                }else if(!checkForm.isCellPhone(tel)){
                    $.toptip('手机号格式错误!', 'warning');
                    return false;
                }
                return true;
            },
            checkNmae:function(){//验证姓名
                var name = $.trim(regdata.name);
                if(!name){
                    $.toptip('姓名不能为空!', 'warning');
                    return false;
                }else if(name.length<2||name.length>20){
                    $.toptip('请输入正确姓名!', 'warning');
                    return false;
                }
                return true;
            },
            checkPwd:function(){//验证交易密码
                var pwd = $.trim(regdata.pwd);
                if(!pwd){
                    $.toptip('交易密码不能为空!', 'warning');
                    return false;
                }else if(pwd.length<6){
                    $.toptip('交易密码长度不能少于6位!', 'warning');
                    return false;
                }
                return true;
            },
            checkMeccode:function(){//验证机构代码
                var meccode = $.trim(regdata.meccode);
                if(!meccode){
                    $.toptip('机构代码不能为空!', 'warning');
                    return false;
                }
                return true;
            },
            checkVercode:function(){//验证验证码
                var vercode = regdata.vercode;
                if(!vercode){
                    $.toptip('验证码不能为空!', 'warning');
                    return false;
                }else if(vercode!=code){
                    $.toptip('验证码错误或已过期!', 'warning');
                    return false;
                }
                return true;
            },
            agreen:function(){//用户协议
                util.goUrl('###')
            },
            toRegist:function(){//去注册
                if(!this.checkTel())return;
                if(!this.checkNmae())return;
                if(!this.checkPwd())return;
                if(!this.checkMeccode())return;
                if(!this.checkVercode())return;


                ajaxHelper.post('###',regdata,function(result){
                    console.log(data);
                    util.goUrl('./load.html');
                })

            },

        }
    });

})