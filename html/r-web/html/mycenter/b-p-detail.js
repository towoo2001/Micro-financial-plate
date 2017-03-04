$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    //使消息列表自动填充窗口剩余高度
    function vueLoadedFn(){
        var wH = $(window).height();
        var conh = $('#vuebox').height();
        $('.messageWrap.dealDetail .messageItem .msgWrap').height(wH-conh);
    }

    var laoding = false;
    var totalInfo = {
        buy:null,
        sell:null,
        profit:null,
        loss:null,
        pageNum:1,
        startTime:util.formatSearchTime(Date.parse(new Date())-1296000000),//默认当前时间前15天
        endTime:util.formatSearchTime(Date.parse(new Date())),
        por:[],
        type:null,
    };

    var msglength = {
        len:0,
    }
    console.log(totalInfo.startTime)

    ajaxHelper.post('/api/trades/mycenter/myCenterTotalInfo',{"params":{"startTime":totalInfo.startTime,"endTime":totalInfo.endTime}},function(result){
        if(result.httpCode == "200"){
            totalInfo.buy = result.data.buy;
            totalInfo.sell = result.data.sell;
            totalInfo.profit = result.data.profit;
            totalInfo.loss = result.data.loss;
        }else if(result.httpCode == "401"){
            //跳转到登录界面
        }else{
            $.toptip(result.msg, 'warning');
        }
    });

    new Vue({
        el:"#vuebox",
        data:{
            totalInfo:totalInfo,
            msglength:msglength
        },
        methods:{
            selectList:function(type){
                totalInfo.type = type;
                totalInfo.pageNum=1;
                ajaxHelper.post('/api/trades/mycenter/getProfitlist',{"params":{"pageNum":totalInfo.pageNum,"startTime":totalInfo.startTime,"endTime":totalInfo.endTime,"type":totalInfo.type}},function(result){
                    if(result.httpCode == "200"){
                        for(var i=0;i<result.data.length;i++){
                            result.data[i].openTime = util.formatDate(result.data[i].openTime)
                        }
                        totalInfo.por.splice(0,totalInfo.por.length)
                        for(var i = 0;i<result.data.length;i++){
                            totalInfo.por.push(result.data[i])
                        }
                        totalInfo.pageNum++
                        msglength.len = totalInfo.por.length;//消息列表长度
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });
            },
            searchMsg:function(){
                getUserAccount();
            }
        },
        created:function(){
            setTimeout(function(){
                $('.messageWrap .messageItem .messageTitle').click(function(event){
                    event.stopPropagation();
                    if($(this).parents('.messageItem').hasClass('active')){
                        $(this).parents('.messageItem').removeClass('active')
                    }else{
                        $(this).parents('.messageItem').addClass('active')
                    }
                    $(this).parents('.messageItem').siblings('.messageItem').removeClass('active');
                })
                //消息列表高度自动填充窗口剩余高度
                vueLoadedFn();
            },100)
        }
    });

    $('.messageWrap .messageItem .msgWrap').scroll(function(){
        var wh = $(this).height();//容器高度
        var ah = $(this).children('.detailLists').height();//整体内容高度
        var sh = $(this).scrollTop();//容器向上滚动的高度
        var that = $(this);
        //console.log($(this).scrollTop())

        var isBot = (wh+sh)==ah?true:false;//是否到达底部

        if(isBot&&!laoding){
            ajaxHelper.post('/api/trades/mycenter/getProfitlist',{"params":{"pageNum":totalInfo.pageNum,"startTime":totalInfo.startTime,"endTime":totalInfo.endTime,"type":totalInfo.type}},function(result){
                console.log(totalInfo.pageNum)
                totalInfo.pageNum++
                if(result.httpCode == "200"){
                    //result.data = [];
                    if(result.data.length>0){
                        for(var i=0;i<result.data.length;i++){
                            result.data[i].openTime = util.formatDate(result.data[i].openTime)
                        }
                        for(var i = 0;i<result.data.length;i++){
                            totalInfo.por.push(result.data[i])
                        }
                        loading = false;
                    }else{
                        $('.noHasMore').remove();
                        that.append(tpl.nomore);
                        return;
                    }
                }else if(result.httpCode == "401"){
                    //跳转到登录界面
                }else{
                    $.toptip(result.msg, 'warning');
                }
            });
        }
    })
})