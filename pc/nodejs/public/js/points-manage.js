$(function(){
    global.wzy.points_table = {
		// 初始化
		init:function(){
			this.data();
			this.search();
			this.update();
			this.common();
		},
		// 信用积分的字段信息
		columns:[
	        {
	            "mData": "uid",
	            "sTitle": "用户编号",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
			{
	            "mData": "name",
	            "sTitle": "用户姓名",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": "overduetime",
	            "sTitle": "逾期次数",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": "points",
	            "sTitle": "信用积分",
	            "mRender": function(data, type, row) {
	             	return data;
	            }
	        },
	        {
	            "mData": null,
	            "sTitle": "操作",
	            "mRender": function(data, type, row) {
	             	return `<a class='mr5 edit-btn' href='javascript:void(0);' data-toggle='modal' data-target='#editPointsModal' data-id=${row.id}>编辑</a>`;
	            }
	        }
	    ],
		dt:null,
		search_data:{},
		// 信用积分信息表
	    data:function(){
			const that = this;
	    	that.dt = __ajax_grid("#points_table","points/list",this.columns,{
	    		"fnServerParams": function(aoData) {
	                $.each(that.search_data, function(k, v) {
	                    aoData.push({ "name": k, "value": v });
	                });
	            }
	    	});
	    },
		// 查询
		search(){
			const that = this;
			$("#search-btn").on("click", () => {
				// 获取查询表单中所有含有name属性的控件查询参数，以json的形式返回
				var formData = getFormValue($("#points-form")[0]);
				// 查询参数获取
				that.search_data['uid'] = formData.uid.value;
				that.search_data['overduetime'] = formData.overduetime.value;
				that.search_data['start'] = formData.start.value;
				that.search_data['last'] = formData.last.value;
				// 进行表格查询操作
				that.dt.fnPageChange(0);
			});
		},
		// 修改
		update(){
			const that = this;
			// 获取对应要编辑的数据
			$(document).on("click", ".edit-btn", function () {
				let row_data = that.dt.fnGetData($(this).parents("tr")[0]);
				let overduetime = row_data.overduetime;
				let points = row_data.points;
				let id = row_data.id;
				$("#edit-points-overduetime").val(overduetime);
				$("#edit-points").val(points);
				$("#edit-points-id").val(id);
			});
			// 修改请求操作
			$("#edit-borrow-btn").on("click", () => {
				let overduetime = $("#edit-points-overduetime").val();
				let points = $("#edit-points").val();
				let id = $("#edit-points-id").val();
				$.ajax({
					url: "points/update",
					type: "post",
					data: {points:points,overduetime:overduetime,id:id},
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
						$('#editPointsModal').modal('hide');
					}
				});
			});
		},
		common:function(){
			$(".icon-bg.bg-info").addClass("active");
		}
	};
	global.wzy.points_table.init();
});