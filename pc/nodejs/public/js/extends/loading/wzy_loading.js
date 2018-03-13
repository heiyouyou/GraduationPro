// 注：需要结合jQuery文件和wzy_animate.css文件使用，效果才会出现
(function($){
	$.loading = function(options){
		var opts = $.extend({},$.loading.template,$.loading.defaults,options);
		// 每次调用都会有随机的动画效果
		if(isEmpty(opts.mark))opts.mark = Math.floor(Math.random() * 10);
		// 创建指定动画类型的loading模板
		var $div = $(opts["t"+opts.mark]);
		// 设置loading的宽高
		$div.width(opts.width).height(opts.height);
		//target为某个目标元素，为某个目标元素添加loading效果
		opts.target.html($div);
	};
	$.loading.defaults = {
		width:30,//loading的宽度
		height:30,//loading的高度
		mark:1//loading出现的动画效果
	};
	$.loading.template = {
		t1:"<div class='sk-cube-grid kcube'>"+
			"      <div class='sk-cube sk-cube1'></div>"+
			"      <div class='sk-cube sk-cube2'></div>"+
			"      <div class='sk-cube sk-cube3'></div>"+
			"      <div class='sk-cube sk-cube4'></div>"+
			"      <div class='sk-cube sk-cube5'></div>"+
			"      <div class='sk-cube sk-cube6'></div>"+
			"      <div class='sk-cube sk-cube7'></div>"+
			"      <div class='sk-cube sk-cube8'></div>"+
			"      <div class='sk-cube sk-cube9'></div>"+
			"    </div>",
		t2:" <div class='sk-rotating-plane kcube'></div>",
		t3:"<div class='sk-folding-cube kcube'>"+
			"      <div class='sk-cube1 sk-cube'></div>"+
			"      <div class='sk-cube2 sk-cube'></div>"+
			"      <div class='sk-cube4 sk-cube'></div>"+
			"      <div class='sk-cube3 sk-cube'></div>"+
			"    </div>",
		t4:"<div class='sk-spinner sk-spinner-pulse kcube'></div>",
		t5:"<div class='sk-wandering-cubes kcube'>"+
		   "   <div class='sk-cube sk-cube1'></div>"+
		   "   <div class='sk-cube sk-cube2'></div>"+
		   "</div>",
		t6:"<div class='sk-wave kcube'>"+
			"   <div class='sk-rect sk-rect1'></div>"+
			"   <div class='sk-rect sk-rect2'></div>"+
			"   <div class='sk-rect sk-rect3'></div>"+
			"   <div class='sk-rect sk-rect4'></div>"+
			"   <div class='sk-rect sk-rect5'></div>"+
			"</div>",
		t7:"<div class='sk-circle kcube'>"+
			"   <div class='sk-circle1 sk-child'></div>"+
			"   <div class='sk-circle2 sk-child'></div>"+
			"   <div class='sk-circle3 sk-child'></div>"+
			"   <div class='sk-circle4 sk-child'></div>"+
			"   <div class='sk-circle5 sk-child'></div>"+
			"   <div class='sk-circle6 sk-child'></div>"+
			"   <div class='sk-circle7 sk-child'></div>"+
			"   <div class='sk-circle8 sk-child'></div>"+
			"   <div class='sk-circle9 sk-child'></div>"+
			"   <div class='sk-circle10 sk-child'></div>"+
			"   <div class='sk-circle11 sk-child'></div>"+
			"   <div class='sk-circle12 sk-child'></div>"+
			"</div>",
		t8:"<div class='sk-double-bounce kcube'>"+
			"   <div class='sk-child sk-double-bounce1'></div>"+
			"   <div class='sk-child sk-double-bounce2'></div>"+
			" </div>",
		t9:"<div class='sk-chasing-dots kcube'>"+
			"   <div class='sk-child sk-dot1'></div>"+
			"   <div class='sk-child sk-dot2'></div>"+
			"</div>",
		t10:"<div class='sk-three-bounce kcube'>"+
			"  <div class='sk-child sk-bounce1'></div>"+
			"  <div class='sk-child sk-bounce2'></div>"+
			"  <div class='sk-child sk-bounce3'></div>"+
			"</div>",
		t11:"<div class='sk-fading-circle kcube'>"+
			"	<div class='sk-circle1 sk-circle'></div>"+
			"	<div class='sk-circle2 sk-circle'></div>"+
			"	<div class='sk-circle3 sk-circle'></div>"+
			"	<div class='sk-circle4 sk-circle'></div>"+
			"	<div class='sk-circle5 sk-circle'></div>"+
			"	<div class='sk-circle6 sk-circle'></div>"+
			"	<div class='sk-circle7 sk-circle'></div>"+
			"	<div class='sk-circle8 sk-circle'></div>"+
			"	<div class='sk-circle9 sk-circle'></div>"+
			"	<div class='sk-circle10 sk-circle'></div>"+
			"	<div class='sk-circle11 sk-circle'></div>"+
			"	<div class='sk-circle12 sk-circle'></div>"+
			"</div>"
	};
	/**
	 * 判断非空
	 * 
	 * @param val
	 * @returns {Boolean}
	 */
	function isEmpty(val) {
		val = $.trim(val);
		if (val == null)
			return true;
		if (val == undefined || val == 'undefined')
			return true;
		if (val == "")
			return true;
		if (val.length == 0)
			return true;
		if (!/[^(^\s*)|(\s*$)]/.test(val))
			return true;
		return false;
	}
})(jQuery);
