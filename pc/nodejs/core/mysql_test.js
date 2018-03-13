// 建立连接方式一：
// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'youyouhei',
//   database : 'graduation'
// });

// connection.connect();

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
 
// connection.end();

// 建立连接方式二（官方推荐）:
// var mysql      = require('mysql');
// // 参数可以是按照url地址的格式书写
// // var connection = mysql.createConnection('mysql://root:youyouhei@localhost/graduation?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'youyouhei',
//   database : 'graduation'
// });
 
// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }
 
//   console.log('connected as id ' + connection.threadId);
// });

// 建立连接方式三（官方推荐）：
var mysql = require('mysql');
var pool  = mysql.createPool({
  // connectionLimit : 10,//限制最大连接数，默认就是10
  host     : 'localhost',
  user     : 'root',
  password : 'youyouhei',
  database : 'graduation'
});

pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
