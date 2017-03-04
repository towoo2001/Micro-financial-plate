/**
 * Created by Administrator on 2016/11/16.
 */

var msgList = [];
function getmsg(){//先从后台获取
    ajaxHelper.post('/api/infos/notice/getOneNotice', null,
        function(result){
            console.log(result)
            if(result.httpCode == "200"){
                msgList = result.data
            }else{
                $.toptip(result.msg, 'warning');
            }
        });
}
getmsg();
var page = 0;
//仅在页面第一次加载显示加载动画
function showLoading(){
    var isFirstLoad = sessionStorage.getItem('firstload');
    if(!isFirstLoad){
        sessionStorage.setItem('firstload','1')
        return
    }else{
        $('.spinner').remove();
    }
}
showLoading();
setTimeout(function(){
    $('.spinner').remove();
    $('.weui_mask_transparent').remove();
    $('.weui_toast.weui_loading_toast.weui_toast_visible').remove();
},10000)
$(function(){
    function autoSize(){
        var wH = $(window).height();//窗口高度
        $('body').css('min-height',wHeight)
        var fH = $("#footer").height();//底部高度
        var hH = $(".accountHeader").height()//头部高度
        var proH = $(".ProListWrap").height()//产品列表高度
        var mH = $(".PGXTMsg").height()//系统消息高度
        var lH = $('.lookUpOrDown').height()//看涨看跌高度
        var bsH = $('.botProSel').height()//选择框高度

        var conH = wH-fH;//内容区域总高度

        var chartH = conH - (hH+proH+mH+lH+bsH)-22;//echart高度

        $('#chart').height(chartH)
    }
    autoSize();
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
    $(window).resize(function(){
        autoSize();
        //页面resize后重新显示图表以保证页面内容始终是全屏
        app = echarts.init(document.getElementById('chart'));//得到图表容器
        app.showLoading();//显示加载动画
        app.setOption(option);//图表容易设置配置并画图
        app.hideLoading();//回执完毕隐藏加载动画
    })
    //k线图纵坐标最高最低值
    var kYmin = 3320
    var kYmax = 3350
    var vm = null;//vue对象
    var app = null;//暴露图表容器对象
    var option = {};//暴露图表配置对象
    var cangetslide = false;//是否可以得到头部slide dom；
    var userinfo={
        yue:null,//用户账户余额
    }
    //得到账户信息
    function getAccount(){
        ajaxHelper.post("/api/customers/account/get","",function (result) {
            if(result.httpCode == "200"){
                userinfo.yue = util.formatMoney(result.data.balance);
            }else{
                userinfo.yue=util.formatMoney('0');
                $.toptip(result.msg, 'warning');
            }
        })
    }
    getAccount();
    //图表展示数据
    var rawData ="";
    var type="HSAG";
    var min="1";
    var Kdata =''
    var Kdatas = ''

    //创建图表
    function createMyChart(){
        app = echarts.init(document.getElementById('chart'));//得到图表容器
        app.title = '微控天下图表';//图表标题
        app.showLoading();//显示加载动画
        app.setOption(option);//图表容器设置配置并画图
        app.hideLoading();//回执完毕隐藏加载动画
    };
    var asynctype = void(0);//定义页面加载得到图表数据的请求方式为同步false/异步viod(0)；12/05改为异步
    //得到K线图数据
    function getk() {
        //ajax
        ajaxHelper.get('api/prices/kchart/get?goodsType='+type+'&chartType='+min, null, function (result) {
            console.log('K线图数据')
            console.log(result);
            if (result.httpCode == "200") {
                var defaultdata = result.data;
                var bigarr ="";
                for (var i = 0; i < defaultdata.length; i++) {
                    var date = util.formatKTime(defaultdata[i].kdate);
                    var open = defaultdata[i].openPrice + "";
                    var close = defaultdata[i].closePrice + "";
                    var min = defaultdata[i].min + "";
                    var max = defaultdata[i].max + "";
                    var arr = "['" + date + "','" + open + "','" + close + "','" + min + "','" + max + "']";
                    bigarr += "," + arr;
                }
                bigarr = "["+bigarr.substr(1)+"]";
                bigarr = eval("("+bigarr+")");
                rawData=bigarr;

                //将数据去除时间
                var shellDatas = rawData.map(function (item) {//数据操作 浮动小框内数据
                    return [+item[1], +item[2], +item[3], +item[4]];
                });
                //得到数组中最大最小值赋给k线图纵坐标
                kYmax = +(util.getArrMaxOrMIn(shellDatas,1))+3//最大值
                kYmin = +(util.getArrMaxOrMIn(shellDatas,0))-3//最小值
                getKOp();
            } else if (result.httpCode == "401") {
                //跳转到登录界面
            } else {
                $.toptip(result.msg, 'warning');
            }
        },asynctype);
    }
    //getk();//页面加载初始化一次
    var　Fsdate = [100, 200, 300, 400, 500, 100];//分时图横坐标为日期
    var FSdata = '';//分时图纵坐标数据
    //得到分时图数据
    function getF() {
        //ajax
        ajaxHelper.get('/api/prices/timeline/get?goodsType='+type, null, function (result) {
            if (result.httpCode == "200") {
                var defaultdata = result.data;
                var t="";
                var time = '';
                for (var i = 0; i < defaultdata.length; i++) {
                    t += "," + defaultdata[i].nowPrice;
                    time +=',"'+ (util.formatKTime(defaultdata[i].createTime))+'"';
                }
                t = "["+t.substr(1)+"]";
                t = eval("("+t+")");
                time = "["+time.substr(1)+"]";
                time = eval("("+time+")");
                Fsdate = time;
                FSdata=t;
                getFOP();
                //显示删除动画
                $('.spinner').addClass('hide');
                setTimeout(function(){$('.spinner').remove();},300)
            } else if (result.httpCode == "401") {
                //跳转到登录界面
            } else {
                $.toptip(result.msg, 'warning');
            }
        },asynctype);
    }
    //getF();
    function getKOp() {
        Kdatas = rawData.map(function (item) {//数据操作
            return item[0];
        });
        Kdata = rawData.map(function (item) {//数据操作 浮动小框内数据
            return [+item[1], +item[2], +item[3], +item[4]];
        });
        option = {//图表配置
            backgroundColor: '#fff',//图表背景色
            legend: {//头部导航
                show:false,
                inactiveColor: '#777',
                textStyle: {
                    color: '#fff'
                }
            },
            grid:{
                //show:true,
                x:0,
                y:5,
                x2:'8.25%',
                y2:26,
            },
            tooltip: {//鼠标经过垂直线
                trigger: 'axis',
                axisPointer: {
                    animation: false,
                    lineStyle: {
                        color: '#f94e4e',
                        width: 1,
                        opacity: 1
                    }
                }
            },
            xAxis: {//横坐标
                type: 'category',
                data: Kdatas,
                axisTick:{
                    inside:true,
                },
                axisLabel:{
                    margin:8,
                    rotate: -15,
                },
                splitLine:{//分割线
                    show:true,
                    lineStyle:{
                        color: ['#f4f4f4'],
                        width: 1,
                        type: 'solid'
                    }
                },
                axisLine: { lineStyle: { color: '#aaa' } },
                textStyle:{
                    fontSize:10
                }
            },
            yAxis: {//纵坐标
                min: kYmin,
                max: kYmax,
                scale: true,
                axisTick:{
                    inside:true,
                },
                axisLabel:{
                    //rotate:30,
                    margin:-38,
                },
                axisLine: { lineStyle: { color: '#aaa' } },
                splitLine:{//分割线
                    show:true,
                    lineStyle:{
                        color: ['#f4f4f4'],
                        width: 1,
                        type: 'solid'
                    }
                },
                textStyle:{
                    fontSize:10
                },
            },
            animation: true,//绘图的动画效果
            series: [
                {
                    type: 'candlestick',//图表类型K线图
                    name:'1',
                    data: Kdata,//浮动框中的数据
                    itemStyle: {
                        normal: {
                            color: '#FD1050',//涨线段颜色
                            color0: '#0CF49B',//跌线段颜色
                            borderColor: '#FD1050',//涨线段背景色
                            borderColor0: '#0CF49B'////跌线段背景色
                        }
                    }
                },
            ]
        };
        createMyChart();
    }
    //分时图配置
    function getFOP() {
        option = {
            title:{
                show:false,
            },
            legend:{
                show:false,
            },
            dataZoom:{
                type:'inside',
                disabled:true,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false,
                    lineStyle: {
                        color: '#f94e4e',
                        width: 1,
                        opacity: 1
                    }
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: ['80%', '80%'],
                axisTick:{
                    inside:true,
                },
                data: Fsdate,
                axisLabel:{
                    margin:8,
                    rotate: -15,
                },
                axisLine: { lineStyle: { color: '#aaa' } },//横坐标颜色
                splitLine:{
                    show:true,
                    lineStyle:{
                        color: ['#f4f4f4'],
                        width: 1,
                        type: 'solid'
                    }
                },
                textStyle:{
                    fontSize:10
                }
            },
            grid:{
                //show:true,
                x:0,
                y:5,
                x2:'8.25%',
                y2:26,
            },
            yAxis: {
                type: 'value',
                axisTick:{
                    inside:true,
                },
                axisLabel:{
                    //rotate:30,
                    margin:-38,
                },
                boundaryGap: ['', '100%'],
                axisLine: { lineStyle: { color: '#aaa' } },
                textStyle:{
                    fontSize:10
                },
                splitLine:{
                    show:true,
                    lineStyle:{
                        color: ['#f4f4f4'],
                        width: 1,
                        type: 'solid'
                    }
                }

            },
            series: [
                {
                    name:'分时数据',
                    type:'line',
                    smooth:true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: {
                        normal: {
                            color: 'rgb(0, 160, 233)'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(69, 190, 240)'
                            }, {
                                offset: 1,
                                color: 'rgb(3, 136, 196)'
                            }])
                        }
                    },
                    data: FSdata
                }
            ]
        };
        createMyChart()
    }
    //图表显示状态默认false
    var chartTypeState = {
        state:false
    }
    //商品列表
    var pro_data = []
    //建仓数据
    var jc_data = {
        buyType:true,///购买类型涨跌，默认买涨;false为买跌
        selPro:null,//选中商品名
        selType:null,//选中商品名
        selProPri:null,//选中商品点数
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
    //ajax获取商品类型
    ajaxHelper.post('/api/infos/goods/getGoodsTypelist',null,function(result){
        if(result.httpCode == "200"){
            //prolist.goods = result.data;
            for(var i=0;i<result.data.length;i++){
                pro_data.push(result.data[i]);
            }
            if(result.data.length > 0){
                jc_data.selPro=result.data[0].name;//选中商品名
                jc_data.selProPri=result.data[0].point;//选中商品点数
                jc_data.selType = result.data[0].goodsType;
                jc_data.selPriList=result.data[0].list;//选中商品规格列表
                jc_data.selPri=result.data[0].list[0];//选中规格
                jc_data.selPri.stopProfitPoint = pro_data[0].list[0].stopProfitPoint;
                jc_data.selPri.stopLossPoint = pro_data[0].list[0].stopLossPoint;
            }
        }else if(result.httpCode == "401"){
            //跳转到登录界面
        }else{
            $.toptip(result.msg, 'warning');
        }
        cangetslide = true;
    },asynctype);//12/05改为异步
    //异步获取看涨看跌数据
    function  getdui() {
        ajaxHelper.post('/api/prices/index/buyPercent',
            {"params": {"goodsType":type}}, function(result){
                if(result.httpCode == "200"){
                    var percent = (result.data.percent*100).toFixed(0);
                    buyPercent.uppercent = percent + "%";
                    buyPercent.downpercent = (100 - percent) + "%";
                }else{
                    $.toptip(result.msg, 'warning');
                }
            });
    }
    getdui()
    //建仓容器默认显示状态
    var jc_state={
        jcstate:false//建仓默认隐藏
    }
    //图表左上角信息
    var leftTopInfo = {
        higst:null,//最高
        lowst:null,//最低
        today:null,//今开
        ytday:null,//昨开
    }
    //得到图表左上角信息
    function getLeftTopInfo(){
        ajaxHelper.post('/api/prices/index/getTotalInfo',
            {"params": {"goodsType":type}}, function(result){
                console.log(result)
                leftTopInfo.higst = result.data.quotationInfo.highPrice;
                leftTopInfo.lowst = result.data.quotationInfo.lowPrice;
                leftTopInfo.today = result.data.quotationInfo.toOpenPrice;
                leftTopInfo.ytday = result.data.quotationInfo.yeClosePrice;
                if(result.httpCode == "200"){

                }else{
                    $.toptip(result.msg, 'warning');
                }
            });
    }
    getLeftTopInfo();

    //看涨看跌数据
    var buyPercent = {
        uppercent:'40%',//看涨
        downpercent:'60%'//看跌
    };
    var charttype = [//图表类型
        {
            type:0,name:'分时'
        },
        {
            type:1,name:'1分'
        },
        {
            type:2,name:'5分'
        },
        {
            type:3,name:'15分'
        }
    ]
    var seledcharttype = {
        type:0//选中图表类型默认分时图
    }
    /*自动更新分时图数据*/
    var oneMinK = null;//1分k线图定时器
    var fiveMinK = null;//5分k线图定时器
    var fiteenMinK = null;//15分k线图定时器
    function autoUpdateKChart(){
        if(seledcharttype.type==1){
            clearInterval(oneMinK);
            clearInterval(fiveMinK)//清除无用interval
            clearInterval(fiteenMinK)
            oneMinK = setInterval(function(){//1分K线图
                getk();//得到k线图数据
            },60000)
        }else if(seledcharttype.type==2){
            clearInterval(oneMinK);
            clearInterval(fiveMinK)//清除无用interval
            clearInterval(fiteenMinK)
            fiveMinK = setInterval(function(){//5分K线图
                getk();
            },300000)
        }else if(seledcharttype.type==3){
            clearInterval(oneMinK);
            clearInterval(fiveMinK)//清除无用interval
            clearInterval(fiteenMinK)
            fiteenMinK = setInterval(function(){//15分K线图
                getk();
            },900000)
        }else{//否则清除所有interval
            clearInterval(oneMinK)
            clearInterval(fiveMinK)
            clearInterval(fiteenMinK)
        }
    }
    vm = new Vue({
        el:"#vuebox",
        data:{
            chartTypeState:chartTypeState,//图表类型选择状态
            data:rawData,//图表数据
            jc_state:jc_state,//建仓容器默认隐藏
            pro_data:pro_data,//商品列表数据
            jc_data:jc_data,//选中的商品数据
            seledProIndex:0,//选中商品索引默认0
            seledForIndex:0,//选中规格索引默认0
            userinfo:userinfo,//用户信息
            charttype:charttype,//图表类型
            seledcharttype:seledcharttype,//默认选中图表为分时图
            buyPercent:buyPercent,//看涨看跌数据
            leftTopInfo:leftTopInfo,//图表左上角数据
        },
        methods:{
            //图表类型选择
            selCharttype:function(index){
                seledcharttype.type = index;
                if(index==0){
                    getFOP();
                    this.createChart();
                }else{
                    type=jc_data.selType;
                    min=seledcharttype.type;
                    getdui();
                    if(0==min){
                        getF();
                        //getFOP()
                    }else {
                        getk();
                        //getKOp();
                    }
                    //this.createChart();
                }
                //选择商品或者选择商品时执行定时函数
                autoUpdateKChart()
            },
            //头部商品列表选择
            selPro:function(index){//选择商品方法
                this.seledProIndex = index;
                var i = index;//得到当前商品数组索引
                //console.log(pro_data[i])
                jc_data.selPro = pro_data[i].name;//选中商品名
                jc_data.selProPri = pro_data[i].point;//重新赋值点数
                jc_data.selType = pro_data[i].goodsType;//选中商品名
                jc_data.selPriList = pro_data[i].list;//选中商品规格列表
                jc_data.selPri = pro_data[i].list[0];//默认选中的规格为第一个
                jc_data.selPri.stopProfitPoint = pro_data[i].list[0].stopProfitPoint;
                jc_data.selPri.stopLossPoint = pro_data[i].list[0].stopLossPoint;
                this.botProChangeSwiper();//重新渲染swiper
                $(".selChangeBody .swiper-pagination span").eq(0).click();//swiper默认回滚到第一个
                type=jc_data.selType;
                min=seledcharttype.type;
                getdui();//得到看涨看跌数据
                if(0==min){
                    getF();
                    //getFOP()
                }else {
                    getk();
                    //getKOp();
                }
                //this.createChart();
                //选择商品或者选择商品时执行定时函数
                autoUpdateKChart();//重新设置定时器更新图表
                getLeftTopInfo();//重新得到每日最高最低数据
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
            //确认建仓
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
                getUserAccount();//判断用户是否已经登录 否则弹出登录提示框
                ajaxHelper.post('/api/trades/position/open',
                    {"amount":amount,
                        "goodsCode":code,
                        "stopProfitStep":limitProfit,
                        "stopLossStep":stop,
                        "goodsType":typeCode,
                        "buySell":buySell
                    },
                    function(result){
                        console.log(result)
                        if(result.httpCode == "200"){
                                $.toptip('建仓成功', 'success');
                                $('#screenlayer').hide();
                                jc_state.state = false;
                                $('.liveJC').hide();
                                getAccount();//重新计算用户余额
                                getdui()//重新得到看涨看跌数据
                        }else if(result.httpCode == "401"){
                            //跳转到登录界面
                            $('#loadtiplayer').fadeIn(100);
                            $('.userNotLoad').fadeIn(100);
                        }else{
                            $.toptip(result.msg, 'warning');
                        }
                    });
            },
            showJC:function(){//显示建仓
                $('#screenlayer').show();
                $('.liveJC').show();
                jc_state.jcstate = true;
            },
            //买涨
            buyUp:function(){
                jc_data.buyType = true;
                this.showJC()
            },
            //买跌
            buyDown:function(){
                jc_data.buyType = false;
                this.showJC()
            },
            hideJC:function(){//隐藏建仓
                $('#screenlayer').hide();
                $('.liveJC').hide();
                jc_state.jcstate = false;
            },
            botNavLocation:function(url){
                util.goUrl(url)
            },
            createChart:function(){//创建图表
                app = echarts.init(document.getElementById('chart'));//得到图表容器
                app.title = '微控天下图表';//图表标题
                app.showLoading();//显示加载动画
                app.setOption(option);//图表容易设置配置并画图
                app.hideLoading();//回执完毕隐藏加载动画
            },
            //底部商品规格切换选择
            botProChangeSwiper:function(){
                var that = this;
                new Swiper('.selChangeBody .swiper-container', {//启动swiper
                    direction : 'vertical',
                    prevButton:'.selChangeUp img',
                    nextButton:'.selChangeDown img',
                    pagination : '.swiper-pagination',
                    paginationClickable :true,
                    observer:true,
                    //规格切换回调函数
                    onSlideChangeEnd: function(swiper){
                        var i = $(".selChangeBody .swiper-wrapper .swiper-slide.swiper-slide-active").index();//得到当前的索引
                        console.log(i)
                        if(i<0){
                            return
                        }
                        that.seledForIndex = i;
                        jc_data.selPri = jc_data.selPriList[i];//赋给选中的规格
                        console.log(jc_data.selPri);
                    }
                })
            },
            //头部商品列表等分
            averTopPro:function(data,el){
                console.log($(el))
                var dataL = data.length||2;
                var averW = (100/dataL)+'%'
                $(el).css('width',averW);
            },
            //接收系统消息
            getSysMsg:function(){
                $('.sysMsg').addClass('hide').removeClass('show');

                clearTimeout(timeout);
                var timeout = setTimeout(function(){
                    var newMsg = msgList[page];
                    $('.sysMsg').html(newMsg).removeClass('hide').addClass('show');
                    page++;
                    },800
                )
                if(page == msgList.length){
                    page = 0;
                }
            }
        },
        created:function() {
            var that = this;
            setTimeout(function () {
                //模拟自动刷新系统消息
                setInterval(function(){that.getSysMsg()},8000)
                $('#screenlayer').click(function(){//隐藏建仓
                    that.hideJC()
                })
                //头部列表均分
                var interVal = setInterval(function(){
                    if(cangetslide){
                        that.averTopPro(jc_data,'.index2Wrap .indexMain .ProListWrap .swiper-slide')
                        clearInterval(interVal);
                    }
                },100)
                //创建产品列表swiper
                new Swiper('.ProListWrap .swiper-container', {//启动swiper
                    slidesPerView:'auto'
                })
                //底部拨动文本swiper
                that.botProChangeSwiper();
                $("#nav li").click(function () {
                    var _index = $(this).index();
                    $(".swiper-pagination-bullet").eq(_index).click()
                    console.log(_index)
                })
                //生成图表
                getF();//初始显示分时图
                //反馈按钮
                touchFeed()
                //图表悬着按钮下拉效果
                $('.chartTiemSelKe').click(function(){
                    $(this).hide();
                    chartTypeState.state = true;
                });
                $('.chartTiemSel .chartSelItem').click(function(){
                    var text = $(this).html();
                    chartTypeState.state = false;
                    $('.chartTiemSelKe').html(text).show();
                })
            },100)
        }
    });

})