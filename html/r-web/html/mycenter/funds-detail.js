$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })
    var loading = false;
    var prolist={
        pro:[],
        startTime:null,
        endTime:null,
        pageNum:1
    };

    var msglength = {
        len:0,
    }
    var totalInfo={
        counts:null,
        grossProfit:null,
        amount:null
    };
    ajaxHelper.post('/api/customers/fundsRecord/getlist',{"params":{"pageNum":prolist.pageNum,"startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
        if(result.httpCode == "200"){
            if(result.data.length>0){
                for(var i=0;i<result.data.length;i++){
                    result.data[i].tranTime = util.formatDate(result.data[i].tranTime)
                }
                for(var i=0;i<result.data.length;i++){
                    prolist.pro.push(result.data[i])
                }
                prolist.pro = result.data;
                msglength.len = prolist.pro.length;
            }else{
                msglength.len = prolist.pro.length;
            }
            prolist.pageNum = prolist.pageNum + 1;
        }else if(result.httpCode == "401"){
            //跳转到登录界面
        }else{
            $.toptip(result.msg, 'warning');
        }
    },true);

    //收缩框内填充时间
    prolist.startTime = util.formatSearchTime(Date.parse(new Date())-1296000000);
    prolist.endTime = util.formatSearchTime(Date.parse(new Date()));


    new Vue({
        el:"#vuebox",
        data:{
            prolist:prolist,
            totalInfo:totalInfo,
            msglength:msglength
        },
        methods:{
            selectInfo:function(){
                prolist.pageNum = 1;
                ajaxHelper.post('/api/customers/fundsRecord/getlist',{"params":{"pageNum":prolist.pageNum,"startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
                    if(result.httpCode == "200"){
                        for(var i=0;i<result.data.length;i++){
                            result.data[i].clostTime = util.formatDate(result.data[i].clostTime)
                        }
                        prolist.pro = result.data;
                        msglength.len = prolist.pro.length;
                        prolist.pageNum++;
                    }else if(result.httpCode == "401"){
                        //跳转到登录界面
                    }else{
                        $.toptip(result.msg, 'warning');
                    }
                });
            },
            botNavLocation:function(url){
                util.goUrl(url)
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
            },100)
        }
    });

    $(window).scroll(function(){
        var wh = $(window).height();
        var dh = $(document).height();
        var wsh = $(window).scrollTop();
        var isBot = (wh+wsh)==dh?true:false;
        if(isBot&&!loading){
            loading = true;
            ajaxHelper.post('/api/customers/fundsRecord/getlist',{"params":{"pageNum":prolist.pageNum,"startTime":prolist.startTime,"endTime":prolist.endTime}},function(result){
                log(prolist.pageNum)
                if(result.httpCode == "200"){
                    if(result.data.length>0){
                        for(var i=0;i<result.data.length;i++){
                            result.data[i].flowTime = util.formatDate(result.data[i].flowTime)
                        }
                        for(var i=0;i<result.data.length;i++){
                            prolist.pro.push(result.data[i])
                        }
                        msglength.len = prolist.pro.length;
                    }else{
                        msglength.len = prolist.pro.length;
                        $('.noHasMore').remove();
                        $('.BPDetail').append(tpl.nomore);
                    }
                    log(result.data)
                    prolist.pageNum = prolist.pageNum + 1;
                }else if(result.httpCode == "401"){
                    //跳转到登录界面
                }else{
                    $.toptip(result.msg, 'warning');
                }
                loading = false;
            },true);
        }
    })
})