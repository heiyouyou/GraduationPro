var express = require('express');
var router = express.Router();
// 载入处理FormData数据的中间件
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

// 载入自定义封装的mysql的query模块
var query = require('../core/mysql_connection1');
// 载入自定义封装的图片文件上传写入模块
var upload = require('../core/upload');


// 登录的ajax请求验证用户
router.post('/logincheck', function (req, res, next) {
    console.log(req.body);
    // 普通回调逻辑版：
    // query('SELECT username,password from l_admin WHERE username = ? AND password = ?', req.body ,function (results) {
    //     if (results.length == 0) {
    //         res.json({ 'code': 110, 'message': '用户名或者密码错误' });
    //     } else {
    //         // 登录用户成功的数据进行session存储，注意：session是绑定在req对象下的，以key-value的形式存储值
    //         req.session.user = JSON.stringify(req.body);
    //         // 返回数据给前端
    //         res.json({ 'code': 200, 'message': '登录成功' });

    //         // 注意：处理ajax请求，是不能够用nodejs进行重定向的，或者跳转页面
    //         // res.redirect('device');
    //         // res.render('equipment-manage');
    //     }
    // });

    // promise编程版：
    query('SELECT username,password,type,head_pic from l_admin WHERE username = ? AND password = ?', req.body).then(function (results) {
        if (results.length == 0) {
            res.json({ 'code': 110, 'message': '用户名或者密码错误' });
        } else {
            // 登录用户成功的数据进行session存储，注意：session是绑定在req对象下的，以key-value的形式存储值
            req.session.user = JSON.stringify(results[0]);
            // 返回数据给前端
            res.json({ 'code': 200, 'message': '登录成功' });

            // 注意：处理ajax请求，是不能够用nodejs进行重定向的，或者跳转页面
            // res.redirect('device');
            // res.render('equipment-manage');
        }
    }).catch(function (error) {
        console.log(error.message);
    });
});

// 登出操作
router.get('/logout', function (req, res, next) {
    // req.session.user = {};//重新初始化,开发不要这样子做，不方便判断
    // req.session.user = null;

    // 登出时，用户session数据清除
    delete req.session.user;
    res.redirect('login');
});

// 设备信息列表与查询操作
router.post('/device/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.iDisplayStart * 1;
    var page_length = req.body.iDisplayLength * 1;
    var sEcho = req.body.sEcho * 1;
    var id = req.body.id;
    var name = req.body.name;
    var academy = req.body.academy;
    var start_time = req.body.start_time;
    var last_time = req.body.last_time;
    var status = req.body.status;
    var type = req.body.type;
    var life = req.body.life;
    var where_condition = 'WHERE';
    // 多个条件的语句判断
    where_condition += id ? ` id="${id}" AND` : '';
    where_condition += name ? ` name LIKE "%${name}%" AND` : '';
    where_condition += academy ? ` academy="${academy}" AND` : '';
    where_condition += start_time && last_time ? ` intime BETWEEN '${start_time}' AND '${last_time}' AND` : '';
    where_condition += status ? ` status=${status} AND` : '';
    where_condition += type ? ` type="${type}" AND` : '';
    where_condition += life ? ` life=${life} AND` : '';
    // 进行判断是否进行了条件查询，没有进行则全部查询，否则条件查询
    if (where_condition.indexOf('AND') == -1) {
        where_condition = '';
    } else {
        // 将最后一个字段的AND词进行剔除
        where_condition = where_condition.replace(/AND$/, '');
    }
    // 查询SQL
    var sql = `SELECT id,name,specification,price,academy,DATE_FORMAT(intime,"%Y/%m/%d %H:%i:%s") AS intime,status,type,life,synopsis,photo FROM l_equipment ${where_condition} ORDER BY intime DESC limit ?,?`;
    // 查询总数的SQL
    var count_sql = `SELECT COUNT(1) AS counts FROM l_equipment ${where_condition}`;
    // 查询操作
    searchList(res, { count_sql: count_sql, sql: sql, page_start: page_start, page_length: page_length, sEcho: sEcho });
});

