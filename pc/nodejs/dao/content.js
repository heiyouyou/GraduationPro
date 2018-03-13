// 载入数据库连接模块
var mongoose = require("../core/mongodb_connection");
// 定义文档的字段
var ContentSchema = mongoose.Schema({
    title: String,//标题
    ctime: { type: Date, default: Date.now },//创建时间
    content:String,//内容
    link:String,//外面连接
    tags:String,//标签
    cid:Number,//分类id
    hits:{type:Number ,default:1},//点击数
    utime:{type:Date ,default:null},//更新时间
    status:{ type: Number, default: 1},/*0未发布1发布*/
    isdelete:{ type: Number, default: 0}/*0未删除1删除,逻辑删除：只是改一个状态，数据还是保留，物理删除：数据库不存在*/
});
//Schema提供的这个methos的对象，是为每一个文档提供的一个方法扩展，扩展过程中可以进行数据的处理。this指向就是每一个文档对象数据
ContentSchema.methods.getTitle = function(){
  var title = this.title;
  return title+"【wzy】";
};

//Schema提供了一个静态扩展，是表范围级别的。this指向不一个文档对象，而是一个集合对象(表)
ContentSchema.statics.findTitle = function(title) {
   return title+"【wzy】";
};

var nContents = mongoose.model('nContents',ContentSchema);
module.exports = nContents;