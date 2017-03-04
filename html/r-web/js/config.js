/**
 * [config 接口url配置]
 * @type {Object}
 */

//设置遮罩层高度
var wHeight = $(window).height();//窗口高度
//$("#screenlayer").height(wHeight);
//打印
function log(str){
    console.log(str)
};
//需要储存的url参数名称
var params = ['mobile','orgagency'];


//页面地址
var pageurl = {
    load:'/html/regist-load/load.html',//登录
    regist:'/html/regist-load/regist.html',//注册
    chicang:'/html/cichang/chicang.html',//持仓
    mycenter:'/html/mycenter/my.html',//个人中心
    message:'/html/mycenter/message.html',//消息
    editmyinfo:'/html/mycenter/edit-myinfo.html',//编辑个人信息
    recharge:'/html/mycenter/recharge.html',//充值
    cash:'/html/mycenter/cash.html',//提现
    bpdetail:'/html/mycenter/b-p-detail.html',//收支明细
    bphistory:'/html/mycenter/b-p-history.html',//交易历史
    fundsdetail:'/html/mycenter/funds-detail.html',//出入金明细
    applyagent:'/html/mycenter/apply-agent.html',//申请经纪人
    fylist:'/html/mycenter/fy_list.html',//申请经纪人
    share:'/html/mycenter/share.html',//分享
}

//需要登录权限url
var jdturl = pageurl.chicang+pageurl.message+pageurl.editmyinfo+pageurl.recharge+pageurl.cash+pageurl.bpdetail+pageurl.bphistory+pageurl.fundsdetail+pageurl.applyagent+pageurl.fylist+pageurl.share;

//未登录提示框
function getUserAccount(url){
    url = url||null;
    ajaxHelper.post("/api/customers/account/get","",function (result) {
        if(result.httpCode=='401'){
            $('#loadtiplayer').fadeIn(100);
            $('.userNotLoad').fadeIn(100);
            return false;
        }else{
            if(url){
                window.location = url
            }
            return true;
        }
        return true;
    })
}
var httpcode = null;
function notLoadTips(){
    $('.userNotLoad .nowToLoad').click(function(){
        window.location = pageurl.load;
        $('#loadtiplayer').hide(0);
        $('.userNotLoad').hide(0);
    })
    $('.userNotLoad .nowCancel').click(function(){
        $('#loadtiplayer').hide(0);
        $('.userNotLoad').hide(0);
    })
}
notLoadTips()
//按钮点击背景色反馈
function touchFeed(){
    var feedBtn = document.querySelectorAll('.feedBtn');
    ;[].forEach.call(feedBtn,function(item){
        item.addEventListener('touchstart',function(){
            //var bgcolor = this.style.backgroundColor;
            //var bgarr = bgcolor.split(',')
            //if(bgarr.length>3){
            //    bgarr.pop()
            //}
            //bgarr[0] = parseInt(bgarr[0].substring(5))
            //bgarr[1] = parseInt((bgarr[1]).trim())
            //bgarr[2] = parseInt((bgarr[2]).trim())
            //var defaultbg = bgarr;
            //bgarr = bgarr.map(function(item){
            //    //if(){}
            //    return item-20;
            //})
            //console.log(bgarr)
            this.style.opacity = 0.8;
            //console.log(color)
        })
        item.addEventListener('touchend',function(){
            this.style.opacity = 1;
            //console.log('touchend')
        })
    })
}

//构建token_str固定字符串
//var STATICSTR = '123';
//正则列表
var reg = {
    //身份证
    IDCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    //手机号
    cellPhone: /^1(3|4|5|7|8)\d{9}$/,
    // 固话
    telephone: /^1(3|4|5|7|8)\d{9}$/,
    //验证码
    checkCode: /^\d{6}$/,
    // 车架号
    carCode: /^[a-zA-Z0-9]{17}$/,
    // 车牌号
    carNumCode : /^[\u4e00-\u9fa5]{1}[a-zA-Z]{1}[a-zA-Z0-9]{5}$/
};

