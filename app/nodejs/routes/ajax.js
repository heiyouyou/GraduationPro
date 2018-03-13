var express = require('express');
var router = express.Router();
// 载入自定义封装的mysql的query模块
var query = require('../core/mysql_connection1');

// 登录的ajax请求验证用户
router.post('/logincheck', function (req, res, next) {
    // promise编程版：
    query('SELECT account,password,type from l_user WHERE account = ? AND password = ?', req.body).then(function (results) {
        if (results.length == 0) {
            res.json({ 'code': 110, 'message': '用户名或者密码错误' });
        } else {
            // 登录用户成功的数据进行session存储，注意：session是绑定在req对象下的，以key-value的形式存储值
            req.session.user = JSON.stringify(results[0]);
            // 返回数据给前端
            res.json({ 'code': 200, 'message': '登录成功' });
        }
    }).catch(function (error) {
        console.log(error.message);
    });
});

// 个人详情信息
router.get('/person', function (req, res, next) {
    let user = JSON.parse(req.session.user);
    // 查询SQL
    var sql = `SELECT u.id,u.account,u.name,u.sex,u.idcard,u.type,u.academy,u.major,u.tel,u.email,u.head_pic,u.grade,c.points FROM l_user u LEFT JOIN l_credit_points c on u.account = c.uid WHERE u.account=?`;
    query(sql, [user.account]).then(function (results) {
        res.json({ code: 200, data: results[0] });
    }).catch(function (error) {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 个人详情信息编辑
router.post('/person/edit', function (req, res, next) {
    let account = JSON.parse(req.session.user).account;
    let sex = req.body.sex;
    let major = req.body.major;
    let grade = req.body.grade;
    let academy = req.body.academy;
    let tel = req.body.tel;
    let email = req.body.email;
    let idcard = req.body.idcard;
    // SQL语句
    let sql = `UPDATE l_user set sex=?,major=?,grade=?,academy=?,tel=?,email=?,idcard=? WHERE account=?`;
    query(sql, [sex, major, grade, academy, tel, email, idcard, account]).then(results => {
        res.json({ code: 200, message: "修改成功！" });
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 设备列表
router.post('/device/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.start * 1 || 0;
    var page_length = req.body.length * 1 || 5;
    var keywords = req.body.keywords;
    var where_condition = '';
    // 针对设备名和设备简介模糊查询
    where_condition = keywords ? `WHERE name LIKE "%${keywords}%" OR synopsis LIKE "%${keywords}%"` : '';
    // 查询SQL
    var sql = `SELECT name,synopsis,specification,type,photo,COUNT(1) AS total,sum(status=0) AS last,sum(status=1) AS loan FROM l_equipment ${where_condition} GROUP BY name ORDER BY intime DESC limit ?,?`;
    query(sql, [page_start, page_length]).then(results => {
        res.json({ code: 200, data: results });
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 预约操作
router.get('/reservation/add', function (req, res, next) {
    let account = JSON.parse(req.session.user).account;
    // 添加预约SQL语句
    let sql = `INSERT INTO l_borrow (eqid,uid) VALUES((SELECT id FROM l_equipment WHERE name=? AND status = 0 LIMIT 0,1),?)`;
    query(sql, [req.query.name, account]).then(results => {
        let sql = `UPDATE l_equipment set status=2 WHERE id = (SELECT eqid FROM l_borrow e WHERE e.id=?)`;
        query(sql, [results.insertId]);
        res.json({ code: 200, message: "预约申请已发出！" });
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 公告信息
router.get('/notice/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.query.start * 1 || 0;
    var page_length = req.query.length * 1 || 5;
    // 查询SQL
    var sql = `SELECT id,title,content,DATE_FORMAT(time,"%Y/%m/%d %H:%i:%s") AS time FROM l_notice ORDER BY time DESC limit ?,?`;
    query(sql, [page_start, page_length]).then(results => {
        res.json({ code: 200, data: results });
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 个人预约列表
router.get('/reservation/list', function (req, res, next) {
    let account = JSON.parse(req.session.user).account;
    let sql = `SELECT b.id,b.eqid,b.status,IF(DATE_FORMAT(b.outtime,"%Y/%m/%d %H:%i:%s")='0000/00/00 00:00:00','',DATE_FORMAT(b.outtime,"%Y/%m/%d %H:%i:%s")) AS outtime,IF(DATE_FORMAT(b.backtime,"%Y/%m/%d %H:%i:%s")='0000/00/00 00:00:00','',DATE_FORMAT(b.backtime,"%Y/%m/%d %H:%i:%s")) AS backtime,IF(DATE_FORMAT(b.endtime,"%Y/%m/%d %H:%i:%s")='0000/00/00 00:00:00','',DATE_FORMAT(b.endtime,"%Y/%m/%d %H:%i:%s")) AS endtime,b.backstatus,e.name,e.academy,e.photo FROM l_borrow b LEFT JOIN l_equipment e ON b.eqid = e.id WHERE b.uid=? ORDER BY b.id DESC`;
    query(sql, [account]).then(results => {
        res.json({ code: 200, data: results });
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 预约列表数据取消
router.get('/reservation/delete', function (req, res, next) {
    let sql = `DELETE FROM l_borrow WHERE id=?`;
    query(sql, [req.query.id]).then(results => {
        // 同步更改设备的状态
        let sql = 'UPDATE l_equipment set status=0 WHERE id=?';
        query(sql,[req.query.eqid]);
        res.json({ code: 200, message:"删除成功！"});
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 预约列表数据归还
router.get('/reservation/back', function (req, res, next) {
    let sql = `UPDATE l_borrow SET backtime=? WHERE id=?`;
    query(sql, [req.query.backtime,req.query.id]).then(results => {
        res.json({ code: 200, message:"归还申请已发出！"});
    }).catch(error => {
        console.log(error.message);
        res.send({ code: 500, message: "服务器异常！" });
    });
});



module.exports = router;