// 设备添加操作，multipartMiddleware注意要添加，进行处理formdata的数据
router.post('/device/add', multipartMiddleware, function (req, res, next) {
    // 获取请求头参数
    var id = req.body.id;
    var name = req.body.name;
    var specification = req.body.specification;
    var price = req.body.price;
    var academy = req.body.academy;
    var intime = req.body.intime;
    var status = req.body.status;
    var type = req.body.type;
    var life = req.body.life;
    var synopsis = req.body.synopsis;
    // 插入语句
    var sql = 'INSERT INTO l_equipment(id,name,specification,price,academy,intime,status,type,life,synopsis,photo)VALUES(?,?,?,?,?,?,?,?,?,?,?)';
    // 验证设备编号的唯一性sql语句
    var validate_sql = 'SELECT COUNT(id) AS id FROM l_equipment WHERE id=?';
    // 先验证是否已经存在该设备
    query(validate_sql, [id]).then(function (reuslt) {
        if (reuslt[0].id <= 0) {
            // process.cwd()返回的是当前Node.js进程执行时的工作目录，__dirname是被执行的js文件的地址
            upload.uploadImg(process.cwd() + '\\public\\img\\upload\\device', req.files, function (result) {
                // 获取设备图片路径
                var photo = result.src;
                // 对数据格式进行数组化
                var params = [id, name, specification, price, academy, intime, status, type, life, synopsis, photo];
                // 将数据插入到数据库
                query(sql, params).then(function (reuslt) {
                    //改变设备状态表的对应总数 
                    equipmentCount();
                    res.send({ code: 200, message: "添加成功！" });
                }).catch(function (error) {
                    res.send({ code: 504, message: "添加失败！" });
                });
            });
        } else {
            res.send({ code: 504, message: "设备编号已存在！" });
        }
    }).catch(function (error) {
        res.send({ code: 500, message: "服务器异常！" });
    });
});

// 设备删除操作
router.get('/device/delete', function (req, res, next) {
    var sql = 'DELETE FROM l_equipment WHERE id=?';
    query(sql, req.query).then(function (result) {
        //改变设备状态表的对应总数 
        equipmentCount();
        res.json({ code: 200, message: "删除成功！" });
    }).catch(function (error) {
        res.json({ code: 504, message: "删除失败！" });
    });
});

// 设备的修改操作,multipartMiddleware注意要添加，进行处理formdata的数据
router.post('/device/update', multipartMiddleware, function (req, res, next) {
    // 获取请求的参数
    var id = req.body.id;
    var name = req.body.name;
    var specification = req.body.specification;
    var price = req.body.price;
    var academy = req.body.academy;
    var intime = req.body.intime;
    var status = req.body.status;
    var type = req.body.type;
    var life = req.body.life;
    var synopsis = req.body.synopsis;
    // 修改语句
    var sql = 'UPDATE l_equipment set name=?,specification=?,price=?,academy=?,intime=?,status=?,type=?,life=?,synopsis=? WHERE id=?';
    // 对数据格式进行数组化
    var params = [name, specification, price, academy, intime, status, type, life, synopsis, id];
    // process.cwd()返回的是当前Node.js进程执行时的工作目录，__dirname是被执行的js文件的地址
    upload.uploadImg(process.cwd() + '\\public\\img\\upload\\device', req.files, function (result) {
        // 获取设备图片路径
        var photo = result.src;
        // 图片进行了更改，进行sql语句和参数的改变
        if (photo) {
            sql = 'UPDATE l_equipment set name=?,specification=?,price=?,academy=?,intime=?,status=?,type=?,life=?,synopsis=?,photo=? WHERE id=?';
            params = [name, specification, price, academy, intime, status, type, life, synopsis, photo, id];
        }
        // 将数据进行修改
        query(sql, params).then(function (reuslt) {
            //改变设备状态表的对应总数 
            equipmentCount();
            res.send({ code: 200, message: "修改成功！" });
        }).catch(function (error) {
            res.send({ code: 504, message: "修改失败！" });
        });
    });
});

