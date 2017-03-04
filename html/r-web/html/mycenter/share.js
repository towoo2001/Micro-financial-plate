

$(function(){

    //生成二维码参数
    jQuery('#ewm').qrcode({
        text: getUrl()
    });

    function getUrl(){
        var userInfo = util.getUserInfo();
        var mobile = userInfo.mobile;
        var orgagency = userInfo.agentId;
        var url = 'http://wap.interxq.com?mobile='+mobile+'&orgagency='+orgagency;
        return url;
    }

    isWe={
        isWe:false//判断是否为微信浏览器
    }

    var ua = window.navigator.userAgent.toLowerCase();//微信
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){//微信
        isWe.isWe = true;//如果为微信浏览器设置为true
    }

    var shareconfig = {};
    var share_obj =  null;
    function buildShare(){
        shareconfig = {//分享参数
            url:getUrl(),
            title:'native分享测试标题',
            desc:'native分享测试描述',
            img:'http://t10.baidu.com/it/u=3334453527,4077871420&fm=76',
            img_title:'图片标题',
            from:'我的微盘分享'
        };
        share_obj = new nativeShare('nativeShare',shareconfig);
    }

    var shareconstate = {
        state:false
    }
    var sharedata = [];

    var shareUrl = {
        url:getUrl()
    }

    new Vue({
        el:"#vuebox",
        data:{
            sharedata:sharedata,
            shareconstate:shareconstate,
            isHide: false,
            isWe:isWe,
            shareUrl:shareUrl
        },
        methods:{
            showLayer:function(){//显示遮罩层
                $("#screenlayer").show()
            },
            hideLayer:function(){//隐藏遮罩层
                $("#screenlayer").hide();
            },
            share:function(){//显示或隐藏发分享框
                shareconstate.state = !shareconstate.state;
                if(shareconstate.state){
                    this.showLayer();
                }else{
                    this.hideLayer();
                }
            },
        },
        created:function(){//vue创建钩子
            var that = this;
            setTimeout(function(){
                $("#screenlayer").click(function(){
                    $("#screenlayer").hide();
                    shareconstate.state = false;
                })
                buildShare()
            },100)
        }
    })
})