//表单校验
var checkForm = {
    //校验身份证
    isIDCards: function (str) {
        return reg.IDCard.test(str);
    },
    //校验电话号码
    isCellPhone: function (str) {
        return reg.cellPhone.test(str);
    },
    //校验验证码
    isCheckCode: function (str) {
        return reg.checkCode.test(str);
    },
    //校验车架号
    isCarCode: function (str) {
        return reg.carCode.test(str);
    },
    //校验车牌号
    isCarNum: function (str) {
        return reg.carNumCode.test(str);
    }
};


/**
 * 为了方便开发，采用固定的token和token_str进行开发
 * 后续上线微信后进行登陆集成
 */

var PAGESIZE = 10, //列表每页条数
    checkCodeInfo = '请把这个验证码填写到页面--仅供测试使用，勿提BUG，验证码:';
// var TOKEN    = 'D78EF91BA46346D4834BC37870E5B8C2',
// 	TOKENSTR = '58cc0860e57811ea86213b01315a780d';

var OPENID = 'daguan';


var BASE_URL = '###',//基本接口
    FILE_URL = '###',//文件接口
    API_TOKEN = '###',//接口token
    openIdField = 'openId';
    tokenField = 'token',
    tokenStrField = 'token_str';

//配置url路径
var config = {
    nameMaxLength:20,//最大姓名长度,
    addressMaxLength:100,//地址最大长度
    McIntroMaxLength:200,//描述最大长度
    login: BASE_URL + '/login',
    carNumMaxLength:7,  //车牌号
    roomNoLength:10,  //最大房号长度
    /*接口书写格式*/
    // 公共接口
    common: {
        city: BASE_URL + '###', //省市
        org: BASE_URL + '###',//组织数据
    },

    //其他接口
    other:{
        username:BASE_URL+'###',//其他接口
    }
};

//长按删除触发事件
function  longPressDelete(seletor,fn) {
    var time = 0;
    show();
    function show(){
        $(document).on('touchstart',seletor,function (e) {
            var that = $(this);
            e.stopPropagation();
            time = setTimeout(function () {
                deleteItem && deleteItem(that,fn);
            },800);
        });
        $(document).on('touchend','.unit_person_list a',function (e) {
            e.stopPropagation();
            clearTimeout(time);
        });
    }
}

//前面$el被点击的dom对象，fn是点击确定后的回调。可不传
function deleteItem($el,fn) {
    var fn = fn || $.noop;
    var html = [
        '<div class="delete-bg">',
        '<div class="delete-cont">',
        '<span id="delete_OK">确定</span><span id="delete_cancel">取消</span>',
        '</div>',
        '</div>'];
    $('body').append(html.join(''));
    $(document).on("click",".delete-bg #delete_OK",function(){
        fn && fn($el);
        $(".delete-bg").remove();
    });
    $(document).on("click",".delete-bg #delete_cancel",function(){
        $(".delete-bg").remove();
    });
}

/*
html
* */
var tpl = {
    nomore:"<div class='noHasMore'>没有更多了</div>",//没有更多礼物html
}

/**
 * 常用封装方法集合
 */