// 管理员列表和查询操作
router.post('/admin/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.iDisplayStart * 1;
    var page_length = req.body.iDisplayLength * 1;
    var sEcho = req.body.sEcho * 1;
    var id = req.body.id;
    var username = req.body.username;
    var password = req.body.password;
    var type = req.body.type;
    var phone = req.body.phone;
    var where_condition = 'WHERE';
    // 多个条件的语句判断
    where_condition += id ? ` id="${id}" AND` : '';
    where_condition += username ? ` username="${username}" AND` : '';
    where_condition += type ? ` type="${type}" AND` : '';
    where_condition += phone ? ` phone="${phone}" AND` : '';
    // 进行判断是否进行了条件查询，没有进行则全部查询，否则条件查询
    if (where_condition.indexOf('AND') == -1) {
        where_condition = '';
    } else {
        // 将最后一个字段的AND词进行剔除
        where_condition = where_condition.replace(/AND$/, '');
    }
    // 查询SQL
    var sql = `SELECT id,username,type,head_pic,password,phone FROM l_admin ${where_condition} ORDER BY id ASC limit ?,?`;
    // 查询总数的SQL
    var count_sql = `SELECT COUNT(1) AS counts FROM l_admin ${where_condition}`;
    searchList(res, { count_sql: count_sql, sql: sql, page_start: page_start, page_length: page_length, sEcho: sEcho });
});

// 管理员删除操作
router.get('/admin/delete', function (req, res, next) {
    // 验证管理员类型
    checkType(req, res, () => {
        var sql = 'DELETE FROM l_admin WHERE id=?';
        query(sql, req.query).then(function (result) {
            res.json({ code: 200, message: "删除成功！" });
        }).catch(function (error) {
            res.json({ code: 504, message: "删除失败！" });
        });
    });
});

// 管理员编辑操作
router.post('/admin/update', multipartMiddleware, function (req, res, next) {
    // 获取请求的参数
    var id = req.body.id;
    var username = req.body.username;
    var type = req.body.type;
    var phone = req.body.phone;
    var password = req.body.password;
    // 修改语句
    var sql = 'UPDATE l_admin set username=?,type=?,phone=?,password=? WHERE id=?';
    // 对数据格式进行数组化
    var params = [username, type, phone, password, id];
    // process.cwd()返回的是当前Node.js进程执行时的工作目录，__dirname是被执行的js文件的地址
    upload.uploadImg(process.cwd() + '\\public\\img\\upload\\admin', req.files, function (result) {
        // 获取图片路径
        var photo = result.src;
        // 图片进行了更改，进行sql语句和参数的改变
        console.log(photo);
        if (photo) {
            sql = 'UPDATE l_admin set username=?,type=?,phone=?,password=?,head_pic=? WHERE id=?';
            params = [username, type, phone, password, photo, id];
        }
        // 将数据进行修改
        query(sql, params).then(function (reuslt) {
            res.send({ code: 200, message: "修改成功！" });
        }).catch(function (error) {
            res.send({ code: 504, message: "修改失败！" });
        });
    });
});

// 管理员添加操作
router.post('/admin/add', multipartMiddleware, function (req, res, next) {
    // 验证管理员类型
    checkType(req, res, () => {
        // 获取请求头参数
        var username = req.body.username;
        var type = req.body.type;
        var phone = req.body.phone;
        var password = req.body.password;
        // 插入语句
        var sql = 'INSERT INTO l_admin(username,type,phone,password,head_pic)VALUES(?,?,?,?,?)';
        // 验证用户名的唯一性sql语句
        var validate_sql = 'SELECT COUNT(username) AS username FROM l_admin WHERE username=?';
        // 先验证是否已经存在
        query(validate_sql, [username]).then(function (reuslt) {
            if (reuslt[0].username <= 0) {
                // process.cwd()返回的是当前Node.js进程执行时的工作目录，__dirname是被执行的js文件的地址
                upload.uploadImg(process.cwd() + '\\public\\img\\upload\\admin', req.files, function (result) {
                    // 获取图片路径
                    var photo = result.src;
                    // 对数据格式进行数组化
                    var params = [username, type, phone, password, photo];
                    // 将数据插入到数据库
                    query(sql, params).then(function (reuslt) {
                        res.send({ code: 200, message: "添加成功！" });
                    }).catch(function (error) {
                        res.send({ code: 504, message: "添加失败！" });
                    });
                });
            } else {
                res.send({ code: 504, message: "该管理员已存在！" });
            }
        }).catch(function (error) {
            res.send({ code: 500, message: "服务器异常！" });
        });
    });
});

