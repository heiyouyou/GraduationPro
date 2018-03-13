var express = require('express');
var router = express.Router();

/*登录页面*/
router.get('/login',function(req,res,next) {
  // 当访问登录页时，也进行用户数据清除
  req.session.user&&delete req.session.user;
  res.render('login',{layout:false});
});

/*设备管理页面*/
router.get('/device',function(req,res,next){
  // 注意：不能够在这里的单个页面的逻辑，将用户数据绑定在res.locals上，这样只会在当前页面拿到数据，其他页面拿不到
  // var param = JSON.parse(req.session.user);
  // res.locals.user = param;
  res.render('equipment-manage');
});

/*借用管理页面*/
router.get('/borrow',function(req,res,next){
  res.render('borrow-manage');
});

/*信用管理页面*/
router.get('/points',function(req,res,next){
  res.render('points-manage');
});

/*公告管理页面*/
router.get('/notice',function(req,res,next){
  res.render('notice-manage');
});

/*用户管理页面*/
router.get('/user',function(req,res,next){
  res.render('user-manage');
});
module.exports = router;
