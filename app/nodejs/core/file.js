/**
 * Created by wzy on 2016/12/29.
 */
var fs = require("fs");
/**
 *
 * @param filename  文件的存放的路径
 * @param data   写入的内容，可以字符串也可以二进制数据
 * @param encoding  编码，utf-8，那么代表就是一定是写入文本，
 * 如果写入二进制数据，比如图片，文件等，那么这个时候，就不能设置utf-8,而是 "binary"
 * @returns {Promise}
 */
exports.writeFile = function(filename,data,encoding){
    return new Promise(function(resolve,reject){
        fs.writeFile(filename,data,encoding?encoding:"utf-8",function(err){
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
};


//这个只写入文本
exports.writeFileText = function(filename,data){
    return new Promise(function(resolve,reject){
        fs.writeFile(filename,data,"utf-8",function(err){
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
};

//这个只写入图片
exports.writeFileBinary = function(filename,data){
    return new Promise(function(resolve,reject){
        fs.writeFile(filename,data,"binary",function(err){
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
};
