$(function(){
    function autoSize(){
        var wH = $(window).height();
        $('body').css('min-height',wHeight)
    }
    autoSize()
    $(window).resize(function(){
        autoSize()
    })

    new Vue({
        el:"#vuebox",
        data:{

        },
        methods:{

        },
        created:function(){
            setTimeout(
                function(){
                    touchFeed('.feedBtn')
                }
                ,100)
        }
    });


})