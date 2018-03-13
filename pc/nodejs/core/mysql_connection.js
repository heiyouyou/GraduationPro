// 载入mysql模块
var mysql = require("mysql");
// 配置参数与数据库连接的一致
var options = {
	host:"localhost",//主机名
	// port:3306,//端口号//默认就是3306
	user:"root",//数据库用户名
	password:"youyouhei",//数据库密码
	database:"graduation"//数据库名
}
// 创建连接，方式一：
// var connection = mysql.createConnection(options);
// function query(sql,params,callback){
// 	connection.connect(function(err){
// 		if(err){
// 			console.log(err.message);
// 		}else{
// 			//query(sqlString,paramsArr,callback)参数： 1.sql语句，2.参数配置，3.回调函数
// 			// Object.keys(params).map(x=>params[x])相当于Object.keys(params).map(function(x){map返回一个新数组
// 			// 	return params[x];//x为params对象中的key值
// 			// });
// 			// params只能是数组或者一个值,Object.keys(params)返回的是一个key数组
			// // 判断传过来的参数是数组还是json对象，是对象就进行格式化成数组
			// params = Array.isArray(params)?params:Object.keys(params).map(x=>params[x]);
// 			connection.query(sql,params,function(err,result){
// 				if(err){
// 					console.log(err.message);
// 				}else{
// 					// console.log(result);
// 					if(callback)callback.call(this,result);
// 					connection.end();//连接终止
// 				}
// 			});
// 		}
// 	});
// };

// 创建连接池，方式二：
var pool = mysql.createPool(options);
// 封装查询语句
function query(sql,params,callback){
		//连接池获取连接 
		pool.getConnection(function(err,connection){
			if(err){
				console.log(err.message);
			}else{
				console.log('mysql数据库连接成功...');
				// 判断传过来的参数是数组还是json对象，是对象就进行格式化成数组
				params = Array.isArray(params)?params:Object.keys(params).map(x=>params[x]);
				console.log(params);
				// 调用query方法进行SQL操作
				var query = connection.query(sql,params,function(err,results,fields){
					if(err){
						console.log(err.message);
						callback&&callback.call(this,err.message);
					}else{
						callback&&callback.call(this,results);
						// pool.end();//注意连接池，不用手动关闭，它有一个自动关闭和开启的时间,而且这样子关闭的所有连接
						connection.release();//可以调用release()方法释放当次连接回到连接池，以便下个使用
					}
				});
				// console.log(query.sql);//获取格式化后的sql语句
			}
		});
};
// 模块导出
module.exports = query;