// 普通用户列表和查询操作
router.post('/user/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.iDisplayStart * 1;
    var page_length = req.body.iDisplayLength * 1;
    var sEcho = req.body.sEcho * 1;
    var account = req.body.account;
    var password = req.body.password;
    var name = req.body.name;
    var tel = req.body.tel;
    var sex = req.body.sex;
    var idcard = req.body.idcard;
    var academy = req.body.academy;
    var type = req.body.type;
    var major = req.body.major;
    var grade = req.body.grade;
    var email = req.body.email;
    var where_condition = 'WHERE';
    // 多个条件的语句判断
    where_condition += account ? ` account="${account}" AND` : '';
    where_condition += name ? ` name="${name}" AND` : '';
    where_condition += tel ? ` tel="${tel}" AND` : '';
    where_condition += sex ? ` sex="${sex}" AND` : '';
    where_condition += idcard ? ` idcard="${idcard}" AND` : '';
    where_condition += academy ? ` academy LIKE "%${academy}%" AND` : '';
    where_condition += type ? ` type="${type}" AND` : '';
    where_condition += major ? ` major LIKE "%${major}%" AND` : '';
    where_condition += grade ? ` grade="${grade}" AND` : '';
    where_condition += email ? ` email="${email}" AND` : '';
    // 进行判断是否进行了条件查询，没有进行则全部查询，否则条件查询
    if (where_condition.indexOf('AND') == -1) {
        where_condition = '';
    } else {
        // 将最后一个字段的AND词进行剔除
        where_condition = where_condition.replace(/AND$/, '');
    }
    // 查询SQL
    var sql = `SELECT id,account,name,tel,password,sex,idcard,academy,type,major,grade,email,head_pic FROM l_user ${where_condition} ORDER BY id DESC limit ?,?`;
    // 查询总数的SQL
    var count_sql = `SELECT COUNT(1) AS counts FROM l_user ${where_condition}`;
    searchList(res, { count_sql: count_sql, sql: sql, page_start: page_start, page_length: page_length, sEcho: sEcho });
});

// 普通用户删除操作
router.get('/user/delete', function (req, res, next) {
    // 验证管理员类型
    checkType(req, res, () => {
        var sql = 'DELETE FROM l_user WHERE id=?';
        query(sql, [req.query.id]).then(function (result) {
            // 同步删除该用户的信用积分
            pointsList(2, req.query.account);
            res.json({ code: 200, message: "删除成功！" });
        }).catch(function (error) {
            res.json({ code: 504, message: "删除失败！" });
        });
    });
});

// 普通用户编辑操作
router.post('/user/update', multipartMiddleware, function (req, res, next) {
    // 获取请求的参数
    var id = req.body.id;
    var account = req.body.account;
    var password = req.body.password;
    var name = req.body.name;
    var tel = req.body.tel;
    var sex = req.body.sex;
    var idcard = req.body.idcard;
    var academy = req.body.academy;
    var type = req.body.type;
    var major = req.body.major;
    var grade = req.body.grade;
    var email = req.body.email;
    // 修改语句
    var sql = 'UPDATE l_user set account=?,name=?,password=?,tel=?,type=?,sex=?,idcard=?,academy=?,major=?,grade=?,email=? WHERE id=?';
    // 对数据格式进行数组化
    var params = [account, name, password, tel, type, sex, idcard, academy, major, grade, email, id];
    // process.cwd()返回的是当前Node.js进程执行时的工作目录，__dirname是被执行的js文件的地址
    upload.uploadImg(process.cwd() + '\\public\\img\\upload\\user', req.files, function (result) {
        // 获取图片路径
        var photo = result.src;
        // 图片进行了更改，进行sql语句和参数的改变
        if (photo) {
            sql = 'UPDATE l_user set account=?,name=?,password=?,tel=?,type=?,sex=?,idcard=?,academy=?,major=?,grade=?,email=?,head_pic=? WHERE id=?';
            params = [account, name, password, tel, type, sex, idcard, academy, major, grade, email, photo, id];
        }
        // 将数据进行修改
        query(sql, params).then(function (reuslt) {
            res.send({ code: 200, message: "修改成功！" });
        }).catch(function (error) {
            res.send({ code: 504, message: "修改失败！" });
        });
    });
});

