var express = require('express');
var router = express.Router();
// 载入自定义封装的mysql的query模块
var query = require('../core/mysql_connection1');

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('index');
});

// 登录页面
router.get('/login', function(req, res, next) {
  // 当访问登录页时，也进行用户数据清除
  req.session.user&&delete req.session.user;
  res.render('login');
});

// 设备详情页面
router.get('/details', function(req, res, next) {
  var name = req.query.name;
  // 查询SQL
  var sql = `SELECT name,synopsis,specification,type,academy,photo,COUNT(1) AS total,sum(status=0) AS last,sum(status=1) AS loan FROM l_equipment WHERE name = ? GROUP BY name`;
  query(sql,[name]).then(results=>{
      res.render('details',{data: results[0]});
  }).catch(error=>{
      console.log(error.message);
      res.send({ code: 500, message: "服务器异常！" });
  });
});

// 个人信息页面
router.get('/person', function(req, res, next) {
  res.render('person');
});
// 个人信息编辑页面
router.get('/person_edit', function(req, res, next) {
  res.render('person-edit');
});

// 预约页面
router.get('/reservation', function(req, res, next) {
  res.render('reservation');
});

// 公告页面
router.get('/notice', function(req, res, next) {
  res.render('notice');
});

// 登出操作
router.get('/logout', function (req, res, next) {
    // 登出时，用户session数据清除
    delete req.session.user;
    res.redirect('login');
});

module.exports = router;
