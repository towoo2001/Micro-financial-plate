$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    var userdata =
    {
        nickname :null,
        memberName :null,
        sex :1,
        birthday :null
    };


    ajaxHelper.post("/api/customers/account/get","",function (result) {
        if(result.httpCode == "200"){
            var user=result.data;
            console.log(user)
            userdata.nickname =user.nickname;
            userdata.faceimg =user.faceimg;
            userdata.sex =user.sex;
            userdata.birthday =util.formatDate(user.birthday);
        }else{
            $.toptip(result.msg, 'warning');
        }
    })

    new Vue({
        el:"#vuebox",
        data:{
            userdata:userdata,
        },
        methods:{

            //触发上传头像
            fireIptFile:function(){
                $("#mypic").trigger('click');
            },

            toDo:function(){
                var nickname = $.trim(userdata.nickname);
                var sex = $.trim(userdata.sex);
                var birthday = $.trim(userdata.birthday);
                if(!nickname){
                    $.toptip('昵称不能为空','warning');
                    return false;
                }else if(!sex){
                    $.toptip('性别不能为空','warning');
                    return false;
                }else if(!birthday){
                    $.toptip('生日不能为空','warning');
                    return false;
                }else{//填写数据正确提交数据
                    ajaxHelper.post('/api/customers/account/update',
                        {"params":{"nickname":nickname,"sex":sex,"birthday":birthday}},
                        function(result){
                            if(result.httpCode == "200"){
                                $.toptip('修改资料成功','success');
                                window.history.back();
                            }else{
                                $.toptip(result.msg, 'warning');
                            }
                        })
                }
            },
            exit:function () {
                ajaxHelper.post('/api/customers/account/logout',"",
                    function(result){
                        if(result.httpCode == "200"){
                            //删除
                            util.deleteStorage("userinfo");
                            util.deleteStorage("username");
                            util.deleteStorage("userpwd");
                            //去首页
                            window.location.href = "../regist-load/load.html";
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
            setTimeout(
                function(){
                    //反馈按钮
                    touchFeed();
                    /*压缩并上传*/
                    var mypic=null//设置头像变量储存用户头像
                    $('#mypic').localResizeIMG({
                        width: 640,
                        quality: 1,
                        success: function (result) {
                            $.showLoading();
                            mypic = result.clearBase64;
                            var data = {
                                mypic:mypic,//图片上传后是base64字符串，需要后台decode base64
                                //userInfo:util.getUserInfo(),
                            }
                            $(".myInfoPicImg").attr("src",result.base64);
                            console.log(mypic)
                            $.ajax({
                                url:'###',
                                type:"POST",
                                data:data,
                                success:function(data){
                                    $.toptip('上传成功', 'success');
                                    $.hideLoading();
                                },
                                error:function(e){
                                    $.toptip('网络错误', 'error');
                                    console.log(e);
                                    $.hideLoading();
                                }
                            })
                        }
                    });
                }
                ,100)
        }
    });
})