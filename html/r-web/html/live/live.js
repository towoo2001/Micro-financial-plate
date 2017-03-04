var chatCon;
var onlyseemy = {
    state:false
}
$(function(){
    //获取商品类型
    ajaxHelper.post('/api/infos/goods/getGoodsTypelist',null,function(result){
        if(result.httpCode == "200"){
            console.log(result.data);
            prolist.goods = result.data;
            for(var i=0;i<result.data.length;i++){
                pro_data.push(result.data[i]);
            }         

            jc_data.selPro=result.data[0].name;//选中商品名
            jc_data.selProPri=result.data[0].point;//选中商品价格
            jc_data.selPriList=result.data[0].list;//选中商品规格列表
            jc_data.selPri=result.data[0].list[0];//选中规格


        }else if(result.httpCode == "401"){
            //跳转到登录界面
        }else{
            $.toptip(result.msg, 'warning');
        }
    });
    var defaultwheight = parseInt($(window).height());//原始窗口高度;
    var listInfoH = defaultwheight-240;
    $(".listInfo").css('height',listInfoH+'px');
    $(".infoConWrap").css('height',listInfoH+'px');
    //$(".liveJC").css('height',listInfoH+'px');
    $(".liveJC").css('height','auto');
    $(".livePC").css('height',listInfoH+'px');
    var showLayerState={//屏幕滚动聊天状态
        state:true,//初始隐藏
    };
    var LiveCon = [//直播内容
        {
            time: '今天 16：11：28',
            name:'赵天',
            sex:'男',
            descr:'国际金融讲师，专注金融行业50年，是国内外知名讲师，曾为美联储首席执行官'
        }
    ];

    //建仓平仓内容显示控制
    var jpc_state={
        jcstate:false,//建仓状态默认隐藏
        pcstate:false//平仓状态默认隐藏
    }

    chatCon = [//聊天内容

    ];

    //聊天表情包
    var iconList = chaticon;


    //平仓数据
    var prolist={
        pro:[],
        goods:null,
        profit:null
    };
    //产品列表
    var pro_data=[
    ];

    //得到平仓列表数据
    var loading = false;
    var pagenum = 1;
    function getPCList(){
        ajaxHelper.post('/api/trades/position/getlist',{"params":{"pageNum":pagenum}},function(result){
            loading = true;
            if(result.httpCode == "200"){
                console.log(result.data)
                for(var i = 0;i<result.data.length;i++){
                    (prolist.pro).push(result.data[i])
                }
                //prolist.pro = result.data;
                console.log(prolist)
            }else if(result.httpCode == "401"){
                //跳转到登录界面
            }else{
                $.toptip(result.msg, 'warning');
            }
            getListProfit();
        });

        ajaxHelper.post('/api/trades/position/todayProfit',{'params': null},function(result){
            if(result.httpCode == "200"){
                prolist.profit = result.data;
            }else if(result.httpCode == "401"){

            }
        });
    }
    //getPCList();


    var jc_data = {
        buyType:true,///购买类型涨跌，默认买涨;false为买跌
        selPro:null,//选中商品名
        selProPri:null,//选中商品价格
        selPriList:null,//选中商品规格列表
        selPri:{
            depositFee:0,
            openChargeFee:0,
            stopProfitPoint:0,
            stopLossPoint:0
        },//选中规格
        buyHandNum:1,//购买手数
        stopProNum:0,//止盈数
        stopLosNum:0//止亏数

    };

    //平仓数据
    var confirm={
        closeChargeFee:null,
        profit:null,
        balance:null
    };
    //确认平仓弹出框
    var confirmState = {
        state:false
    };
    //全部平仓弹出框
    var allconfirmState = {
        state:false
    };

    //分享弹出框
    var shareState = {
        state:false
    }

    //是否允许最大交易5个点误差默认允许
    var isAgreenFiveFloat = {
        state:true
    }
    //得到每个商品的浮动盈亏
    function getListProfit(){
        var prolists = prolist.pro;
        var idarr=[];
        if(prolists.length > 0){
        for(var i = 0;i<prolists.length;i++){
            idarr.push(prolists[i].id)
        }
        idarr = idarr.join(',')
        ajaxHelper.post('/api/trades/position/getGrossProfitList',{"params":{"ids":idarr}},function(result){
            if(result.httpCode == "200"){
                var profit = result.data;
                for(var i = 0;i<prolist.pro.length;i++){
                    for(var j =0 ;j<profit.length;j++){
                        if(profit[i].id==prolist.pro[i].id){
                            prolist.pro[i].grossProfit = profit[i].grossProfit;
                        }
                    }
                }
                console.log(prolist.pro)
                console.log(profit)
                console.log(333)
            }else if(result.httpCode == "401"){
                //跳转到登录界面
            }else{
                $.toptip(result.msg, 'warning');
            }
        });
        }
    }
//重新加载平仓的页面数据
    function reloadPageData(){
        pagenum = 1;
        prolist.pro.splice(0,prolist.pro.length);
        getPCList();
     //   todayProfit();
    }

    //平仓列表上拉加载更多
    function pullUpLoadMore(){
        if(!loading){
            $('.livePC').scroll(function(){
                var winTop = $('.livePC').scrollTop();//窗口到顶部的向上偏移量
                var redH = $('.PCPro').height()+$('.allPingChang').height()+$('.pingChangList').height()+20 - $('.livePC').height();//
                var isToBot = winTop-redH>10?true:false;//判断是否到达底部
                if(isToBot){//已经到达底部
                    pagenum++;
                    getPCList()
                    getListProfit()
                    log(999)
                }
            })
        }
    }

    new Vue({
        el: '#vueBox',
        data: {
            jc_data:jc_data,//建仓数据
            pro_data:pro_data,//产品数据
            LiveCon: LiveCon,//直播内容
            chatCon: chatCon,//聊天内容
            isShowLive:true,//初始显示
            isShowChat:false,//初始隐藏聊天内容
            isShowPicIcon:false,//初始隐藏表情框
            iconList:iconList,//表情符列表
            formCon:'',//绑定输入框聊天内容
            showLayerState:showLayerState,//屏幕聊天状态
            onlySeeMe:onlyseemy,//只看自己
            jpc_state:jpc_state,//建平仓显示隐藏控制
            seledProIndex:0,//选中商品索引默认0
            seledForIndex:0,//选中规格索引默认0
            prolist:prolist,
            confirm:confirm,
            confirmState:confirmState,
            allconfirmState:allconfirmState,
            shareState:shareState,
            isAgreenFiveFloat:isAgreenFiveFloat,
            kk:2
        },

        filters: {

        },

        methods:{
            /*表情操作*/
            openPicIcon:function(){//打开表情框
                $("#chatform").css('bottom','150px')
                this.isShowPicIcon=true;
            },
            closePicIcon:function(){//关闭表情框
                $("#chatform").css('bottom','0px')
                this.isShowPicIcon=false;
                //$('.chatCon').focus();
            },
            backKeyInput:function(){//报情报返回按钮
                $("#chatform").css('bottom','0px')
                this.isShowPicIcon=false;
                $('.chatCon').focus();
            },
            addImgIcon:function(icon){//添加表情2016/12/5
                var _chatcon = document.getElementById("chattextarea");
                var _chatconlen = _chatcon.value.length;
                _chatcon.value = _chatcon.value.substr(0,_chatcon.selectionStart)+icon+_chatcon.value.substring(_chatcon.selectionStart,_chatconlen);
                this.formCon = _chatcon.value;
                //$('#chattextarea').focus();
                //this.formCon+=icon;
            },
            showLive:function(){//显示直播
                this.isShowLive=true;
                this.isShowChat=false;
                $(".botHasNewmsg").hide()
                setTimeout(this.liveConToBot,100);
                this.closePicIcon();
            },
            showChat:function(){//显示聊天
                this.isShowLive=false;
                this.isShowChat=true;
                if(onlyseemy.state){//只看我自己回答是否选中判断聊天信息是否到底部
                    return
                }else{
                    setTimeout(this.chatConToBot,100);
                }
            },

            showJC:function(){//显示建仓
                this.closePicIcon();
                ajaxHelper.post("/api/customers/account/get","",function (result) {
                    if(result.httpCode=='401'){
                        $('#loadtiplayer').fadeIn(100);
                        $('.userNotLoad').fadeIn(100);
                        return false;
                    }else{
                        $('#screenlayer').show();
                        $('.videoWrap').hide()
                        //$('.liveJC').show();
                        jpc_state.jcstate = true;
                        jpc_state.pcstate = false;
                    }
                })

            },

            showPC:function(){//显示平仓
                this.closePicIcon();
                ajaxHelper.post("/api/customers/account/get","",function (result) {
                    if(result.httpCode=='401'){
                        $('#loadtiplayer').fadeIn(100);
                        $('.userNotLoad').fadeIn(100);
                        return false;
                    }else{
                        $('#screenlayer').show();
                        $('.videoWrap').hide();
                        jpc_state.jcstate = false;
                        jpc_state.pcstate = true;
                        getPCList();
                    }
                })
            },

            hideJPC:function(){//隐藏建仓平仓
                $('#screenlayer').hide();
                $('.videoWrap').show()
                jpc_state.jcstate = false;
                jpc_state.pcstate = false;
            },
            toPC:function(index){
                ajaxHelper.post('/api/trades/position/closePositionConfirm',{"params":{"id":index}},function(result){
                    if(result.httpCode == "200"){
                        confirm.closeChargeFee = result.data.closeChargeFee;
                        confirm.profit = result.data.profit;
                        confirm.balance = result.data.balance;
                        $("#screenlayer2").show()
                        confirmState.state = true;
                        proId = index;
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });
            },
            toPCAll:function(){
                ajaxHelper.post('/api/trades/position/oneKeyClosePositionConfirm',{"params":null},function(result){
                    if(result.httpCode == "200"){
                        confirm.closeChargeFee = result.data.closeChargeFee;
                        confirm.profit = result.data.profit;
                        confirm.balance = result.data.balance;
                        $("#screenlayer2").show()
                        allconfirmState.state = true;
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });

            },
            allConfirmPC:function(){
                ajaxHelper.post('/api/trades/position/oneKeyclose',{"params":{"closeType":1}},function(result){
                    console.log(result)
                    console.log(444)
                    if(result.httpCode == "200"){
                            $.toptip('一键平仓成功', 'success');
                            allconfirmState.state = false;
                            shareState.state = true;
                            reloadPageData();
                    }else if(result.httpCode == "401"){
                        allconfirmState.state = false;
                        util.goUrl('/html/regist-load/load.html')
                        //跳转到登录界面
                    }else{
                        allconfirmState.state = false;
                        $.toptip(result.msg, 'warning');
                    }
                });
            },
            confirmPC:function(){
                ajaxHelper.post('/api/trades/position/close',{"params":{"id":proId}},function(result){
                    if(result.httpCode == "200"){
                            $.toptip('平仓成功', 'success');
                            confirmState.state = false;
                            shareState.state = true;
                            reloadPageData()
                    }else if(result.httpCode == "401"){
                        confirmState.state = false;
                        util.goUrl('/html/regist-load/load.html')
                        //跳转到登录界面
                    }else{
                        confirmState.state = false;
                        $.toptip(result.msg, 'warning');
                    }
                });
            },
            cancelPC:function(){
                $("#screenlayer2").hide()
                confirmState.state = false;
                allconfirmState.state = false;
            },

            //关闭晒单框
            closeShare:function(){
                $("#screenlayer2").hide()
                shareState.state = false;
            },
            //去晒单
            toShare:function(){
                $("#screenlayer2").hide()
                shareState.state = false;
            },

            confirmJC:function(){
                var amount = jc_data.buyHandNum;//手数
                var code = jc_data.selPri.code;//商品代码
                var limitProfit = jc_data.stopProNum;//止盈
                var stop = jc_data.stopLosNum;//止损
                var typeCode = jc_data.selPri.typeCode;
                var buySell = 2;
                if(jc_data.buyType){
                    buySell = 1;
                }

                ajaxHelper.post('/api/trades/position/open',
                    {"amount":amount,
                        "goodsCode":code,
                        "stopProfitStep":limitProfit,
                        "stopLossStep":stop,
                        "goodsType":typeCode,
                        "buySell":buySell
                    },
                    function(result){
                    if(result.httpCode == "200"){
                            $.toptip('建仓成功', 'success');
                            //页面刷新
                            $('#screenlayer').hide();
                            $('.videoWrap').show();
                            jpc_state.jcstate = false;
                            jpc_state.pcstate = false;
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });
            },

            liveConToBot:function(){//直播内容到底部
                $('.infoConWrap').scrollTop( parseInt($('.infoConLeft').height()));
            },

            chatConToBot:function(){//聊天内容到底部
                if(onlyseemy.state){//如果用选择了只看我的问答则聊天内容不自动滚动到聊天内容底部
                    return
                }else{
                    $('.infoConWrap').scrollTop( parseInt($('.infoConRight').height()));
                }
            },
            updateChatCon:function(){//更新聊天数据
                //检测聊天内容长度超长删除较久的数据

                if(chatCon.length>200){
                    chatCon.splice(0,50);
                }
            },

            autoUpdate:function(){
                setInterval(this.updateChatCon,70000);

            },

            sendChat: function () {//向服务器发送聊天内容
                //点击发送同时隐藏表情包
                this.closePicIcon();
                $('.chatCon').blur();
                if(!this.formCon){
                    return
                }else{
                    //正则替换字符串为表情

                //<svg class="icon" aria-hidden="true"><use xlink:href="#icon-lauf32"></use></svg>

                     //原始css表情包2016/12/19
                    //this.formCon = (this.formCon.replace(/\[lauf/g, ' <i class="iconfont imgIconItem icon-lauf')).replace(/\]/g,'"></i>');

                    //js-svg表情包2016/12/19
                    this.formCon = (this.formCon.replace(/\[lauf/g, '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-lauf')).replace(/\]/g,'"></use></svg>');

                    var msg = buildMsg(this.formCon,"text");
                    socket.send(msg);

                    this.formCon='';
                    setTimeout(this.chatConToBot,10)
                }

            },
            isSeeMe:function(){//是否看我自己的聊天
                onlyseemy.state = !onlyseemy.state;
                if(onlyseemy.state){
                    $('.onlySeeMeTip').stop().fadeIn(1000);
                    setTimeout(function(){$('.onlySeeMeTip').stop().fadeOut(1000);},1500)
                }else{
                    return;
                }
            },
            //选择商品
            selPro:function(index){
                jc_data.selPro= pro_data[index].name;//选中商品名
                jc_data.selProPri= pro_data[index].point;//选中商品价格
                jc_data.selPriList = pro_data[index].list;//选中商品规格列表
                jc_data.selPri = pro_data[index].list[0];//默认规格为第一个
                jc_data.selPri.stopProfitPoint = pro_data[index].list[0].stopProfitPoint;
                jc_data.selPri.stopLossPoint = pro_data[index].list[0].stopLossPoint;
                this.seledProIndex = index;
                this.seledForIndex = 0;
            },
            //选择规格
            selFormat:function(index){
                this.seledForIndex = index;
                jc_data.selPri = pro_data[this.seledProIndex].list[index];//改变选择的规格
                jc_data.selPri.stopProfitPoint = pro_data[this.seledProIndex].list[index].stopProfitPoint;
                jc_data.selPri.stopLossPoint = pro_data[this.seledProIndex].list[index].stopLossPoint;

            },
            //增加手数
            addHandNum:function(){
                if(jc_data.buyHandNum==jc_data.selPri.maxLot){
                    return
                }else{
                    jc_data.buyHandNum++
                }
            },
            //减少手数
            reduHandNum:function(){
                if(jc_data.buyHandNum==jc_data.selPri.minLot){
                    return
                }else{
                    jc_data.buyHandNum--
                }
            },
            //增加止盈数
            addStopProNum:function(){
                if(jc_data.stopProNum==jc_data.selPri.stopProfitPoint){
                    return
                }else{
                    jc_data.stopProNum++
                }
            },
            //减少止盈数
            reduStopProNum:function(){
                if(jc_data.stopProNum==0){
                    return
                }else{
                    jc_data.stopProNum--
                }
            },
            //增加止亏数
            addStopLosNum:function(){
                if(jc_data.stopLosNum==jc_data.selPri.stopLossPoint){
                    return
                }else{
                    jc_data.stopLosNum++
                }
            },
            //减少止亏数
            reduStopLosNum:function(){
                if(jc_data.stopLosNum==0){
                    return
                }else{
                    jc_data.stopLosNum--
                }
            },
            //显示全部商品
            showAllPro:function(){
                $('.otherProType').click(function(){
                    $(this).parents('.bodyItem').css('height','auto')
                })
                $('.otherProNum').click(function(){
                    $(this).parents('.bodyItem').css('height','auto')
                })
            },
            //买涨
            buyUp:function(){
                jc_data.buyType = true;
            },
            buyDown:function(){
                jc_data.buyType = false;
            }
        },
        created: function () {
            this.autoUpdate();
            var that = this;
            setTimeout(function(){

                //平仓列表上拉加载更多
                pullUpLoadMore()

                //显示允许交易浮动点提示
                $('.PCtips').click(function(){
                    var that = $(this)
                    that.parents('p').parents('.layerConWrap').parents('.layerCon').siblings('.layerHeader').children('.PCtipsCon').fadeIn();
                    setTimeout(function(){
                        that.parents('p').parents('.layerConWrap').parents('.layerCon').siblings('.layerHeader').children('.PCtipsCon').fadeOut(2000);
                    },5000)
                })
                $('#screenlayer').click(function(){//隐藏直播建仓平仓
                    $('.liveJC').hide();
                    that.hideJPC()
                })
                that.showAllPro();//显示全部商品
                //按钮反馈
                touchFeed();
                //表情包反馈
                (function(){
                    var feedBtn = document.querySelectorAll('.imgIconList .feedBtn');
                    ;[].forEach.call(feedBtn,function(item){
                        item.addEventListener('touchstart',function(){
                            this.style.backgroundColor = '#bbb';
                        })
                        item.addEventListener('touchend',function(){
                            this.style.backgroundColor = 'rgba(200,200,200,0)';
                        })
                    })
                })()
            },100)
        }
    });

})