var util = {

    //创建微信公共头部
    setWecahtHeader:function (){
        window.onload = function(){
            //定义公共头部
            var headerhtml = document.createElement('div');
            var headerhtmltitle = document.getElementsByTagName('title')[0].innerHTML;//得到标题
            headerhtml.setAttribute('id','globalheader');
            headerhtml.innerHTML =
                '<div class="headerConWrap">'+
                '<a class="goBack" href="javascript:history.back()">'+
                '返回'+
                '</a>'+
                '<p class="headerTitle">'+
                headerhtmltitle+
                '</p>'+
                '</div>';

            var ua = window.navigator.userAgent.toLowerCase();//微信
            var u = navigator.userAgent;//手机类型android或ios

            var isandroid = u.indexOf('Android') > -1?true:false || u.indexOf('Linux') > -1?true:false;//测试是否为android手机，true为android
            var iswechat = ua.match(/MicroMessenger/i) == 'micromessenger'?true:false;//测试是否为微信true为微信
            var isios = u.indexOf('iPhone') > -1?true:false;//测试是否为ios手机true为ios

            if(isandroid&&iswechat){
                //如果为是在android手机的微信中打开添加公共头部
                document.body.appendChild(headerhtml)
                document.getElementById('vuebox').style.paddingTop = '1.32rem';
            }else{
                return;
            }
        }
    },
    //得到二维数组最大值
    largestOfFour: function (arr) {
        var results = []; // 创建一个results变量来存储
        // 创建一个外层循环，遍历外层数组
        for (var n = 0; n < arr.length; n++) {
            var largestNumber = 0; // 创建第二个变量，存储最大的数
            // 创建另一个循环，遍历子数组
            for (var sb = 0; sb < arr[n].length; sb++) {
                //检查子数组的元素是否大于当前存储的最大值
                if (arr[n][sb] > largestNumber) {
                    // 如果为真，将这个值赋予给变量largestNumber
                    largestNumber = arr[n][sb];
                }
            }
            // 内部循环后，将每个子数组中的值保存到数组results中
            results[n] = largestNumber;
        }
        // 返回数组
        return results;
    },

    //得到数组中最大最小值 bool传true获得最大值
    getArrMaxOrMIn:function(arr,bool){
        var result=arr.join(",").split(",");//转化为一维数组
        if(bool){
            return(Math.max.apply(null,result));//最大值
        }else{
            return(Math.min.apply(null,result));//最小值
        }
    },
    //构建token_str字符串
    getToken: function () {
        var storage = window.localStorage,
            token = storage.getItem(tokenField);
        return token;
    },
    //构建token_str字符串
    getTokenStr: function (tokenVaule) {
        var storage = window.localStorage,
            token_str = storage.getItem(tokenStrField);
        return token_str;
    },
    //获取openId
    getOpenId: function () {
        var storage = window.localStorage;
        return storage.getItem(openIdField);
    },
    //保存数据到localStorage
    saveStorage:function(storakey,storname){
        if (!window.localStorage) {
            throw new Error('not html5 browser');
        }
        var storage = window.localStorage;

        // storage.setItem(openIdField,OPENID);
        storage.setItem(storakey, storname);
    },
    getUserInfo:function(){
        if (!window.localStorage) {
            throw new Error('not html5 browser');
        }
        if(null == util.getStorage("userinfo")){
            //util.goUrl("/index.html");
        }else {
            return eval("("+ util.getStorage("userinfo")+")");
        }

    },
    //删除相应localStorage
    deleteStorage:function(storakey){
        if (!window.localStorage) {
            throw new Error('not html5 browser');
        }
        var storage = window.localStorage;
        storage.removeItem(storakey)
    },
    //得到相应LocalStorage
    getStorage:function(storakey){
        if (!window.localStorage) {
            throw new Error('not html5 browser');
        }
        var storage = window.localStorage;
        return storage.getItem(storakey)
    },
    //保存数据localStorage
    saveToken: function (token) {
        if (!window.localStorage) {
            throw new Error('not html5 browser');
        }
        var storage = window.localStorage;

        // storage.setItem(openIdField,OPENID);
        storage.setItem(tokenField, token);
        storage.setItem(tokenStrField, $.md5(token + API_TOKEN));
    },
    //删除token
    removeToken: function () {
        var storage = window.localStorage;
        /*storage.removeItem(tokenField);
         storage.removeItem(tokenStrField);*/
        storage.removeItem(openIdField);
    },
    //获取url参数
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)return unescape(r[2]);
        return null;
    },
    //格式化日期
    formatDate: function (now) {
        var year = new Date(now).getFullYear();
        var month = new Date(now).getMonth() + 1 >= 10 ? new Date(now).getMonth() + 1 : '0' + (new Date(now).getMonth() + 1);
        var date = new Date(now).getDate() >= 10　? new Date(now).getDate() :　'0' + new Date(now).getDate();
        return year + "-" + month + "-" + date;
    },
    //格式化时间戳
    formatTime: function (now) {
        if(!now)return '';
        var year = new Date(now).getFullYear();
        var month = new Date(now).getMonth() + 1 >= 10 ? new Date(now).getMonth() + 1 : '0' + (new Date(now).getMonth() + 1);
        var date = new Date(now).getDate() >= 10　? new Date(now).getDate() :　'0' + new Date(now).getDate();
        var hour = new Date(now).getHours();
        var minute = new Date(now).getMinutes();
        var second = new Date(now).getSeconds();
        return year + "-" + month + "-" + date + "   " + hour + ":" + minute + ":" + second;
    },
    //格式化搜索框时间
    formatSearchTime: function (now) {
        if(!now)return '';
        var year = new Date(now).getFullYear();
        var month = new Date(now).getMonth() + 1 >= 10 ? new Date(now).getMonth() + 1 : '0' + (new Date(now).getMonth() + 1);
        var date = new Date(now).getDate() >= 10　? new Date(now).getDate() :　'0' + new Date(now).getDate();
        var hour = new Date(now).getHours();
        var minute = new Date(now).getMinutes();
        var second = new Date(now).getSeconds();
        return year + "-" + month + "-" + date
    },
    formatKTime: function (now) {
        if(!now)return '';
        var year = new Date(now).getFullYear();
        var month = new Date(now).getMonth() + 1 >= 10 ? new Date(now).getMonth() + 1 : '0' + (new Date(now).getMonth() + 1);
        var date = new Date(now).getDate() >= 10　? new Date(now).getDate() :　'0' + new Date(now).getDate();
        var hour = new Date(now).getHours()>= 10　? new Date(now).getHours() :　'0' + new Date(now).getHours();
        var minute = new Date(now).getMinutes()>= 10　? new Date(now).getMinutes() :　'0' + new Date(now).getMinutes();
        return hour + ":" + minute;
    },

    //格式化时间戳 时间
    formatTimeForH5: function (now) {
        var year = new Date(now).getFullYear();
        var month = new Date(now).getMonth() + 1 >= 10 ? new Date(now).getMonth() + 1 : '0' + (new Date(now).getMonth() + 1);
        var date = new Date(now).getDate() >= 10　? new Date(now).getDate() :　'0' + new Date(now).getDate();
        var hour = new Date(now).getHours();
        var minute = new Date(now).getMinutes();
        var second = new Date(now).getSeconds();
        return year + "-" + month + "-" + date + "T" + (hour == '0' ? '00' : hour)
            + ":" + (minute == '0' ? '00' : minute)  + ":" + (second == '0' ? '00' : second);
    },
    // 页面跳转
    goUrl: function (url) {
        if(jdturl.indexOf(url)>-1){
            if(!getUserAccount(url)){
                return
            }
        }else{
            window.location = url;
        }
    }, // 页面跳转
    goUrlNo: function (url) {
            window.location.href = url;
    },
    //图片上传预览
    viewUpPic: function(picbox){
        var reader = new FileReader();
        var that = $(this);
        var _src;
        reader.onload = function(e){
            _src = e.target.result;
            console.log(_src);
            $(picbox).attr("src",_src);
        }
        reader.readAsDataURL(this.files[0]);
    },
    //格式化金额start
    formatMoney:function (number) {
        number = number.toString()
        number = number.replace(/\,/g, "");
        if(isNaN(number) || number == "")return "";
        number = Math.round(number * 100) / 100;
        if (number < 0)
            return '-' + this.outputdollars(Math.floor(Math.abs(number) - 0) + '') + this.outputcents(Math.abs(number) - 0);
        else
            return this.outputdollars(Math.floor(number - 0) + '') + this.outputcents(number - 0);
    },
    outputdollars:function (number) {
        if (number.length <= 3)
            return (number == '' ? '0' : number);
        else {
            var mod = number.length % 3;
            var output = (mod == 0 ? '' : (number.substring(0, mod)));
            for (i = 0; i < Math.floor(number.length / 3); i++) {
                if ((mod == 0) && (i == 0))
                    output += number.substring(mod + 3 * i, mod + 3 * i + 3);
                else
                    output += ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
            }
            return (output);
        }
    },
    outputcents:function (amount) {
        amount = Math.round(((amount) - Math.floor(amount)) * 100);
        return (amount < 10 ? '.0' + amount : '.' + amount);
    }
    //格式化金额stop
};

