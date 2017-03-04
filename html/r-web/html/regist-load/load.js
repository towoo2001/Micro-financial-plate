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

    var logindata =
    {
        tel:util.getStorage("username"),//手机号
        pwd:util.getStorage("userpwd"),//密码
        reminfo:true//记住密码
    };

     new Vue({
        el:"#vuebox",
        data:{
            formdata:logindata
        },
        methods:{
            telfilter:function(){//11为手机号过滤器
                if(logindata.tel){
                    logindata.tel = (logindata.tel).replace(/\D/g,'')
                    if(logindata.tel>11){
                        logindata.tel = (logindata.tel).substring(0,11)
                    }
                }
            },
            pwdfilter:function(){
                if(logindata.pwd){
                    if(logindata.pwd.length>18){
                        logindata.pwd = (logindata.pwd).substring(0,18)
                        $.toptip('密码长度不能超过18位!', 'warning');
                    }
                }
            },
            forPwd:function(){//忘记密码跳转
                util.goUrlNo('./forget-pwd.html')
            },
            toRegist:function(){//去注册
                util.goUrlNo('./regist.html')
            },
            toLoad:function(){//登录
                var tel = $.trim(logindata.tel);//手机号
                var pwd = $.trim(logindata.pwd);//密码
                var isrem = this.formdata.reminfo;//是否记住密码
                if(!tel){
                    $.toptip('手机号不能为空!', 'warning');
                    return false;
                }else if(!checkForm.isCellPhone(tel)){
                    $.toptip('手机号格式错误','warning');
                    return false;
                }else if(!pwd){
                    $.toptip('密码不能为空','warning');
                    return false;
                }else if(pwd.length<6){
                    $.toptip('密码长度不能少于6位','warning');
                    return false;
                }else{//填写数据正确提交数据
                    ajaxHelper.post('/api/customers/account/login',
                        {"params":{"mobile":tel,"password":pwd}},
                        function(result){
                            console.log(result);
                        if(result.httpCode == "200"){
                            $.toptip('登录成功','success');
                            if(isrem){//是否记住账号
                                util.saveStorage('username',tel);
                                util.saveStorage('userpwd',pwd);
                                util.saveStorage('isrem',true);
                            }else{
                                util.deleteStorage('username');
                                util.deleteStorage('userpwd');
                                util.deleteStorage('isrem');
                            }



                            //自动缓存用户头像
                            var userimg = new Image();
                            userimg.src = result.data.faceimg||'/images/defaultImg.gif';
                            result.data.faceimg = result.data.faceimg||'/images/defaultImg.gif';
                            console.log(result.data)
                            var userInfo = JSON.stringify(result.data)
                            util.saveStorage("userinfo",userInfo);
                            //history.back();
                            util.goUrl('/index.html');
                        }else{
                            $.toptip(result.msg, 'warning');
                        }
                    })
                }
            },
        }
    });
})