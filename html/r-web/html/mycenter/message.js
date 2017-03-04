/**
 * Created by Administrator on 2016/11/17.
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
    var loading = false;
    var noticelist={
        pro:[],
        title:null,
        content:null,
        startDate:null,
        pageNum:1
    };

    var totalInfo={
        counts:null,
        grossProfit:null,
        amount:null
    };

    var msglength = {
        len:0,
    }

    ajaxHelper.get('/api/infos/notice/getlist',{"params":{"pageNum":noticelist.pageNum}},function(result){
        if(result.httpCode == "200"){
            if(result.data.length>0){
                for(var i=0;i<result.data.length;i++){
                    result.data[i].startDate = util.formatDate(result.data[i].startDate)
                }
                for(var i=0;i<result.data.length;i++){
                    noticelist.pro.push(result.data[i])
                }
                msglength.len = noticelist.pro.length
            }else{
                msglength.len = noticelist.pro.length
            }
            noticelist.pageNum = noticelist.pageNum + 1;
        }else{
            $.toptip(result.msg, 'warning');
        }
    });



    new Vue({
        el:"#vuebox",
        data:{
            noticelist:noticelist,
            totalInfo:totalInfo,
            msglength:msglength,//消息长度
        },
        methods:{
            selectInfo:function(){

            }
        },
        created:function(){
            setTimeout(function(){
                $(document).on('click','.messageWrap .messageItem .messageTitle',function(event){
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
        var wsh = $(window).scrollTop();
        var dh = $(document).height();
        var isBot = (wh+wsh)==dh?true:false;
        if(isBot&&!loading){
            loading = true;
            ajaxHelper.get('/api/infos/notice/getlist',{"params":{"pageNum":noticelist.pageNum}},function(result){
                if(result.httpCode == "200"){
                    if(result.data.length>0){
                        for(var i=0;i<result.data.length;i++){
                            result.data[i].startDate = util.formatDate(result.data[i].startDate)
                        }
                        for(var i=0;i<result.data.length;i++){
                            noticelist.pro.push(result.data[i])
                        }
                        msglength.len = noticelist.pro.length
                    }else{
                        msglength.len = noticelist.pro.length
                        $('.noHasMore').remove()
                        $('body').append(tpl.nomore);
                        return;
                    }
                    noticelist.pageNum = noticelist.pageNum + 1;
                    loading = false;
                }else{
                    $.toptip(result.msg, 'warning');
                }
            });

        }
    })
})