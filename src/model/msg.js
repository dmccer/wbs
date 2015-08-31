let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let msg = new Schema({
  // 微博 user id
  wuid: String,
  // mid
  mid: String,
  // 精选
  chosen: Boolean,
  // 微博内容
  content: String,
  // 微博内容 html
  content_html: String,
  // 图册
  photos: [String],
  // 视屏
  videos: [String],
  // 来源或终端
  from: String,
  // 发布时间
  time: { type: Date, default: Date.now },
  // 收藏量
  mark: Number,
  // 转发量
  transmit: Number,
  // 评论量
  comment: Number,
  // 点赞量
  favorite: Number
});

msg.set('toObject', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Msg', msg);
