$(function(){
    global.wzy.borrow_table = {
		// 初始化
		init:function(){
			this.data();
			this.search();
			this.update();
			this.common();
		},
		// 借用的字段信息
		columns:[
			{
	            "mData": "eqid",
	            "sTitle": "设备编号",
	            "mRender": function(data, type, row) {
	                return data;
	            }
	        },
	        {
	            "mData": "uid",
	            "sTitle": "用户编号",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": "outtime",
	            "sTitle": "借出时间",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": "endtime",
	            "sTitle": "到期时间",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": "backtime",
	            "sTitle": "归还时间",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
			 {
	            "mData": "backstatus",
	            "sTitle": "归还状态",
	            "mRender": function(data, type, row) {
	             	if(data==0)return "<span class='label label-danger'>未归还</span>";
	             	if(data==1)return "<span class='label label-success'>已归还</span>";
	            }
	        },
	        {
	            "mData": "status",
	            "sTitle": "审批状态",
	            "mRender": function(data, type, row) {
	             	if(data==1)return "<span class='label label-danger'>未审批</span>";
	             	if(data==2)return "<span class='label label-success'>已审批</span>";
	            }
	        },
	        {
	            "mData": "isoverdue",
	            "sTitle": "逾期状态",
	            "mRender": function(data, type, row) {
                    if(data==1)return "<span class='label label-success'>未过期</span>";
                    if(data==2)return "<span class='label label-danger'>已过期</span>";
	            }
	        },
	        {
	            "mData": "money",
	            "sTitle": "罚款数目",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": null,
	            "sTitle": "操作",
	            "mRender": function(data, type, row) {
	             	return `<a class='mr5 edit-btn' href='javascript:void(0);' data-toggle='modal' data-target='#editBorrowModal' data-id=${row.id}>编辑</a>`;
	            }
	        }
	    ],
		dt:null,
		search_data:{},
		// 借用信息表
	    data:function(){
			const that = this;
	    	that.dt = __ajax_grid("#borrow_table","borrow/list",that.columns,{
	    		"fnServerParams": function(aoData) {
	                $.each(that.search_data, function(k, v) {
	                    aoData.push({ "name": k, "value": v });
	                });
	            },
            	"iDisplayLength":4
	    	});
			// 定时刷新表格数据
			setInterval(function(){
				that.dt.fnDraw(false);
			},5000);
	    },
		// 查找
		search() {
			const that = this;
			$("#search-btn").on("click", () => {
				// 获取查询表单中所有含有name属性的控件查询参数，以json的形式返回
				var formData = getFormValue($("#borrow-form")[0]);
				// 查询参数获取
				that.search_data['eqid'] = formData.eqid.value;
				that.search_data['uid'] = formData.uid.value;
				that.search_data['account'] = formData.account.value;
				that.search_data['outtime'] = formData.outtime.value;
				that.search_data['endtime'] = formData.endtime.value;
				that.search_data['backtime'] = formData.backtime.value;
				that.search_data['status'] = formData.status.value;
				that.search_data['isoverdue'] = formData.isoverdue.value;
				// 进行表格查询操作
				that.dt.fnPageChange(0);
			});
		},
		// 更新
		update() {
			var that = this;
			// 获取对应要编辑的数据
			$(document).on("click", ".edit-btn", function () {
				let row_data = that.dt.fnGetData($(this).parents("tr")[0]);
				let id = row_data.id;
				let eqid = row_data.eqid;
				let outtime = row_data.outtime;
				let endtime = row_data.endtime;
				let backtime = row_data.backtime;
				let status = row_data.status;
				let isoverdue = row_data.isoverdue;
				let money = row_data.money;
				let backstatus = row_data.backstatus;
				$("#edit-borrow-id").val(id);
				$("#edit-borrow-eqid").val(eqid);
				$("#edit-borrow-outtime").val(outtime);
				$("#edit-borrow-endtime").val(endtime);
				$("#edit-borrow-backtime").val(backtime);
				$("#edit-borrow-status").val(status);
				$("#edit-borrow-isoverdue").val(isoverdue);
				$("#edit-borrow-money").val(money);
				$("#edit-borrow-backstatus").val(backstatus);
			});
			// 修改请求操作
			$("#edit-borrow-btn").on("click", () => {
				let id = $("#edit-borrow-id").val();
				let eqid = $("#edit-borrow-eqid").val();
				let outtime = $("#edit-borrow-outtime").val();
				let endtime = $("#edit-borrow-endtime").val();
				let backtime = $("#edit-borrow-backtime").val();
				let status = $("#edit-borrow-status").val();
				let isoverdue = $("#edit-borrow-isoverdue").val();
				let money = $("#edit-borrow-money").val();
				let backstatus = $("#edit-borrow-backstatus").val();
				let data = {
					id:id,
					eqid:eqid,
					outtime:outtime,
					endtime:endtime,
					backtime:backtime,
					status:status,
					backstatus:backstatus,
					// isoverdue:isoverdue,
					money:money
				}
				$.ajax({
					url: "borrow/update",
					type: "post",
					data:data,
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
						$('#editBorrowModal').modal('hide');
					}
				});
			});
		},
		common:function(){
			$(".icon-bg.bg-success").addClass("active");
			// 查询的日期选择
			getLaydate({
				choice:"#search-equip-outtime",
				istime:false,
				format:'YYYY/MM/DD'
			});
			getLaydate({
				choice:"#search-equip-endtime",
				istime:false,
				format:'YYYY/MM/DD'
			});
			getLaydate({
				choice:"#search-equip-backtime",
				istime:false,
				format:'YYYY/MM/DD'
			});
			// 编辑的日期选择
			getLaydate({
				choice:"#edit-borrow-outtime"
			});
			getLaydate({
				choice:"#edit-borrow-endtime"
			});
			getLaydate({
				choice:"#edit-borrow-backtime"
			});
		}
	};
	global.wzy.borrow_table.init();
});