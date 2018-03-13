// 定义该项目的一个全局变量，方便后期维护与团队合作
// 注意该文件必须先于其他自己写的业务逻辑js文件引入
// 次common文件用于存放项目的公共逻辑模块与公共的方法
const global = {
	wzy: {}
}

$(function () {
	// 项目公共模块对象
	global.wzy.common = {
		init: function () {
			this.left_menu();
			this.logout();
		},
		// 左侧菜单收缩功能与url跳转功能
		left_menu: function () {
			/*left-menu start*/
			var openClick = true;
			$("#click-menu-btn").on("click", function () {
				if (openClick) {
					$(this).css({ transform: "rotate(-90deg)" });
					$(".left-menu").addClass("left-menu-hl").removeClass("left-menu-fl");
					$(".content").css("margin-left", 0);
					openClick = false;
				} else {
					$(this).css({ transform: "rotate(0)" }, 1000);
					$(".left-menu").addClass("left-menu-fl").removeClass("left-menu-hl");
					$(".content").css("margin-left", "240px");
					openClick = true;
				};
			});
			$(".panel.p_margin").on("click", function () {
				var index = $(this).index();
				$(".icon-down").eq(index).toggleClass("rotate");
				$(this).siblings().find(".panel.p_margin .icon-down").removeClass("rotate");
				$(".left-menu .panel.p_margin .wave-layer").eq(index).css({ opacity: 1, visibility: "visible", transform: "scaleX(1)" });
				setTimeout(function () {
					$(".left-menu .panel.p_margin .wave-layer").eq(index).css({ opacity: 0, visibility: "hidden", transform: "scaleX(0)" })
				}, 500);
			});

			// url跳转
			// 数组定义多个url地址
			let url = ["device", "borrow", "points"];
			$(".js-url").on("click", function () {
				// 获取当前点击的a链接在集合中的索引位置
				let index = $(".collapsed").index($(this));
				// url跳转
				window.location.href = url[index];
			});
		},
		// 登出系统逻辑
		logout: function () {
			$("#logout").on("click", function () {
				confirm({
					title: "退出",
					success: function () {
						window.location.href = 'logout';
					}
				});
			});
		}
	};
	global.wzy.common.init();
});
// 询问框的封装
// opts.content:标题内容
// opts.title:标题
// opts.btn:取消和正确按钮的文本，数组格式
// opts.success:确认的回调函数
// opts.cancel:取消的回调函数
// opts.icon:询问框的图标
function confirm(opts) {
	layer.confirm(opts.content || "是否退出系统", {
		title: opts.title || "信息",
		icon: opts.icon || 3,
		btn: opts.btn || ["退出", "取消"]
	}, opts.success || null, opts.cancel || null);
};

// 针对ajax请求，用户session过期时，重新跳转到登录页
function redirect(code) {
	if (code == 304) {
		window.location.href = 'logout';
		return;
	}
}
