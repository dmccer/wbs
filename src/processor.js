/**
 * @file 提取和存储爬取的页面数据
 * @author Kane yunhua.xiao@guluauto.com
 */
let cheerio = require('cheerio');
let fs = require('fs');
let url = require('url');
let User = require('./model/user');
let Msg = require('./model/msg');

/**
 * 页面数据提取与存储器
 * @class
 */
class Processor {
  /**
   * Processor 构造函数
   * @param  {string} filename 页面文件路径
   * @constructor
   */
  constructor(filename: string) {
    this.file = filename;
  }

  /**
   * 提取和存储数据
   * @method
   * @public
   */
  run() {
    fs.readFile(this.file, (err, content) => {
      if (err) {
        throw err;
      }

      let $ = cheerio.load(content, {
        decodeEntities: false
      });
      $('.WB_notes').remove();
      let $wb_cards = $('.WB_cardwrap');

      console.log('$wb_cards length: ' + $wb_cards.length);

      $wb_cards.each((i, el) => {
        let item = this.handler($, el);
        this.save(item);
      });
    });
  }

  /**
   * 单个项数据提取
   * @private
   * @param {Object} $ cheerio 包装后的整个页面对象（类 jQuery)
   * @param {DOMElement} el 单个项元素
   * @return {Object} 提取出的数据项
   */
  handler($: Object, el: Object): Object {
    let $el = $(el);

    let user = {};
    let $W_fb = $el.find('.W_fb');

    user.avatar = $el.find('.face img').attr('src');
    user.name = $W_fb.attr('nick-name');
    user.wsite = $W_fb.attr('href');
    user.wuid = url.parse(user.avatar).pathname.split('/')[1];

    let msg = {};
    let $content = $el.find('.comment_txt');
    let $feed_actions = $el.find('.feed_action_info .line');
    let $photos = $el.find('[node-type="fl_pic_list"] [action-type="fl_pics"]');
    let photos = [];
    $photos.each((i, el) => {
      photos.push($(el).attr('src'));
    });

    msg.wuid = user.wuid;
    msg.mid = $el.find('[action-type="feed_list_item"]').attr('mid');
    msg.chosen = $el.find('.search_title_as .W_texta').text() === '精选';
    msg.content = $content.text();
    msg.content_html = $content.html();
    msg.photos = photos;
    msg.videos = [];
    msg.from = $el.find('.feed_from a').eq(1).text();
    msg.time = $el.find('[node-type="feed_list_item_date"]').attr('title');
    msg.mark = $feed_actions.eq(0).find('em').text() || 0;
    msg.transmit = $feed_actions.eq(1).find('em').text() || 0;
    msg.comment = $feed_actions.eq(2).find('em').text() || 0;
    msg.favorite = $feed_actions.eq(3).find('em').text() || 0;

    return {
      user: user,
      msg: msg
    };
  }

  /**
   * 将数据项写入数据库
   * @private
   * @param {Object} item 提取出的数据项
   */
  save(item: Object) {
    User.findOneAndUpdate({
      wuid: item.user.wuid
    }, item.user, {
      new: true,
      upsert: true
    }, (err, doc) => {
      if (err) {
        return this.error('user', item.user, err);
      }

      this.success('user', doc);
    });

    Msg.findOneAndUpdate({
      mid: item.msg.mid,
      wuid: item.user.wuid
    }, item.msg, {
      new: true,
      upsert: true
    }, (err, doc) => {
      if (err) {
        return this.error('msg', item.msg, err);
      }

      this.success('msg', doc);
    });
  }

  /**
   * 写入数据库失败回调
   * @private
   * @param {string} name 模型名
   * @param {Object} data 写入的数据
   * @param {Error} err 写入数据库异常对象
   */
  error(name: string, data: Object, err: Error) {
    console.error(`Update or create ${name} failed, the ${name} is\n${JSON.stringify(data)}`);
    console.debug(err);
  }

  /**
   * 写入数据库成功回调
   * @param {string} name 模型名
   * @param {string} data 写入的数据
   */
  success(name: string, data: Object) {
    console.info(`Update or create ${name} success, the ${name} is\n${JSON.stringify(data)}`);
  }
}

/**
 * 页面数据提取与存储器
 * @module wbs/Processor
 */
module.exports = Processor;
