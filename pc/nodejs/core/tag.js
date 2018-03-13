/**
 * Created by wzy on 2017/1/11.
 */

module.exports = {
    //可以定义函数多个形参，而且如果最后一个不传参数，永远是一个对象
    formatDate:function(date,fmt,options){
        return new Date(date).format(fmt||'yyyy-MM-dd HH:mm:ss');
    },
    //自定义标签方法,name:标签名
    section1:function(name,options){
        console.log("========")
        console.log(this);//这里的this指调用该方法创建的标签的某一个页面对象
        if(!this._sections1)this._sections1 = {};
        this._sections1[name] = options.fn(this);
        console.log(options.fn(this))//options.fn(this)指代自定义标签里面内容
        return null;
    },
    section2:function(name,options){
        if(!this._sections2)this._sections2 = {};
        this._sections2[name] = options.fn(this);
        return null;
    },
};
/**
 * 对Date的扩展，将 Date 转化为指定格式的String 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
 * 可以用 1-2 个占位符 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) eg: (new
 * Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 (new
 * Date()).format("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04 (new
 * Date()).format("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04 (new
 * Date()).format("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04 (new
 * Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function(fmt) {
    var o = {
        "Y+" : this.getFullYear(),
        "M+" : this.getMonth() + 1,
        // 月份
        "d+" : this.getDate(),
        // 日
        "h+" : this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
        // 小时
        "H+" : this.getHours(),
        // 小时
        "m+" : this.getMinutes(),
        // 分
        "s+" : this.getSeconds(),
        // 秒
        "q+" : Math.floor((this.getMonth() + 3) / 3),
        // 季度
        "S" : this.getMilliseconds()
        // 毫秒
    };
    var week = {
        "0" : "日",
        "1" : "一",
        "2" : "二",
        "3" : "三",
        "4" : "四",
        "5" : "五",
        "6" : "六"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt
            .replace(
                RegExp.$1,
                ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f"
                    : "/u5468")
                    : "")
                + week[this.getDay() + ""]);
    }
    for ( var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};