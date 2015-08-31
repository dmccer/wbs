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

  static get selector() { return '[node-type="feed_list"]'; }

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
    shell.exec([PHANTOMJS, CRAWLJS, this.url, this.tmp_filename].join(' '), this.callback.bind(this));
  }

  cfg() {
    this.url = this.build_url();
    this.tmp_filename = this.tmp_file();
    this.data_filename = this.data_file();
  }

  callback() {
    let tmp_file_data = require(this.tmp_filename);

    let $ = cheerio.load(tmp_file_data.html, {
      decodeEntities: false
    });
    let $feeds = $(Crawl.selector);
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
    this.page_no++;

    this.cfg();
  }

  tmp_file():string {
    return path.join(config.tmpdir, this.page_no + TMP_EXT);
  }

  data_file():string {
    return path.join(config.htmldir, this.page_no + DATA_EXT);
  }

  build_url():string {
    let page_query = (this.page_no === 1 ? '' : ('&page=' + this.page_no));
    return WEIBO + urlencode(urlencode(this.keywords)) + page_query;
  }
}

module.exports = Crawl;