//ajax帮助
var ajaxHelper = {
    //purl 是接口url
    //data是传入参数
    //callbacl是成功后的回调函数
    //async是同步异步开发，默认异步可不传，如需同步，则必须传false
    post: function (purl, data, callback, async) {
        var async = async == void(0) ? true : false;
        $.showLoading();
        //data.token = util.getToken();
        //data.token_str = util.getTokenStr();
        // data.openId=util.getOpenId();
        $.ajax({
            type: 'POST',
            url: purl,
            async: async,
            timeout : 10000,
            data: JSON.stringify(data),
            contentType:"application/json;charset=UTF-8",
            dataType: 'json',
            success: function (result) {
                callback && callback(result);
            },
            error: function (info) {
                console.log(info);
                $.hideLoading();
                $.toptip('网络错误!', 'error');
            },
            complete: function (xhr, status) {
                $.hideLoading();
            }

        });
    },
    get: function (purl, data,callback, async) {
        var async = async == void(0) ? true : false;
        $.showLoading();
        //data.token = util.getToken();
        //data.token_str = util.getTokenStr(data.token, API_TOKEN);
        $.ajax({
            type: 'GET',
            url: purl,
            data: data,
            dataType: 'json',
            timeout : 10000,
            async:async,
            success: function (result) {
                callback && callback(result);
            },
            error: function (info) {
                console.log(info);
                $.hideLoading();
                $.toptip('网络错误!', 'error');
            },
            complete: function (xhr, status) {
                $.hideLoading();
            }
        });
    }
}
/*
websocket
实例化方法
//url为连接地址
//fnget为接收数据方法
//默认自动执行
var web = new myWebsocket(url,fnget)//连接并接收消息
web.sendMsg('消息体')//发送消息
 */
