(function($){
	function city($el,fn){
		this.$el = $el;
		this.fn = fn;
	}
	city.prototype = {
		init: function(){
			this._create();
			if(!$.CityFlag) {
				this._evnt();
			}
			$.CityFlag = true;
		},
		_create:function(){
			var data = {parentId: 'ROOT'};
			this._createWrap();
			$(".citySelect").addClass("showCitySelect");
			this._getData(data);
		},
		_createWrap: function(){
			var html = [
				'<div class="citySelect">',
						'<div class="citySelect_head">',
						'<i>back</i>',
						'<em>确定</em>',
						'<span>选择地址</span>',
					'</div>',
					'<div class="citySelect_cont">',
						'<ul id="cityItems"></ul>',
					'</div>',
				'</div>'
			];
			$('body').append(html.join(""));
		},
		_getData:function(data,callback){
			ajaxHelper.post(config.common.city,data,function(data){
				callback && callback(data);
				var html = '';
				for(var i = 0; i<data.length;i++) {
					html += '<li id="'+ data[i].id +'">' +data[i].name + '</li>';
				}
				$("#cityItems").append(html);
			});
		},
		_destory: function(){
			var arr = this.$el.data('cityinfo');
			this.$el.attr("bind-data",JSON.stringify(arr));
			this.$el.data('cityinfo',null);
			$('.citySelect').removeClass("showCitySelect");
			setTimeout(function(){
				$('.citySelect').remove();
			},500);

		},
		_evnt: function(){
			var that = this;
			//点击列表
			$(document).on("click",".citySelect li",function(){
				var id = $(this).attr('id'),
					value = $(this).text(),
					arr = that.$el.data('cityinfo') || [],
					data  = {parentId: id};
				arr.push(value);
				that.$el.data('cityinfo',arr);
				that._getData(data,last);
				return;
				function last(data) {
					if(!data.length) {
						var arr = that.$el.data("cityinfo");
						that.$el.text(arr.join(''));
						that._destory();
						that.fn();
						return;
					}
					$("#cityItems").html('');
				}
			});

			//点击back
			$(document).on('click','.citySelect_head i',function(){
				that._destory();
			})

			//点击确定
			$(document).on('click','.citySelect_head em',function(){
				var arr = that.$el.data("cityinfo");
				if(arr&& arr.length) {
					that.$el.text(arr.join(''));
					that.fn();
				}
				that._destory();
				return false;
			});
		}
	};

	$.fn.CitySelect = function(fn) {
		var fn = fn || function(){};
		return new city($(this),fn).init();
	}
})(jQuery);