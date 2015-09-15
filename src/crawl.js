let fs = require('fs');
let path = require('path');
let util = require('util');
let EventEmitter = require('events').EventEmitter;
let urlencode = require('urlencode');
let cheerio = require('cheerio')
let shell = require('shelljs');
let config = require('../config');

const TMP_EXT = '.json';
const DATA_EXT = '.html';
const WEIBO = 'http://s.weibo.com/weibo/';
const PHANTOMJS = './node_modules/.bin/phantomjs';
const CRAWLJS = './built/src/_crawl.js';

class Crawl extends EventEmitter {

  static get feeds_sel() { return '[node-type="feed_list"]'; }
  static get pages_sel() { return '.W_pages'; }
  static get total_sel() { return '.search_rese'; }

  constructor(keywords: string) {
    if (!keywords) {
      throw new Error('缺少关键词');
    }

    super();

    this.keywords = keywords;
    this.page_no = 1;
    this.cfg();
  }

  run() {
    shell.exec([PHANTOMJS, CRAWLJS].join(' '), this.callback.bind(this));
  }

  cfg() {
    this.url = this.build_url();
    this.tmp_filename = this.tmp_file();
    this.data_filename = this.data_file();
    this.cookie = this.build_cookie();

    fs.writeFileSync(path.join(config.root, './crawl.json'), JSON.stringify({
      url: this.url,
      filename: this.tmp_filename,
      cookie: this.cookie
    }));
  }

  callback() {
    let tmp_file_data = require(this.tmp_filename);

    let $ = cheerio.load(tmp_file_data.html, {
      decodeEntities: false
    });

    let $pages = $(Crawl.pages_sel);
    let $total = $(Crawl.total_sel);

    this.max_page_no = parseInt($pages.find('.layer_menu_list li').last().text().replace(/[^\d]/g, ''));
    console.log('### MAX_PAGE_NO = ' + this.max_page_no);

    fs.writeFileSync(
      path.join(config.tmpdir, './pagination.html'),
      $pages.html() + $total.html()
    );

    let $feeds = $(Crawl.feeds_sel);
    let feed_list = [];
    $feeds.each((i, el) => {
      feed_list.push($(el).html());
    });

    fs.writeFile(this.data_filename, feed_list.join('\n'), (err) => {
      this.emit('page', err, this.data_filename);

      this.next();
    });
  }

  next() {
    if (this.page_no === this.max_page_no) {
      process.exit();
    }

    this.page_no++;
    this.cfg();
    this.run();
  }

  tmp_file():string {
    return path.join(config.tmpdir, this.page_no + TMP_EXT);
  }

  data_file():string {
    return path.join(config.htmldir, this.page_no + DATA_EXT);
  }

  build_url():string {
    // + '&nodup=1' 忽略新浪的筛选
    let page_query = (this.page_no === 1 ? '' : ('&page=' + this.page_no));
    return WEIBO + urlencode(urlencode(this.keywords)) + page_query;
  }

  build_cookie():string {
    let cookies = JSON.parse(fs.readFileSync(config.login).toString()).cookies;
    let cs = [];

    cookies.forEach((cookie) => {
      cs.push(`${cookie.name}=${cookie.value};`);
    });

    return cs.join(' ');
  }
}

module.exports = Crawl;
