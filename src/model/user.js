let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let user = new Schema({
  // 微博用户 id
  wuid: String,
  // 昵称
  name: String,
  // 头像
  avatar: String,
  // 个人主页
  wsite: String,
  // 所在城市
  city: String,
  // 性别 1: 男, 2: 女
  sex: Number,
  // 个性签名
  description: String
});

user.set('toObject', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('User', user);
