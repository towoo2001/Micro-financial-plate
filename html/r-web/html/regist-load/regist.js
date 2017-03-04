$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    });

    //将url参数保存到本地
    setParams();
    function setParams(){
        var leh = params.length;
        for(var i=0;i<leh;i++){
            if(util.getQueryString(params[i],util) != null){
                util.saveStorage(params[i],util.getQueryString(params[i],util));
            }
        }
    }

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

    var orgagency = util.getQueryString("orgagency");
    if(orgagency == null){
        orgagency = '6220128697861537793';
    }
    var regdata =
    {
        tel:null,//手机号
        vercode:null,//验证码
        pwd:null,//密码
        orgagency:orgagency//机构代理
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
                    //设置button效果，开始计时
                    $("input.creatCode").attr("disabled", "true");
                    InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
                    //向后台发送处理数据
                    ajaxHelper.post('/api/customers/regist/getvcode',{"params":{"mobile":phone}},function(result){
                        console.log(result);
                        if(result.httpCode == "200"){
                            //在此判断如果手机号已被注册设置code为空
                            $.toptip('验证码已发送!', 'success');
                        }else{
                            $.toptip(result.msg, 'warning');
                        }
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
            checkVercode:function(){
                var vercode = regdata.vercode;
                if(!vercode){
                    $.toptip('验证码不能为空!', 'warning');
                    return false;
                }
                return true;
            },
            checkPwd:function(){//验证密码
                var pwd = $.trim(regdata.pwd);
                if(!pwd){
                    $.toptip('密码不能为空!', 'warning');
                    return false;
                }else if(pwd.length<6){
                    $.toptip('密码长度不能少于6位!', 'warning');
                    return false;
                }
                return true;
            },
            checkOrgagency:function(){//验证机构代理
                var orgcy = $.trim(regdata.orgagency);
                if(!orgcy){
                    $.toptip('机构代理不能为空!', 'warning');
                    return false;
                }
                return true;
            },
            agreen:function(){//用户协议
                util.goUrl('###')
            },
            toRegist:function(){//去注册
                if(!this.checkTel())return;
                if(!this.checkVercode())return;
                if(!this.checkPwd())return;
                if(!this.checkOrgagency())return;
                ajaxHelper.post('/api/customers/regist/add',{"params":{"mobile":regdata.tel,"password":regdata.pwd,"vcode":regdata.vercode,"agentId":regdata.orgagency}},function(result){
                    if(result.httpCode == "200"){
                        $.toptip('注册成功','success');
                        util.goUrl('./load.html');
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                })
            },

        }
    });

})