// 导入nodejs内置的加密模块crypto
var crypto = require("crypto");

//加密方式一：采用Hash编码的方法进行加密(单向)
exports.createHash = function(content,type){
    // 获取加密对象，参数type:sha256'||'sha512||'md5'，采用编码的算法类型
    var hash = crypto.createHash(type||"md5");
    // 加密内容
    hash.update(content);//等价于:hash.update(new Buffer(content,"binary")),string or buffer的内容类型
    // 获取加密的内容，digest支持的编码可以是'hex'，'binary'或'base64'，如果没有提供编码，则返回一个缓冲区。
    var encode = hash.digest("hex");
    return encode;
};
// 加密方式二：采用Hmac编码的方法进行加密(单向)
exports.createHmac = function(content,type,flag){
    // 获取加密对象，参数type:sha256'||'sha512||'md5'，采用编码的算法类型,flag:表示加密的前缀key
    var Hmac = crypto.createHmac(type||"md5",flag||"wzy_");
    // 加密内容
    Hmac.update(content);//等价于:hash.update(new Buffer(content,"binary"))
    // 获取加密的内容，digest支持的编码可以是'hex'，'binary'或'base64'，如果没有提供编码，则返回一个缓冲区。
    var encode = Hmac.digest("hex");
    return encode;
};
// 加密方式三：通过密钥key进行加密与解密内容(双向)
exports.cipher = {
    encode:function(content,key){
        //获取一个加密的对象
        var cipher = crypto.createCipher("aes-256-cbc",key);
        //应用hash编码的方式进行加密
        cipher.update(content,"utf-8","hex");
        //获取加密的内容
        var encode = cipher.final("hex");
        //返回
        return encode;
    },
    decode:function(content,key){//content必须是加密以后的内容
        //获取一个解密的对象
        var decpher = crypto.createDecipher("aes-256-cbc",key);
        //应用hash编码的方式进行解密，decipher.update(data[, input_encoding][, output_encoding])
        decpher.update(content,"hex","utf-8");
        //获取解密的内容
        var dencode = decpher.final("utf-8");
        //返回
        return dencode;
    }

};