// 普通用户添加操作
router.post('/user/add', multipartMiddleware, function (req, res, next) {
    // 验证管理员类型
    checkType(req, res, () => {
        // 获取请求头参数
        var account = req.body.account;
        var password = req.body.password;
        var name = req.body.name;
        var tel = req.body.tel;
        var sex = req.body.sex;
        var idcard = req.body.idcard;
        var academy = req.body.academy;
        var type = req.body.type;
        var major = req.body.major;
        var grade = req.body.grade;
        var email = req.body.email;
        // 插入语句
        var sql = 'INSERT INTO l_user(account,password,name,tel,sex,idcard,academy,type,major,grade,email,head_pic)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
        // 验证用户的唯一性sql语句
        var validate_sql = 'SELECT COUNT(account) AS account FROM l_user WHERE account=?';
        // 先验证是否已经存在
        query(validate_sql, [account]).then(function (reuslt) {
            if (reuslt[0].account <= 0) {
                // process.cwd()返回的是当前Node.js进程执行时的工作目录，__dirname是被执行的js文件的地址
                upload.uploadImg(process.cwd() + '\\public\\img\\upload\\user', req.files, function (result) {
                    // 获取图片路径
                    var photo = result.src;
                    // 对数据格式进行数组化
                    var params = [account, password, name, tel, sex, idcard, academy, type, major, grade, email, photo];
                    // 将数据插入到数据库
                    query(sql, params).then(function (result) {
                        // 同步更新信用积分列表
                        pointsList(1, account);
                        res.send({ code: 200, message: "添加成功！" });
                    }).catch(function (error) {
                        console.log(error);
                        res.send({ code: 504, message: "添加失败！" });
                    });
                });
            } else {
                res.send({ code: 504, message: "该用户已存在！" });
            }
        }).catch(function (error) {
            console.log(error);
            res.send({ code: 500, message: "服务器异常！" });
        });
    });
});

// 借用信息列表和查询操作
router.post('/borrow/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.iDisplayStart * 1;
    var page_length = req.body.iDisplayLength * 1;
    var sEcho = req.body.sEcho * 1;
    var eqid = req.body.eqid;
    var uid = req.body.uid;
    var outtime = req.body.outtime;
    var endtime = req.body.endtime;
    var backtime = req.body.backtime;
    var status = req.body.status;
    var isoverdue = req.body.isoverdue;
    var backstatus = req.body.backstatus;
    var money = req.body.money;
    var where_condition = 'WHERE';
    // 多个条件的语句判断
    where_condition += eqid ? ` eqid="${eqid}" AND` : '';
    where_condition += uid ? ` uid="${uid}" AND` : '';
    where_condition += backstatus ? ` backstatus="${backstatus}" AND` : '';
    where_condition += outtime ? ` DATE_FORMAT(outtime,"%Y/%m/%d")="${outtime}" AND` : '';
    where_condition += endtime ? ` DATE_FORMAT(endtime,"%Y/%m/%d")="${endtime}" AND` : '';
    where_condition += backtime ? ` DATE_FORMAT(backtime,"%Y/%m/%d")="${backtime}" AND` : '';
    where_condition += status ? ` status="${status}" AND` : '';
    where_condition += isoverdue ? ` isoverdue="${isoverdue}" AND` : '';
    // 进行判断是否进行了条件查询，没有进行则全部查询，否则条件查询
    if (where_condition.indexOf('AND') == -1) {
        where_condition = '';
    } else {
        // 将最后一个字段的AND词进行剔除
        where_condition = where_condition.replace(/AND$/, '');
    }
    // 查询SQL
    var sql = `SELECT b.id,b.eqid,b.uid,b.backstatus,IF(DATE_FORMAT(b.outtime,"%Y/%m/%d %H:%i:%s")='0000/00/00 00:00:00','',DATE_FORMAT(b.outtime,"%Y/%m/%d %H:%i:%s")) AS outtime,IF(DATE_FORMAT(b.endtime,"%Y/%m/%d %H:%i:%s")='0000/00/00 00:00:00','',DATE_FORMAT(b.endtime,"%Y/%m/%d %H:%i:%s")) AS endtime,IF(DATE_FORMAT(b.backtime,"%Y/%m/%d %H:%i:%s")='0000/00/00 00:00:00','',DATE_FORMAT(b.backtime,"%Y/%m/%d %H:%i:%s")) AS backtime,b.status,b.isoverdue,b.money FROM l_borrow b LEFT JOIN l_user u on b.uid = u.account ${where_condition} ORDER BY b.id DESC limit ?,?`;
    // 查询总数的SQL
    var count_sql = `SELECT COUNT(1) AS counts FROM l_borrow ${where_condition}`;
    searchList(res, { count_sql: count_sql, sql: sql, page_start: page_start, page_length: page_length, sEcho: sEcho });
});

