let path = require('path');
let child_process = require('child_process');
let fs = require('fs');
let Processor = require('./processor');
let Crawl = require('./crawl');
let config = require('../config');

require('../db');

const CASPERJS = 'casperjs';
const LOGINJS = './built/src/_login.js';
const keywords = '二手车 西安';

// 若已登录，直接使用当前 cookie 信息启动爬虫
if (fs.existsSync(config.login)) {
  startup();
} else {
  let casper = child_process.spawn(CASPERJS, [LOGINJS], {
    stdio: 'inherit'
  });
  casper.on('close', startup);
}

// 启动爬虫
function startup() {
  let crawl = new Crawl(keywords);

  crawl.on('page', (err, filename) => {
    if (err) {
      throw err;
    }

    let processor = new Processor(filename);
    processor.run();
  });

  crawl.run();
}
