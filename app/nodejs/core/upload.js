var fs = require('fs');
// 载入自定义封装的文件写入模块
var file = require('./file');
var config = require('../config/config');
// 获取项目的主机域名、端口号和协议
var HOST = config.HOST;
var PORT = config.PORT;
var PROTOCOL = config.PROTOCOL;
/**
 * @description  针对formdata表单数据封装的图片上传方法，主要支持单个图片文件，多个还有些bug
 * @param src  文件的存放的路径
 * @param filesObj 文件表单对象，即:req.files
 * @param callback 成功的回调函数，参数{src:图片的上传地址,filename:文件名}
 */
function uploadImg(src, filesObj, callback) {
    // 定义上传文件存放的路径
    var upload_src = src;
    //判断上传的存放路径是否存在 
    fs.stat(upload_src, function (err, stats) {
        // 不存在则进行创建
        if (!stats) {
            // mkdirSync和mkdir只能创建一层不存在的目录，不能创建多层不存在的目录
            fs.mkdirSync(upload_src);
            console.log('创建目录：' + upload_src + '--成功！');
        };
        // 遍历传过来的文件对象数据
        for (var key in filesObj) {
            // 获取文件数据对象
            var fileObj = filesObj[key];
            // 定义一个存放文件对象的数组
            var fileArr = [];
            // 判断是数组，还是json对象
            if (!Array.isArray(fileObj)) {
                fileArr.push(fileObj);
            } else {
                fileArr = fileObj;
            }
            // 遍历每一个存放在数组中的文件数据对象
            for (var i = 0, len = fileArr.length; i < len; i++) {
                // 获取上传文件存放的临时路径
                var temp_path = fileArr[i].path;
                // 判断文件图片类型
                var img_type = "";
                if (temp_path.lastIndexOf('.jpg') != -1) {
                    img_type = '.jpg';
                } else if (temp_path.lastIndexOf('.jpeg') != -1) {
                    img_type = '.jpeg';
                } else if (temp_path.lastIndexOf('.png') != -1) {
                    img_type = '.png';
                } else if (temp_path.lastIndexOf('.gif') != -1) {
                    img_type = '.gif';
                } else {//如果不是图片文件，则不进行上传，并且同时删除临时文件
                    fs.unlink(temp_path, function (err) {
                        if (err) {
                            console.log(temp_path + '删除失败');
                            return;
                        };
                        console.log(temp_path + '删除成功');
                        // 返回空数据
                        var params = {
                            src: null,
                            filename: null
                        };
                        callback && callback(params);
                    });
                    return;
                };
                // 同步读取临时路径上的文件
                // var data = fs.readFileSync(temp_path);
                console.log(i + "===" + temp_path);
                // 以即调函数的形式传参，避免temp_path和img_type的由于nodejs的异步操作，发生改变
                (function (temp_path1, img_type1) {
                    // 异步读取临时路径上的文件
                    fs.readFile(temp_path1, function (err, data) {
                        // 以时间戳随机创建图片名
                        var filename = Date.now() + img_type1;
                        // 写入到指定目录下进行存放
                        file.writeFileBinary(upload_src + '\\' + filename, data, 'binary').then(function () {
                            // 写入成功,进行临时文件的删除
                            fs.unlink(temp_path1, function (err) {
                                if (err) {
                                    console.log('删除失败');
                                    return;
                                };
                                console.log('删除成功');
                            });
                            console.log("写入成功");
                            var web_src = PROTOCOL+"://"+HOST+":"+PORT+"/" + upload_src.substring(upload_src.indexOf("img")) + "\\" + filename;
                            // 返回数据
                            var params = {
                                src: web_src,
                                filename: filename
                            };
                            callback && callback(params);
                        }).catch(function () {
                            console.log("写入失败");
                        });
                    });
                })(temp_path, img_type);
            }
        }
    });
}

exports.uploadImg = uploadImg;