// 借用信息编辑操作
router.post('/borrow/update', function (req, res, next) {
    // 获取请求的参数
    var id = req.body.id;
    var eqid = req.body.eqid;
    var outtime = req.body.outtime;
    var endtime = req.body.endtime;
    var backtime = req.body.backtime;
    var status = req.body.status;
    var isoverdue = req.body.isoverdue;
    var money = req.body.money;
    var backstatus = req.body.backstatus;
    // 修改语句
    var sql = 'UPDATE l_borrow set outtime=?,endtime=?,backtime=?,status=?,isoverdue=?,money=?,backstatus=? WHERE id=?';
    // 如果归还时间大于到期时间，逾期状态改为过期状态
    if (new Date(backtime).getTime() > new Date(endtime).getTime()) {
        isoverdue = 2;
    } else {
        isoverdue = 1;
    }
    // 对数据格式进行数组化
    var params = [outtime, endtime, backtime, status, isoverdue, money, backstatus, id];
    // 如果审批状态为已审批，对应设备表的设备状态要改成借出状态
    if (status == 2) {
        let sql = 'UPDATE l_equipment set status=1 WHERE id=?'
        query(sql, [eqid]).then(function (result) {
            //改变设备状态表的对应总数 
            equipmentCount();
        }).catch(function (error) {
            console.log(error);
        });
    };
    // 如果设备归还了，则进行设备状态更改为在库
    if(backstatus == 1){
        let sql = 'UPDATE l_equipment set status=0 WHERE id=?';
        query(sql, [eqid]).then(function (result) {
            //改变设备状态表的对应总数 
            equipmentCount();
        }).catch(function (error) {
            console.log(error);
        });
    };
    // 将数据进行修改
    query(sql, params).then(function (reuslt) {
        res.send({ code: 200, message: "修改成功！" });
    }).catch(function (error) {
        res.send({ code: 504, message: "修改失败！" });
    });
});

// 信用信息列表和查询操作
router.post('/points/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.iDisplayStart * 1;
    var page_length = req.body.iDisplayLength * 1;
    var sEcho = req.body.sEcho * 1;
    var uid = req.body.uid;
    var overduetime = req.body.overduetime;
    var start = req.body.start;
    var last = req.body.last;
    var where_condition = 'WHERE';
    // 多个条件的语句判断
    where_condition += uid ? ` uid="${uid}" AND` : '';
    where_condition += overduetime ? ` overduetime="${overduetime}" AND` : '';
    where_condition += start && last ? ` points BETWEEN "${start}" AND "${last}" AND` : (start ? ` points="${start}" AND` : (last ? ` points="${last}" AND` : ''));
    // 进行判断是否进行了条件查询，没有进行则全部查询，否则条件查询
    if (where_condition.indexOf('AND') == -1) {
        where_condition = '';
    } else {
        // 将最后一个字段的AND词进行剔除
        where_condition = where_condition.replace(/AND$/, '');
    }
    // 查询SQL
    var sql = `SELECT b.id,b.uid,u.name,b.overduetime,b.points FROM l_credit_points b LEFT JOIN l_user u on b.uid = u.account ${where_condition} ORDER BY b.id DESC limit ?,?`;
    // 查询总数的SQL
    var count_sql = `SELECT COUNT(1) AS counts FROM l_credit_points ${where_condition}`;
    searchList(res, { count_sql: count_sql, sql: sql, page_start: page_start, page_length: page_length, sEcho: sEcho });
});

