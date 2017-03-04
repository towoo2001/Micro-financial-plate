//选项卡
(function($){
    $.fn.table=function(optins){
        var settings = $.extend({
            'targetObj':null,
            'targetEqObj':null,
            'relaObj':null,
            'relaEqObj':null
        },optins);
        return this.mouseenter(function(){
            var _index = $(this).index();
            $(this).addClass('active').siblings(settings.targetEqObj).removeClass('active');
            $(settings.relaObj).eq(_index).show().siblings(settings.relaEqObj).hide();
        });
    }

    //下拉菜单
    $.fn.menuSlideDown = function(options){
        var settings = $.extend({
            'hoverShowObj':'div.menuChildren'
        },options);

        return this.hover(
            function(){
                $(this).children(settings.hoverShowObj).slideDown();
            },
            function(){
                $(this).children(settings.hoverShowObj).slideUp();
            }
        );

    };

})(jQuery)


