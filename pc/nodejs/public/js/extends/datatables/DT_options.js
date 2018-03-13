/**
 * 存放datatables公共的配置文件
 */
/*datatables中表格的二次封装*/
function __ajax_grid(s, u, c, extra) {
    var options = {
        "sAjaxSource": u,
        "aaSorting": [],
        "aoColumns": c,
        "sServerMethod": "POST",
        "bProcessing": false,
        "bServerSide": true,
        "bAutoWidth": false,
        "sPaginationType": "full_numbers",
        "bLengthChange": false,
        "bFilter": false,
        "iDisplayLength": 25,
        "bSort": false, // 排序
        "width": "100%",
        "sDom": "<'row'<'col-sm-6 col-xs-7'f>r>t<'row'<'col-sm-5 hidden-xs'i><'col-sm-7 col-xs-12 clearfix'p>>",
        "oLanguage": {
            "sProcessing": "加载中......",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "对不起，查询不到相关数据！",
            "sEmptyTable": "对不起，查询不到相关数据！",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
            "sInfoEmpty": "记录数为0",
            "sInfoFiltered": "数据表中共为 _MAX_ 条记录",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "上一页",
                "sNext": "下一页",
                "sLast": "末页"
            }
        },
        //处理返回的数据属于字符串数组的情况
        "sAjaxDataProp":function(result){
            if((typeof result.aaData).toLowerCase() == "string"){
                result.aaData = JSON.parse(result.aaData);
                return result.aaData;
            }
            return result.aaData;
        },
        // 绘画之前出现loading，需要首先引入layer插件
        "fnPreDrawCallback":function(){
            // layer.load(1,{
            //     offset:"50%",
            //     shade: false,
            //     zIndex:8888
            // });
        },
        // 绘画结束后消除loading
        "fnDrawCallback":function(setting){
            // layer.closeAll("loading");
            // // 处理表格无法显示提示框
            // $(this).find("[data-toggle='tooltip']").tooltip();
        }
    };
    if (extra != undefined && extra != null) {
        for (var k in extra) {
            options[k] = extra[k]
        }
    }
    options = $.extend({}, options, extra);
    // 将datatables发生的异常进行打印在控制台，而不是已alert框出现
    $.fn.dataTableExt.sErrMode = 'throw';
    return $(s).dataTable(options);
}
