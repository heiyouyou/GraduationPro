var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

// 自定义模块导入
var tag = require('./core/tag');
var config = require('./config/config');

var index = require('./routes/index');
var ajax = require('./routes/ajax');

// handlebars模块
var handlebars = require('express3-handlebars').create({
  //layoutsDir:'views/myLayouts/',//layoutDir可以更改视图默认模板文件的默认目录layouts
  //partialsDir: 'views/partials/',//partialsDir可以更改局部文件的默认目录partials
  defaultLayout: 'layout',
  extname: 'html',//可以设置视图文件的扩展名
  helpers: tag//helpers属性可以通过对象将自定义的方法集成到handlebars中使用
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', handlebars.engine);
app.set('view engine', 'html');
//禁止浏览器响应头的相关技术特征显示
app.disable('x-powered-by');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// 设置limit属性可以控制请求数据的大小限制,当请求主体的数据过大就可以进行更改这个设置
// 控制最大请求主体大小。如果这是一个数字，那么该值指定字节数; 如果是字符串，则将值传递到字节库进行解析。 默认为'100kb'。
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 允许指定域名进行跨域请求数据
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
};
app.use(allowCrossDomain);


// session中间件的注册，注意session的配置要先于路由注册
/*
    name：表示cookie的name，默认cookie的name是：session.sig。
    secret：用来对session数据进行加密的字符串(随意指定).这个属性值为必须指定的属性。
    maxAge：cookie过期时间，单位毫秒。
*/
app.use(cookieSession({
  name: 'userdata',
  secret: '1234567890ABCEDFJHIJKLQWERTYZabcdefg',
  maxAge: 2 * 60 * 60 * 1000 // 2 hours
}));

// 针对访问请求的进行用户数据拦截判断是否进行了登录，如果没有则进行重定向到登录界面
app.use(function (req, res, next) {
  var param = req.session.user;
  console.log("1" + param);
  // 排除登录页面的判断
  if (req.url.indexOf('login') == -1) {
    if (!param) {
      console.log("2用户数据不存在");
      // 判断是ajax请求还是页面请求，从而通过不同方式进行跳转到登录页面
      if (req.xhr) {
        res.send({ code: 304, message: "logout" });
      } else {
        res.redirect('login');
      }
      return;
    }
  };
  console.log("3执行到了");
  res.locals.user = param ? JSON.parse(param) : {};
  next();
});

// 网站的一些配置信息注册
app.use(function (req, res, next) {
  if (!res.locals.config) res.locals.config = config;
  next();
});
// 路由注册 
app.use('/wzy/lab', index);
// ajax请求注册
app.use('/wzy/lab', ajax);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//服务器出错
app.use(function (req, res, next) {
  var err = new Error('服务器错误了...');
  err.status = 500;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  //将错误信息打印到本地日志文件
  fs.appendFileSync(__dirname + '/error.log', tag.formatDate(Date.now()) + '\n' + err.status + '\n' + err.message + '\n' + err.stack + '\n');
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