// 信用信息编辑操作
router.post('/points/update', function (req, res, next) {
    // 获取请求的参数
    var id = req.body.id;
    var overduetime = req.body.overduetime;
    var points = req.body.points;
    // 修改语句
    var sql = 'UPDATE l_credit_points set overduetime=?,points=? WHERE id=?';
    // 对数据格式进行数组化
    var params = [overduetime, points, id];
    // 将数据进行修改
    query(sql, params).then(function (reuslt) {
        res.send({ code: 200, message: "修改成功！" });
    }).catch(function (error) {
        res.send({ code: 504, message: "修改失败！" });
    });
});

// 公告列表和查询操作
router.post('/notice/list', function (req, res, next) {
    // 获取前端传递过来的参数
    var page_start = req.body.iDisplayStart * 1;
    var page_length = req.body.iDisplayLength * 1;
    var sEcho = req.body.sEcho * 1;
    var title = req.body.title;
    var content = req.body.content;
    var last = req.body.last;
    var start = req.body.start;
    var where_condition = 'WHERE';
    // 多个条件的语句判断
    where_condition += last && start ? ` time BETWEEN "${start}" AND "${last}" AND` : '';
    where_condition += content ? ` content LIKE "%${content}%" AND` : '';
    where_condition += title ? ` title LIKE "%${title}%" AND` : '';
    // 进行判断是否进行了条件查询，没有进行则全部查询，否则条件查询
    if (where_condition.indexOf('AND') == -1) {
        where_condition = '';
    } else {
        // 将最后一个字段的AND词进行剔除
        where_condition = where_condition.replace(/AND$/, '');
    }
    // 查询SQL
    var sql = `SELECT id,title,content,DATE_FORMAT(time,"%Y/%m/%d %H:%i:%s") AS time FROM l_notice ${where_condition} ORDER BY time DESC limit ?,?`;
    // 查询总数的SQL
    var count_sql = `SELECT COUNT(1) AS counts FROM l_notice ${where_condition}`;
    searchList(res, { count_sql: count_sql, sql: sql, page_start: page_start, page_length: page_length, sEcho: sEcho });
});

// 公告删除操作
router.get('/notice/delete/:id', function (req, res, next) {
    var sql = 'DELETE FROM l_notice WHERE id=?';
    query(sql, [req.params.id]).then(function (result) {
        res.json({ code: 200, message: "删除成功！" });
    }).catch(function (error) {
        res.json({ code: 504, message: "删除失败！" });
    });
});

// 公告编辑操作
router.post('/notice/update', multipartMiddleware, function (req, res, next) {
    // 获取请求的参数
    var id = req.body.id;
    var title = req.body.title;
    var content = req.body.content;
    // 修改语句
    var sql = 'UPDATE l_notice set title=?,content=? WHERE id=?';
    // 对数据格式进行数组化
    var params = [title, content, id];
    // 将数据进行修改
    query(sql, params).then(function (reuslt) {
        res.send({ code: 200, message: "修改成功！" });
    }).catch(function (error) {
        res.send({ code: 504, message: "修改失败！" });
    });
});

// 公告添加操作
router.post('/notice/add', multipartMiddleware, function (req, res, next) {
    // 获取请求头参数
    var title = req.body.title;
    var content = req.body.content;
    // 插入语句
    var sql = 'INSERT INTO l_notice(title,content)VALUES(?,?)';
    // 对数据格式进行数组化
    var params = [title, content];
    // 将数据插入到数据库
    query(sql, params).then(function (result) {
        res.send({ code: 200, message: "添加成功！" });
    }).catch(function (error) {
        console.log(error);
        res.send({ code: 504, message: "添加失败！" });
    });
});



