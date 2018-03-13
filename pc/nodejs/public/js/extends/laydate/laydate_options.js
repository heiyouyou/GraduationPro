/**
* author：wzy
* date：2017-3-29 15:21
* description：laydate日历插件常用配置封装
**/
function getLaydate(opts){
	laydate.skin("danlan");  //加载皮肤，参数lib为皮肤名 
	laydate({
		elem: opts.choice, //需显示日期的元素选择器
		event: opts.event||'click', //触发事件
		format: opts.format||'YYYY/MM/DD hh:mm:ss', //日期格式
		istime: (opts.istime!=undefined?opts.istime:true), //是否开启时间选择
		isclear: (opts.isclear!=undefined?opts.isclear:true), //是否显示清空
		istoday: (opts.istoday!=undefined?opts.istoday:true), //是否显示今天
		issure: (opts.issure!=undefined?opts.issure:true), //是否显示确认
		festival: (opts.festiva!=undefined?opts.festival:false), //是否显示节日
		min: opts.min||'1900-01-01 00:00:00', //最小日期
		max: opts.max||'2099-12-31 23:59:59', //最大日期
		start: opts.start||laydate.now(),  //开始日期
		fixed: (opts.fixed!=undefined?opts.fixed:false), //是否固定在可视区域
		zIndex: opts.zIndex||99999999, //css z-index
		choose: function(dates){//选择好日期的回调
			opts.callback&&opts.callback(dates);
		}
	});
}