$(function () {
	/* 管理员 start*/
	global.wzy.manager_table = {
		// 初始化
		init() {
			this.data();
			this.add();
			this.search();
			this.delete();
			this.common();
			this.update();
		},
		common() {
			$(".icon-bg.bg-default").addClass("active");
			$("#collapseThree").addClass("in");
			$("#headingThree").find(".icon-down").addClass("rotate");
		},
		// 管理员的字段信息
		columns: [
			{
				"mData": "id",
				"sTitle": "编号",
				"mRender": function (data, type, row) {
					return `<img class="img-circle" width="20" height="20" src="${row.head_pic}">${data}`;
				}
			},
			{
				"mData": "username",
				"sTitle": "名字",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "password",
				"sTitle": "密码",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "phone",
				"sTitle": "手机号",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "type",
				"sTitle": "类型",
				"mRender": function (data, type, row) {
					if (data == 1) return "超级管理员"
					if (data == 2) return "普通管理员"
				}
			},
			{
				"mData": null,
				"sTitle": "操作",
				"mRender": function (data, type, row) {
					return `<a class='mr5 edit-btn' href='javascript:void(0);' data-toggle='modal' data-target='#editManagerModal'>编辑</a><a class='delete-manager-btn' href='javascript:void(0);' data-id=${row.id}>删除</a>`;
				}
			}
		],
		search_data: {},
		dt: null,
		// 管理员信息表
		data() {
			var that = this;
			that.dt = __ajax_grid("#manager_table", "admin/list", that.columns, {
				"fnServerParams": function (aoData) {
					$.each(that.search_data, function (k, v) {
						aoData.push({ "name": k, "value": v });
					});
				},
				"iDisplayLength": 2
			});
		},
		// 管理员添加
		add() {
			var that = this;
			$("#add-manager-btn").on("click", function () {
				// 注意：传入的表单对象为原生的表单DOM，这可以获取该表单中具有name属性的所有控件数据FormData对象
				var formData = new FormData($("#addManagerForm")[0]);
				$.ajax({
					url: "admin/add",
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
						$('#addManagerModal').modal('hide');
						// 清空表单数据
						$("#addManagerForm")[0].reset();
					}
				})
			});
		},
		// 管理员删除
		delete() {
			var that = this;
			$(document).on("click", ".delete-manager-btn", function () {
				let id = $(this).data("id");
				confirm({
					content: "是否删除该管理员",
					title: "删除",
					btn: ['删除', '取消'],
					success: function () {
						$.ajax({
							url: "admin/delete",
							data: { id: id },
							success(data) {
								if (data.code == 200) {
									layer.msg(data.message, { icon: 1 });
									that.dt.fnPageChange(0);
								} else {
									layer.msg(data.message, { icon: 2 });
								}
							}
						})
					}
				});
			});
		},
		// 管理员查询
		search() {
			var that = this;
			$("#search-manager-btn").on("click", () => {
				// 获取查询表单中所有含有name属性的控件查询参数，以json的形式返回
				var formData = getFormValue($("#manager-form")[0]);
				// 查询参数获取
				that.search_data['id'] = formData.id.value;
				that.search_data['username'] = formData.username.value;
				that.search_data['phone'] = formData.phone.value;
				that.search_data['type'] = formData.type.value;
				// 进行表格查询操作
				that.dt.fnPageChange(0);
			});
		},
		// 管理员编辑
		update() {
			var that = this;
			// 获取对应要编辑的管理员数据
			$(document).on("click", ".edit-btn", function () {
				let row_data = that.dt.fnGetData($(this).parents("tr")[0]);
				let id = row_data.id;
				let username = row_data.username;
				let head_pic = row_data.head_pic;
				let phone = row_data.phone;
				let password = row_data.password;
				let type = row_data.type;
				$("#edit-manager-id").val(id);
				$("#edit-manager-name").val(username);
				$("#edit-manager-password").val(password);
				$("#edit-manager-phone").val(phone);
				$("#edit-manager-type").val(type);
			});
			// 修改请求操作
			$("#edit-manager-btn").on("click", () => {
				// 获取修改后的编辑表单数据
				var formData = new FormData($("#editManagerForm")[0]);
				$.ajax({
					url: "admin/update",
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
						$('#editManagerModal').modal('hide');
					}
				});
			});
		}
	};
	global.wzy.manager_table.init();
	/*管理员 end*/

	/*普通用户 start*/
	global.wzy.user_table = {
		flag: true,
		// 初始化
		init() {
			// 切换到普通用户页面，才进行数据加载
			$("#user-tab").on("click", () => {
				if (this.flag) {
					this.data();
					this.add();
					this.delete();
					this.search();
					this.update();
					this.flag = false;
				}
			});
		},
		// 普通用户的字段信息
		columns: [
			{
				"mData": "id",
				"sTitle": "用户编号",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "account",
				"sTitle": "用户账号",
				"mRender": function (data, type, row) {
					return `<img class="img-circle" width="20" height="20" src="${row.head_pic}">${data}`;
				}
			},
			{
				"mData": "name",
				"sTitle": "用户名称",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "password",
				"sTitle": "密码",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "sex",
				"sTitle": "性别",
				"mRender": function (data, type, row) {
					return data == 1 ? '男' : '女';
				}
			},
			{
				"mData": "type",
				"sTitle": "用户类型",
				"mRender": function (data, type, row) {
					return data == 1 ? '学生' : '教师';;
				}
			},
			{
				"mData": "idcard",
				"sTitle": "身份证号码",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "academy",
				"sTitle": "所在院系",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "grade",
				"sTitle": "所在年级",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "major",
				"sTitle": "专业",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "tel",
				"sTitle": "手机号",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": "email",
				"sTitle": "邮箱",
				"mRender": function (data, type, row) {
					return data;
				}
			},
			{
				"mData": null,
				"sTitle": "操作",
				"mRender": function (data, type, row) {
					return `<a class='mr5 edit-btn' href='javascript:void(0);' data-toggle='modal' data-target='#editUserModal'>编辑</a><a class='delete-user-btn' href='javascript:void(0);' data-id='${row.id}' data-account='${row.account}'>删除</a>`;
				}
			}
		],
		search_data: {},
		dt: null,
		// 普通用户信息表
		data() {
			var that = this;
			that.dt = __ajax_grid("#user_table", "user/list", this.columns, {
				"fnServerParams": function (aoData) {
					$.each(that.search_data, function (k, v) {
						aoData.push({ "name": k, "value": v });
					});
				},
				"iDisplayLength": 2
			});
		},
		// 添加
		add() {
			var that = this;
			$("#add-user-btn").on("click", () => {
				// 注意：传入的表单对象为原生的表单DOM，这可以获取该表单中具有name属性的所有控件数据FormData对象
				var formData = new FormData($("#addUserForm")[0]);
				$.ajax({
					url: "user/add",
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
						$('#addUserModal').modal('hide');
						// 清空表单数据
						$("#addUserForm")[0].reset();
					}
				})
			});
		},
		// 删除
		delete() {
			var that = this;
			$(document).on("click", ".delete-user-btn", function () {
				let id = $(this).data("id");
				let account = $(this).data("account");
				confirm({
					content: "是否删除该用户",
					title: "删除",
					btn: ['删除', '取消'],
					success: function () {
						$.ajax({
							url: "user/delete",
							data: { id: id, account: account },
							success(data) {
								if (data.code == 200) {
									layer.msg(data.message, { icon: 1 });
									that.dt.fnPageChange(0);
								} else {
									layer.msg(data.message, { icon: 2 });
								}
							}
						})
					}
				});
			});
		},
		// 查询
		search() {
			const that = this;
			$("#search-user-btn").on("click", () => {
				// 获取查询表单中所有含有name属性的控件查询参数，以json的形式返回
				var formData = getFormValue($("#user-form")[0]);
				// 查询参数获取
				that.search_data['account'] = formData.account.value;
				that.search_data['name'] = formData.name.value;
				that.search_data['tel'] = formData.tel.value;
				that.search_data['type'] = formData.type.value;
				that.search_data['email'] = formData.email.value;
				that.search_data['idcard'] = formData.idcard.value;
				that.search_data['academy'] = formData.academy.value;
				that.search_data['grade'] = formData.grade.value;
				that.search_data['major'] = formData.major.value;
				that.search_data['sex'] = formData.sex.value;
				// 进行表格查询操作
				that.dt.fnPageChange(0);
			});
		},
		// 编辑
		update() {
			const that = this;
			// 获取对应要编辑的数据
			$(document).on("click", ".edit-btn", function () {
				let row_data = that.dt.fnGetData($(this).parents("tr")[0]);
				let id = row_data.id;
				let name = row_data.name;
				let account = row_data.account;
				let head_pic = row_data.head_pic;
				let password = row_data.password;
				let type = row_data.type;
				let grade = row_data.grade;
				let sex = row_data.sex;
				let major = row_data.major;
				let academy = row_data.academy;
				let idcard = row_data.idcard;
				let email = row_data.email;
				let tel = row_data.tel;
				$("#edit-user-id").val(id);
				$("#edit-user-account").val(account);
				$("#edit-user-name").val(name);
				$("#edit-user-password").val(password);
				$("#edit-user-phone").val(tel);
				$("#edit-user-type").val(type);
				$("#edit-user-grade").val(grade);
				$("#edit-user-sex").val(sex);
				$("#edit-user-major").val(major);
				$("#edit-user-academy").val(academy);
				$("#edit-user-email").val(email);
				$("#edit-user-idcard").val(idcard);
			});
			// 修改请求操作
			$("#edit-user-btn").on("click", () => {
				// 获取修改后的编辑表单数据
				var formData = new FormData($("#editUserForm")[0]);
				$.ajax({
					url: "user/update",
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
						$('#editUserModal').modal('hide');
					}
				});
			});
		}

	};
	global.wzy.user_table.init();
	/*普通用户 end*/
});