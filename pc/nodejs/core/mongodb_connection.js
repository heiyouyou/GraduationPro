// 载入mongoose数据库组件模块
var mongoose = require('mongoose');
// 连接本地数据库：mongoose.connect('mongodb://ip:端口/数据库名')
mongoose.connect('mongodb://localhost:27017/nodejs');
//创建一个连接对象
var db = mongoose.connection;
// 监听连接成功或者失败
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("数据库连接成功...");
});
module.exports = mongoose;