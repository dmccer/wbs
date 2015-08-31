let cheerio = require('cheerio');
let fs = require('fs');
let url = require('url');
let Crawl = require('./crawl');
let User = require('./model/user');
let Msg = require('./model/msg');

require('../db');

class Processor {
  constructor(filename:string) {
    this.file = filename;
  }

  run() {
    fs.readFile(this.file, (err, data) => {
      if (err) {
        throw err;
      }

      let $ = cheerio.load(data, {
        decodeEntities: false
      });
      $('.WB_notes').remove();
      let $wb_cards = $('.WB_cardwrap');

      console.log('$wb_cards length: ' + $wb_cards.length);

      let users = [];
      let msgs = [];

      $wb_cards.each((i, el) => {
        var $el = $(el);

        let user = {};
        let $W_fb = $el.find('.W_fb');

        user.avatar = $el.find('.face img').attr('src');
        user.name = $W_fb.attr('nick-name');
        user.wsite = $W_fb.attr('href');
        user.wuid = url.parse(user.avatar).pathname.split('/')[1];
        users.push(user);

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
        msgs.push(msg);
      });

      Promise
        .all([Msg.create(msgs), User.create(users)])
        .then((msgs, users) => {
          console.log('Insert or update msgs and users');

          process.exit(0);
        })
        .catch((err) => {
          throw err;
        });
    });
  }
}

let crawl = new Crawl('二手车 西安');

crawl.on('page', (err, filename) => {
  if (err) {
    throw err;
  }

  // page done
  console.log('===== Yeah, GOT A PATH =====')

  let processor = new Processor(filename);
  processor.run();
});

crawl.run();
