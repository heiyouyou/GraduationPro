$(function () {
	global.wzy.equip_table = {
		// 初始化
		init() {
			this.data();
			this.common();
			this.add();
			this.delete();
			this.search();
			this.update();
		},
		common() {
			const that = this;
			// 侧边栏导航菜单定位样式
			$(".icon-bg.bg-danger").addClass("active");
			// 日历选择器的应用
			getLaydate({
				choice: "#add-equip-intime"
			});
			// 该处的时间区间选择支持原生的双向同步时间，姑不能够使用自定义的getLaydate()绑定时间
			var start = {
				elem: '#equip-start-time',
				format: 'YYYY/MM/DD hh:mm:ss',
				max: '2099-06-16 23:59:59', //最大日期
				istime: true,
				istoday: false,
				choose: function (datas) {
					end.min = datas; //开始日选好后，重置结束日的最小日期
					end.start = datas //将结束日的初始值设定为开始日
				}
			};
			var end = {
				elem: '#equip-last-time',
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
			getLaydate({
				choice: "#edit-equip-intime"
			});
			// 添加设备表单模态框消失重置添加表单的数据
			$('#addEquipModal').on("hidden.bs.modal", () => {
				$('#addEquipForm')[0].reset();
			});
			// 修改设备表单模态框消失重置修改表单的数据
			$('#editEquipModal').on("hidden.bs.modal", () => {
				$('#editEquipForm')[0].reset();
			});
		},
		// 设备的字段信息
		columns: [
			{
				"mData": "id",
				"sTitle": "设备编号",
				"sClass": "tli",
				"mRender": function (data, type, row) {
					return `<img class="img-circle" width="20" height="20" src="${row.photo}">${data}`;
				}
			},
			{
				"mData": "name",
				"sTitle": "设备名称",
				"sClass": "tli",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "type",
				"sTitle": "设备类型",
				"mRender": function (data, type, row) {
					if (data == '001') return "三星";
					if (data == '002') return "华为";
					if (data == '003') return "LG";
					if (data == '004') return "胜利";
					if (data == '005') return "长城";
				}
			},
			{
				"mData": "price",
				"sTitle": "设备单价",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "specification",
				"sTitle": "设备规格",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "academy",
				"sTitle": "所属实验室",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "synopsis",
				"sTitle": "设备简介",
				"sClass": "thidden250",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "intime",
				"sTitle": "入库时间",
				"bSortable": true,
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "life",
				"sTitle": "使用年限",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "status",
				"sTitle": "设备状态",
				"mRender": function (data, type, row) {
					if (data == 0) return "<span class='label label-success'>在库</span>";
					if (data == 1) return "<span class='label label-primary'>借出</span>";
					if (data == 2) return "<span class='label label-info'>预约</span>";
					if (data == 3) return "<span class='label label-danger'>损坏</span>";
				}
			},
			{
				"mData": null,
				"sTitle": "操作",
				"mRender": function (data, type, row) {
					return `<a class='mr5 edit-btn' href='javascript:void(0);' data-toggle='modal' data-target='#editEquipModal'>编辑</a><a class='delete-btn' href='javascript:void(0)'; data-id='${row.id}'>删除</a>`;
				}
			}
		],
		// 查询参数
		search_data: {},
		// datatables实例
		dt: null,
		// 设备信息表
		data() {
			var that = this;
			that.dt = __ajax_grid("#equipment_table", "device/list", this.columns, {
				"fnServerParams": function (aoData) {
					$.each(that.search_data, function (k, v) {
						aoData.push({ "name": k, "value": v });
					});
				},
				"iDisplayLength": 4
				// "bServerSide":false,//注意要将这个设置成true，开启服务器模式，服务端才能接受参数，默认就是true
			});
			// 定时刷新表格数据
			setInterval(function(){
				that.dt.fnDraw(false);
			},5000);
		},
		// 设备添加
		add() {
			var that = this;
			$("#add-equip-btn").on("click", function () {
				// 注意：传入的表单对象为原生的表单DOM，这可以获取该表单中具有name属性的所有控件数据FormData对象
				var formData = new FormData($("#addEquipForm")[0]);
				$.ajax({
					url: "device/add",
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
						$('#addEquipModal').modal('hide');
					}
				})
			});
		},
		// 设备删除
		delete() {
			var that = this;
			$(document).on("click", ".delete-btn", function () {
				// 获取当前需要删除的设备id
				var id = $(this).data("id");
				// 也可以这样获取datatables实例对象中的一条对象数据
				// var data = that.dt.fnGetData($(this).parents("tr")[0]);
				// console.log(ids.id+"=="+id);
				confirm({
					content: '是否删除该设备',
					title: "删除",
					btn: ['删除', '取消'],
					success: function () {
						$.ajax({
							url: "device/delete",
							data: { id: id },
							success: function (data) {
								if (data.code == 200) {
									layer.msg(data.message, { icon: 1, time: 500 });
									that.dt.fnPageChange(0);
								} else {
									layer.msg(data.message, { icon: 2, time: 500 });
								};
							}
						});
					}
				});
			});
		},
		// 设备查询
		search() {
			var that = this;
			$("#search-equip-btn").on("click", () => {
				// 获取查询表单中所有含有name属性的控件查询参数，以json的形式返回
				var formData = getFormValue($("#search-form")[0]);
				// 查询参数获取
				that.search_data['id'] = formData.id.value;
				that.search_data['academy'] = formData.academy.value;
				that.search_data['start_time'] = formData['start-time'].value;
				that.search_data['last_time'] = formData['last-time'].value;
				that.search_data['life'] = formData.life.value;
				that.search_data['name'] = formData.name.value;
				that.search_data['status'] = formData.status.value;
				that.search_data['type'] = formData.type.value;
				that.dt.fnPageChange(0);
			});
		},
		// 设备编辑
		update() {
			var that = this;
			// 获取对应要编辑设备的数据
			$(document).on("click", ".edit-btn", function () {
				let row_data = that.dt.fnGetData($(this).parents("tr")[0]);
				let id = row_data.id;
				let academy = row_data.academy;
				let intime = row_data.intime;
				let life = row_data.life;
				let name = row_data.name;
				let photo = row_data.photo;
				let price = row_data.price;
				let specification = row_data.specification;
				let status = row_data.status;
				let synopsis = row_data.synopsis;
				let type = row_data.type;
				$("#edit-equip-id").val(id);
				$("#edit-equip-name").val(name);
				$("#edit-equip-specification").val(specification);
				$("#edit-equip-price").val(price);
				$("#edit-equip-type").val(type);
				$("#edit-equip-life").val(life);
				$("#edit-equip-status").val(status);
				$("#edit-equip-intime").val(intime);
				$("#edit-equip-academy").val(academy);
				$("#edit-equip-synopsis").val(synopsis);
			});
			// 修改请求操作
			$("#edit-equip-btn").on("click", () => {
				// 获取修改后的编辑表单数据
				var formData = new FormData($("#editEquipForm")[0]);
				$.ajax({
					url: "device/update",
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
						$('#editEquipModal').modal('hide');
					}
				});
			});
		}
	};
	global.wzy.equip_table.init();
});