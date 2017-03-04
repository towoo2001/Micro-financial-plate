$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    var asynctype = true||void(0);//定义页面加载得到图表数据的请求方式为同步false/异步viod(0)；12/05改为异步

    var userinfo={
        yue:null
    }

    //得到账户信息
    function getAccount(){
        ajaxHelper.post("/api/customers/account/get","",function (result) {
            if(result.httpCode == "200"){
                userinfo.yue = util.formatMoney(result.data.balance);
            }else{
                userinfo.yue= util.formatMoney("0");
                $.toptip(result.msg, 'warning');
            }
        },asynctype)
    }
    getAccount();

    //默认不能得到头部dom
    var cangetslide = false;
    //平仓列表长度
    var msglength = {
        len:0,//默认零大于九显示上拉加载更多动画
    }

    //平仓列表
    var prolist={
        pro:[],
        goods:null,
        profit:null
    };

    //点击加载更多按钮
    loadMoreBtn = {
        disabled:false,
        value:'上拉加载更多',
        state:false,
    }

    //浮动盈亏列表
    var profitLists = []

    var confirm={
            closeChargeFee:null,
            profit:null,
            balance:null
    };

    //得到平仓列表
    var loading = false;
    var pagenum = 1;

    function getList(){
        ajaxHelper.post('/api/trades/position/getlist',{"params":{"pageNum":pagenum}},function(result){
            loading = true;
            console.log(pagenum)
            if(result.httpCode == "200"){
                for(var i = 0;i<result.data.length;i++){
                    prolist.pro.push(result.data[i])
                }
                msglength.len = prolist.pro.length;
                loading = false;
                if(prolist.pro.length<10){
                    loadMoreBtn.value = '没有更多了'
                    loadMoreBtn.state = false;
                    $('.weui-infinite-scroll').remove()
                }else{
                    loadMoreBtn.state = true;
                }
                console.log(prolist.pro)
                getListProfit()
            }else if(result.httpCode == "401"){
                //跳转到登录界面
            }else{
                $.toptip(result.msg, 'warning');
            }
        },asynctype);
    }
    getList();

    //得到头部商品列表
    ajaxHelper.post('/api/infos/goods/getGoodsTypelist',null,function(result){
        if(result.httpCode == "200"){
            console.log(result.data)
            prolist.goods = result.data;
            cangetslide = true;
        }else if(result.httpCode == "401"){
            //跳转到登录界面
        }else{
            $.toptip(result.msg, 'warning');
        }
    },asynctype);

    //得到今天盈利状态
    function todayProfit(){
        ajaxHelper.post('/api/trades/position/todayProfit',{'params': null},function(result){
            if(result.httpCode == "200"){
                prolist.profit = result.data;
                console.log(result)
            }else if(result.httpCode == "401"){

            }
        });
    }
    todayProfit();

    //得到每个商品的浮动盈亏
    function getListProfit(){
        var prolists = prolist.pro;
        var idarr=[];
        if(prolists.length > 0){
            for(var i = 0;i<prolists.length;i++){
                idarr.push(prolists[i].id)
            }
            idarr = idarr.join(',');
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
                }else if(result.httpCode == "401"){
                    //跳转到登录界面
                }else{
                    $.toptip(result.msg, 'warning');
                }
            },asynctype);
        }
    }
    //getListProfit()

    //每二百秒跟新浮动盈亏
    setInterval(function(){
        todayProfit();
        getListProfit();
    },200000)

    //重新加载平仓的页面数据
    function reloadPageData(){
        pagenum = 1;
        getAccount();
        prolist.pro.splice(0,prolist.pro.length);
        getList();
        todayProfit();
    }

    //确认平仓弹出框
    var confirmState = {
        state:false
    }

    //分享弹出框
    var shareState = {
        state:false
    }

    var allconfirmState = {
        state:false
    }

    //是否允许最大交易5个点误差默认允许
    var isAgreenFiveFloat = {
        state:true,//单个平仓
        allstate:true,//全部平仓
    }

    //下拉加载更多
    function pullUpLoadMore(){
        if(!loading){
            $(window).scroll(function(){
                var winTop = $(window).scrollTop();//窗口到顶部的向上偏移量
                var redH = $(document).height() - $(window).height();//
                var isToBot = winTop==redH?true:false;//判断是否到达底部
                if(isToBot){//已经到达底部
                    pagenum++
                    console.log(pagenum)
                    getList();
                    getListProfit();
                }
            })
        }

    }
    //pullUpLoadMore()
    var userdetail = {
        faceimg:null
    }
    var proId = null;
    new Vue({
        el:"#vuebox",
        data:{
            confirmState:confirmState,
            allconfirmState:allconfirmState,
            prolist:prolist,
            confirm:confirm,
            userinfo:userinfo,
            shareState:shareState,//分享弹出框状态
            isAgreenFiveFloat:isAgreenFiveFloat,//是否允许偏差选择框
            loadMoreBtn:loadMoreBtn,//点击加载更多按钮
            userdetail:userdetail,//
            msglength:msglength//平仓列表长度
        },
        methods:{
            toPC:function(index){
                ajaxHelper.post('/api/trades/position/closePositionConfirm',{"params":{"id":index}},function(result){
                    if(result.httpCode == "200"){
                        confirm.closeChargeFee = result.data.closeChargeFee;
                        confirm.profit = result.data.profit;
                        confirm.balance = result.data.balance;
                        $("#screenlayer").show();
                        confirmState.state = true;
                        proId = index;
                    }else if(result.httpCode == "401"){
                        $('#loadtiplayer').fadeIn(100);
                        $('.userNotLoad').fadeIn(100);
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
                        $("#screenlayer").show()
                        allconfirmState.state = true;
                    }else if(result.httpCode == "401"){
                        $('#loadtiplayer').fadeIn(100);
                        $('.userNotLoad').fadeIn(100);
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });

            },
            allConfirmPC:function(){
                allconfirmState.state = false;
                ajaxHelper.post('/api/trades/position/oneKeyclose',{"params":{"closeType":1}},function(result){
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
                confirmState.state = false;
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
                $("#screenlayer").hide()
                confirmState.state = false;
                allconfirmState.state = false;
            },
            clickLoadMore:function(){//点击加载更多
                console.log('你点击了我')
            },
            //关闭晒单框
            closeShare:function(){
                $("#screenlayer").hide()
                shareState.state = false;
            },
            //去晒单
            toShare:function(){
                $("#screenlayer").hide()
                shareState.state = false;
            },
            botNavLocation:function(url){
                util.goUrl(url)
            },
            //头部商品宽度均分
            averTopPro:function(data,el){
                var dataL = data.length;
                var averW = (100/dataL)+'%'
                $(el).css('width',averW);
            },
            //平仓提醒
            PCTips:function(){

            }
        },
        created:function() {
            var that = this;
            setTimeout(function () {

                //允许偏差说明
                $('.PCtips').click(function(){
                    var that = $(this)
                    that.parents('p').parents('.layerConWrap').parents('.layerCon').siblings('.layerHeader').children('.PCtipsCon').fadeIn();
                    setTimeout(function(){
                        that.parents('p').parents('.layerConWrap').parents('.layerCon').siblings('.layerHeader').children('.PCtipsCon').fadeOut(2000);
                    },5000)
                })

                //上拉拉加载更多
                $(document.body).infinite().on("infinite", function() {
                    if(loading) return;
                    pagenum++
                    console.log(pagenum)
                    getList();
                    //getListProfit();
                });

                //均分头部商品列表宽度

                //头部列表均分
                var interVal = setInterval(function(){
                    if(cangetslide){
                        that.averTopPro(prolist.goods,'.proTable .swiper-wrapper .swiper-slide')
                        clearInterval(interVal);
                    }
                },100)

                //that.averTopPro(prolist.goods,'.proTable .swiper-wrapper .swiper-slide')
                //创建swiper
                new Swiper('.swiper-container', {//启动swiper
                    //pagination: '.swiper-pagination',//分页器
                    slidesPerView:'auto',//网格分布
                    paginationClickable: true,//分页器可点击
                })
                $("#nav li").click(function () {
                    var _index = $(this).index();
                    $(".swiper-pagination-bullet").eq(_index).click()
                    console.log(_index)
                })
                //按钮反馈
                touchFeed();
            }, 100)
        }
    });
})