// @description：封装了所有表格列表的查询逻辑
// @opts：{count_sql:查询总数的sql语句,sql:查询语句,page_start:分页查询的起始索引,page_length:分页查询的长度,sEcho:查询的次数}
function searchList(res, opts) {
    // promise编程版：
    query(opts.count_sql, []).then(counts => {
        console.log(counts);
        // Promise.all([value1,value2,fn1(),fn2()...]).then(result=>{})会将参数或者函数执行成功的值进行放到一个数组result结果中去，最终返回所有resolve的值，而Promse.race([value1,value2,fn1(),fn2()...]).then(result=>{}))只会返回第一个成功执行resolve的值。
        Promise.all([counts, query(opts.sql, { start: opts.page_start, length: (opts.page_length || 5) })]).then(results => {
            res.json({
                "status": { code: 200, message: "请求成功" },
                "aaData": results[1],
                "sEcho": opts.sEcho,
                "iTotalRecords": counts[0]['counts'],
                "iTotalDisplayRecords": counts[0]['counts']
            });
        });
    }).catch(function (error) {
        console.log(error);
        console.log(error.message);
        res.json({ code: 504, message: "服务器请求异常！" });
    });

    // // 普通回调逻辑版：
    // query(opts.count_sql, [], function (counts) {
    //     console.log(counts);
    //     query(opts.sql, { start: opts.page_start, length: (opts.page_length||5) }, function (results) {
    //         console.log(results);
    //         res.json({
    //             "status": { code: 200, message: "请求成功" },
    //             "aaData": results,
    //             "iTotalRecords": counts[0]['counts'],
    //             "sEcho": opts.sEcho,
    //             "iTotalDisplayRecords": counts[0]['counts']
    //         });
    //     });
    // });
};

// @description：验证管理员类型，进行相关操作判断
// @params：req 请求头
// @params：res 响应头
// @params：callback 业务相关的回调函数
function checkType(req, res, callback) {
    // 获取session中管理员类型，判断是否是超级管理员，只有超级管理员进行添加管理员操作
    var c_type = JSON.parse(req.session.user)["type"];
    console.log("管理员类型：" + c_type);
    if (c_type != 1) {
        res.send({ code: 504, message: "您不是超级管理员，不能进行这项操作！" });
        return;
    };
    callback && callback();
};

// @description：设备状态总数表的更新操作
function equipmentCount() {
    let sql1 = `UPDATE l_equipment_status SET count=(SELECT COUNT(1) AS count FROM l_equipment WHERE status =0) WHERE id=0`;
    let sql2 = `UPDATE l_equipment_status SET count=(SELECT COUNT(1) AS count FROM l_equipment WHERE status =1) WHERE id=1`;
    let sql3 = `UPDATE l_equipment_status SET count=(SELECT COUNT(1) AS count FROM l_equipment WHERE status =2) WHERE id=2`;
    let sql4 = `UPDATE l_equipment_status SET count=(SELECT COUNT(1) AS count FROM l_equipment WHERE status =3) WHERE id=3`;
    Promise.all([query(sql1, []), query(sql2, []), query(sql3, []), query(sql4, [])]).then(result => {
        console.log("设备状态表的总数发生了变化");
    }).catch(error => {
        console.log(error);
    })
};

// @description：信用积分表的同步普通用户的更新操作
// @params：flag:1表示添加操作，2表示删除操作，id：用户账号
function pointsList(flag, id) {
    let sql = "";
    if (flag == 1) {
        sql = `INSERT INTO l_credit_points(uid)VALUES(?)`;
    } else if (flag == 2) {
        sql = `DELETE FROM l_credit_points WHERE uid=?`;
    }
    query(sql, [id]).then(result => {
        console.log("信用积分表的发生了变化");
    }).catch(error => {
        console.log(error);
    })
}


module.exports = router;