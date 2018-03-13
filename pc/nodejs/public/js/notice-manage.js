$(function () {
	global.wzy.notice_table = {
		// 初始化
		init: function () {
			this.data();
			this.search();
			this.add();
			this.delete();
			this.update();
			this.common();
		},
		// 设备的字段信息
		columns: [
			{
				"mData": "title",
				"sTitle": "公告标题",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "content",
				"sTitle": "公告内容",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "time",
				"sTitle": "发布时间",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": null,
				"sTitle": "操作",
				"mRender": function (data, type, row) {
					return `<a class='mr5 edit-btn' href='javascript:void(0);' data-toggle='modal' data-target='#editNoticeModal'>编辑</a><a class='delete-btn' href='javascript:void(0);' data-id=${row.id}>删除</a>`;
				}
			}
		],
		dt: null,
		search_data: {},
		// 设备信息表
		data() {
			const that = this;
			that.dt = __ajax_grid("#notice_table", "notice/list", this.columns, {
				"fnServerParams": function (aoData) {
					$.each(that.search_data, function (k, v) {
						aoData.push({ "name": k, "value": v });
					});
				}
			});
		},
		// 删除
		delete() {
			const that = this;
			$(document).on("click", ".delete-btn", function () {
				let id = $(this).data("id");
				confirm({
					content: '是否删除该公告',
					title: "删除",
					btn: ['删除', '取消'],
					success: function () {
						$.ajax({
							url: "notice/delete/" + id,
							success(data) {
								if (data.code == 200) {
									layer.msg(data.message, { icon: 1, time: 800 });
									that.dt.fnPageChange(0);
								} else {
									layer.msg(data.message, { icon: 2, time: 800 });
								}
							}
						});
					}
				});
			});
		},
		// 查询
		search() {
			const that = this;
			$("#search-notice-btn").on("click", () => {
				// 获取查询表单中所有含有name属性的控件查询参数，以json的形式返回
				var formData = getFormValue($("#notice-search-form")[0]);
				// 查询参数获取
				that.search_data['title'] = formData.title.value;
				that.search_data['content'] = formData.content.value;
				that.search_data['start'] = formData.start.value;
				that.search_data['last'] = formData.last.value;
				// 进行表格查询操作
				this.dt.fnPageChange(0);
			});
		},
		// 添加
		add() {
			const that = this;
			$("#add-notice-btn").on("click", () => {
				// 注意：传入的表单对象为原生的表单DOM，这可以获取该表单中具有name属性的所有控件数据FormData对象
				var formData = new FormData($("#addNoticeForm")[0]);
				$.ajax({
					url: "notice/add",
					type: "post",
					data: formData,//将表单数据对象作为参数传递
					processData: false,//因为data值是FormData对象，不需要对数据做处理
					contentType: false,//设置为false，因为是由<form>表单构造的FormData对象，且已经声明了属性enctype="multipart/form-data"，所以这里设置为false。
					success(data) {
						redirect(data.code);
						console.log(data);
						if (data.code == 200) {
							layer.msg(data.message, { icon: 1, time: 800 });
							// 表格重新绘制第一页的数据
							that.dt.fnPageChange(0);
						} else {
							layer.msg(data.message, { icon: 2, time: 800 });
						};
						$('#addNoticeModal').modal('hide');
						// 清空表单数据
						$("#addNoticeForm")[0].reset();
					}
				})
			});
		},
		// 编辑
		update() {
			const that = this;
			// 获取对应要编辑的数据
			$(document).on("click", ".edit-btn", function () {
				let row_data = that.dt.fnGetData($(this).parents("tr")[0]);
				let id = row_data.id;
				let title = row_data.title;
				let content = row_data.content;
				let time = row_data.time;
				$("#edit-notice-time").val(time);
				$("#edit-notice-content").val(content);
				$("#edit-notice-title").val(title);
				$("#edit-notice-id").val(id);
			});
			// 修改请求操作
			$("#edit-notice-btn").on("click", () => {
				// 获取修改后的编辑表单数据
				var formData = new FormData($("#editNoticeForm")[0]);
				$.ajax({
					url: "notice/update",
					type: "post",
					data: formData,//将表单数据对象作为参数传递
					processData: false,//因为data值是FormData对象，不需要对数据做处理
					contentType: false,//设置为false，因为是由<form>表单构造的FormData对象，且已经声明了属性enctype="multipart/form-data"，所以这里设置为false。
					success(data) {
						redirect(data.code);
						console.log(data);
						if (data.code == 200) {
							layer.msg(data.message, { icon: 1, time: 500 });
							// 表格重新绘制第一页的数据
							that.dt.fnPageChange(0);
						} else {
							layer.msg(data.message, { icon: 2, time: 500 });
						};
						$('#editNoticeModal').modal('hide');
					}
				});
			});
		},
		common() {
			$(".icon-bg.bg-default").addClass("active");
			$("#collapseThree").addClass("in");
			$("#headingThree").find(".icon-down").addClass("rotate");
			// 查询的起止时间配置
			let start = {
				elem: '#notice-start-time',
				format: 'YYYY/MM/DD hh:mm:ss',
				max: '2099-06-16 23:59:59', //最大日期
				istime: true,
				istoday: false,
				choose: function (datas) {
					end.min = datas; //开始日选好后，重置结束日的最小日期
					end.start = datas //将结束日的初始值设定为开始日
				}
			};
			let end = {
				elem: '#notice-last-time',
				format: 'YYYY/MM/DD hh:mm:ss',
				max: '2099-06-16 23:59:59',
				istime: true,
				istoday: false,
				choose: function (datas) {
					start.max = datas; //结束日选好后，重置开始日的最大日期
				}
			};
			laydate(start);
			laydate(end);
			// 日历选择器的应用
			getLaydate({
				choice: "#edit-notice-time"
			});
		}
	};
	global.wzy.notice_table.init();
});