function myWebsocket(url,fnget){
    var url = url||'';
    var fnget = fnget||void(0);
    var mysocket = new WebSocket(url);
    //连接并接受消息
    this.socket =  function(){
        mysocket.onopen =function(result){
            console.log("socketConnectSuccess"+result)
        }
        mysocket.onmessage = function(result){
            fnget&&fnget(result);
        }
    }
    //自动执行
    this.socket();
    //发送消息
    this.sendMsg = function(msg){
        mysocket.send(msg)
    }
}

/**
 * 模拟登陆
 */
var loginData = {
    //username: 'admin',
    //userpwd: '123456',
    username: '13888888888',
    userpwd: '123456',
    deviceNum: ''
};
// util.saveToken('');

//ajaxHelper.post(config.login, loginData, function (data) {
//    util.saveToken(data.token);
//    var storage = window.localStorage;
//    data.loginTel = loginData.username;
//    storage.setItem('userinfo', JSON.stringify(data));
//    storage.setItem('base_url', BASE_URL);
//    storage.setItem('file_url', FILE_URL);
//}, false);

//判断用户是否登录

//聊天表情包列表2016/12/19
var chaticon = [//表情列表
    {
        key:'[lauf20]',
        clas:'#icon-lauf20',
    },
    {
        key:'[lauf21]',
        clas:'#icon-lauf21',
    },
    {
        key:'[lauf22]',
        clas:'#icon-lauf22',
    },
    {
        key:'[lauf23]',
        clas:'#icon-lauf23',
    },
    {
        key:'[lauf24]',
        clas:'#icon-lauf24',
    },
    {
        key:'[lauf25]',
        clas:'#icon-lauf25',
    },
    {
        key:'[lauf26]',
        clas:'#icon-lauf26',
    },
    {
        key:'[lauf27]',
        clas:'#icon-lauf27',
    },
    {
        key:'[lauf28]',
        clas:'#icon-lauf28',
    },
    {
        key:'[lauf29]',
        clas:'#icon-lauf29',
    },
    {
        key:'[lauf30]',
        clas:'#icon-lauf30',
    },
    {
        key:'[lauf31]',
        clas:'#icon-lauf31',
    },
    {
        key:'[lauf32]',
        clas:'#icon-lauf32',
    },
    {
        key:'[lauf33]',
        clas:'#icon-lauf33',
    },
    {
        key:'[lauf34]',
        clas:'#icon-lauf34',
    },
    {
        key:'[lauf35]',
        clas:'#icon-lauf35',
    },
    {
        key:'[lauf36]',
        clas:'#icon-lauf36',
    },
    {
        key:'[lauf37]',
        clas:'#icon-lauf37',
    },
    {
        key:'[lauf38]',
        clas:'#icon-lauf38',
    },
    {
        key:'[lauf39]',
        clas:'#icon-lauf39',
    },
    {
        key:'[lauf40]',
        clas:'#icon-lauf40',
    },
    {
        key:'[lauf41]',
        clas:'#icon-lauf41',
    },
    {
        key:'[lauf42]',
        clas:'#icon-lauf42',
    },
    {
        key:'[lauf43]',
        clas:'#icon-lauf43',
    },
    {
        key:'[lauf44]',
        clas:'#icon-lauf44',
    },
    {
        key:'[lauf45]',
        clas:'#icon-lauf45',
    },
    {
        key:'[lauf46]',
        clas:'#icon-lauf46',
    },
    {
        key:'[lauf47]',
        clas:'#icon-lauf47',
    },
    {
        key:'[lauf48]',
        clas:'#icon-lauf48',
    },
    {
        key:'[lauf49]',
        clas:'#icon-lauf49',
    },
    {
        key:'[lauf50]',
        clas:'#icon-lauf50',
    },
    {
        key:'[lauf51]',
        clas:'#icon-lauf51',
    },
    {
        key:'[lauf52]',
        clas:'#icon-lauf52',
    },
    {
        key:'[lauf53]',
        clas:'#icon-lauf53',
    },
    {
        key:'[lauf54]',
        clas:'#icon-lauf54',
    },
    {
        key:'[lauf55]',
        clas:'#icon-lauf55',
    },
    {
        key:'[lauf56]',
        clas:'#icon-lauf56',
    },
    {
        key:'[lauf57]',
        clas:'#icon-lauf57',
    },
    {
        key:'[lauf58]',
        clas:'#icon-lauf58',
    },
    {
        key:'[lauf59]',
        clas:'#icon-lauf59',
    },
    {
        key:'[lauf60]',
        clas:'#icon-lauf60',
    },
    {
        key:'[lauf61]',
        clas:'#icon-lauf61',
    },
    {
        key:'[lauf62]',
        clas:'#icon-lauf62',
    },
    {
        key:'[lauf63]',
        clas:'#icon-lauf63',
    },
    {
        key:'[lauf64]',
        clas:'#icon-lauf64',
    },
    {
        key:'[lauf65]',
        clas:'#icon-lauf65',
    },
    {
        key:'[lauf66]',
        clas:'#icon-lauf66',
    },
]
