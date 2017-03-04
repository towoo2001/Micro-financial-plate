////生成游客随机姓名
var randomstr = 'abcdefghijklmnopqrstuvwxyz0123456789';
randomstr = randomstr.split('');
var str = '';
for(var i = 0;i<2;i++){
    str+=(randomstr[parseInt(Math.random()*(randomstr.length))])
}
var visitor = '游客'+str;//游客姓名
var name = getUser()||visitor;
var img = getUserImg()||'/images/defaultImg.gif';//头像
var sId = 0;

//var socket = new WebSocket("ws://192.168.0.120:8080/chat");
var socket = new WebSocket("ws://chat.interxq.com/chat");

$(function() {
	listen();
})
function buildMsg(msg,type){
	var msg = {
		"userName" :name,
		"message" : msg,
		"type":type,
        "img":img,
        "sex":1,
        "identity":1

	};
	msg = JSON.stringify(msg);
	return msg;
}

function listen() {
	socket.onopen = function() {
		var msg = buildMsg("登陆","wel");
		socket.send(msg);
	};

	socket.onmessage = function(evt) {
		var data = JSON.parse(evt.data);
		log(data)

		//js-svg表情包2016/12/19
		var msg = (data.message.replace(/\[lauf/g, '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-lauf')).replace(/\]/g,'"></use></svg>').replace(/&lt;/g,"<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "\'");;

		//原始css表情包2016/12/19
		//var msg = (data.message.replace(/\[lauf/g, ' <i class="iconfont imgIconItem icon-lauf')).replace(/\]/g,'"></i>').replace(/&lt;/g,"<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "\'");;
		if("user" == data.type && name == ""){
			name = "游客"+data.message;
		}
		chatCon.push({
			img: img,
			name: data.userName,
			con: msg,
			type:data.type
		});
		$("#total").html(data.total);
		if(onlyseemy.state){//如果选中只看自己则不进行聊天内容自动滚动到底部
			var infoConWrap = $('.infoConWrap').height();
			var infoConRight = $('.infoConRight').height();
			if(infoConRight>infoConWrap){
				$('.botHasNewmsg').show();
			}
			return;
		}else{
			setTimeout(function(){
				$('.infoConWrap').scrollTop( parseInt($('.infoConRight').height()));
				$('.botHasNewmsg').hide();
			},100)
		}
	};

	$('.botHasNewmsg').click(function(){
		$('.infoConWrap').scrollTop( parseInt($('.infoConRight').height()));
		$(this).hide()
	})
	$('.infoConWrap').scroll(function(){
		var h = $(this).height();
		var sh = $(this).scrollTop();
		var dh = $('.infoConRight').height();
		//console.log(h+sh+'px')
		//console.log(dh+'ms')
		if(h+sh==dh+110){
			$('.botHasNewmsg').hide()
		}
	})

	socket.onclose = function(evt) {

	}
	socket.onerror = function(evt) {

	}
}


document.onkeydown = function(event){

	var e = event || window.event || arguments.callee.caller.arguments[0];
	if(e && e.keyCode == 13){ // enter 键
		Vue.sendChat;
	}
};

//获取url中的参数
function getUser() {
	var userInfo = util.getStorage("userinfo");
	if(null == userInfo){
		return "";
	}else{
		var json =  JSON.parse(userInfo);
		name=json.memberName;

	}
	return name;
}
function getUserImg(){
	var userInfo = util.getStorage("userinfo");
	if(null == userInfo){
		return "";
	}else{
		var json =  JSON.parse(userInfo);
		img=json.faceimg;
	}
	return img;
}