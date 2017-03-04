/**
 * Created by Administrator on 2016/11/19.
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

    FastClick.attach(document.body);



    var regdata =
    {

        pwd:null,//密码
        newpwd:null,//新密码
        newpwd2:null//重复密码
    };

    new Vue({
        el:"#vuebox",
        data:{
            regdata:regdata,
        },
        methods:{
            pwdfilter:function(){
                if(regdata.pwd){
                    if(regdata.pwd.length>18 || regdata.pwd.length<6){
                        $.toptip('密码长度为6-18位!', 'warning');
                        return false;
                    }

                }else {
                    $.toptip('密码不能为空!', 'warning');
                    return false;
                }
                return true;
            },
            newpwdfilter:function(){
                if(!regdata.newpwd){
                    $.toptip('新密码不能为空!', 'warning');
                    return false;
                }
                if(regdata.newpwd.length>18 || regdata.newpwd.length<6){
                    $.toptip('新密码长度为6-18位!', 'warning');
                    return false;
                }
                return true;
            },
            checkPwdToo:function(){//再次验证吗密码以及是否有相同
                if(!regdata.newpwd2){
                    $.toptip('确认密码不能为空!', 'warning');
                    return false;
                }
               if($.trim(regdata.newpwd)!= $.trim(regdata.newpwd2)){
                    $.toptip('两次密码不一样!', 'warning');
                    return false;
                }
                return true;
            },
            toLoad:function(){
                if(!this.pwdfilter())return;
                if(!this.newpwdfilter())return;
                if(!this.checkPwdToo())return;
                ajaxHelper.post('/api/customers/password/update',
                    {"params":{"pwd":regdata.pwd,"newPwd":regdata.newpwd,"newPwd2":regdata.newpwd2}},
                    function(result){
                        if(result.httpCode == "200"){
                            $.toptip('修改密码成功','success');
                            setTimeout(function(){window.history.back();},1000)
                        }else{
                            $.toptip(result.msg, 'warning');
                        }
                    })
            },

        },
        created:function(){
            var taht = this;
            setTimeout(function(){
                //按钮反馈
                touchFeed()
            },100)
        }
    });

})