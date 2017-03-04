$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    //交易历史列表长度
    var msglength = {
        len:0,//默认零大于九显示上拉加载更多动画
    }

    var prolist={
        pro:[],
        startTime:util.formatSearchTime(Date.parse(new Date())-1296000000),//从今天起前15天
        endTime:util.formatSearchTime(Date.parse(new Date())),
        pageNum:1
    };

    var totalInfo={
        counts:null,
        grossProfit:null,
        amount:null
    };

    var loading = false;

    //得到页面数据
    function getHistorData(){

        //得到交易列表
        ajaxHelper.post('/api/trades/hisposition/getlist',{"params":{"pageNum":prolist.pageNum,"startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
            if(result.httpCode == "200"){
                console.log(result.data)
                for(var i=0;i<result.data.length;i++){
                    result.data[i].closeTime = util.formatDate(result.data[i].closeTime)
                }
                if(result.data.length<1){
                    $('.weui-infinite-scroll').html('加载完毕');
                }
                for (var j = 0;j<(result.data).length;j++){
                    prolist.pro.push(result.data[j])
                }
                msglength.len = prolist.pro.length;
                //prolist.pro = result.data;
                prolist.pageNum = prolist.pageNum + 1;
                loading = false;
            }else if(result.httpCode == "401"){
                //跳转到登录界面
            }else{
                $.toptip(result.msg, 'warning');
            }
        });

        //得到头部总数据
        ajaxHelper.post('/api/trades/hisposition/getHisTotalInfo',{"params":{"startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
            if(result.httpCode == "200"){
                totalInfo.counts = result.data.counts;
                totalInfo.grossProfit = result.data.grossProfit;
                totalInfo.amount = result.data.amount;
            }else if(result.httpCode == "401"){
                //跳转到登录界面
            }else{
                $.toptip(result.msg, 'warning');
            }
        });

    }

    getHistorData()



    new Vue({
        el:"#vuebox",
        data:{
            prolist:prolist,
            totalInfo:totalInfo,
            msglength:msglength
        },
        methods:{
            selectInfo:function(){
                if(loading) return;
                ajaxHelper.post('/api/trades/hisposition/getlist',{"params":{"pageNum":"1","startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
                    if(result.httpCode == "200"){
                        for(var i=0;i<result.data.length;i++){
                            result.data[i].clostTime = util.formatDate(result.data[i].closeTime)
                        }
                        prolist.pro = result.data;
                        prolist.pageNum = 1;
                        loading = false;
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });
                ajaxHelper.post('/api/trades/hisposition/getHisTotalInfo',{"params":{"startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
                    if(result.httpCode == "200"){
                        totalInfo.counts = result.data.counts;
                        totalInfo.grossProfit = result.data.grossProfit;
                        totalInfo.amount = result.data.amount;
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });
            }
        },
        created:function(){
            setTimeout(
                function(){
                    //下拉刷新 体验不好 暂时取消
                    //$("body").pullToRefresh().on("pull-to-refresh", function() {
                    //    if(loading) return;
                    //    loading = true;
                    //    prolist.pageNum = 1;//下拉刷新默认第一页数据
                    //    getHistorData()
                    //    $('body').pullToRefreshDone();
                    //});

                    //上拉加载更多
                    $(document.body).infinite().on("infinite", function() {
                        if(loading) return;
                        loading = true;
                        getHistorData()
                    });
                }
            ,100)
        }
    });


})