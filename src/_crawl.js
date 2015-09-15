let fs = require('fs');
let system = require('system');
let moment = require('moment');
let config = JSON.parse(fs.read('./built/crawl.json').toString());
let page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';

const script_re = /<script(?:\s+[^>]*)?>([\w\W]*?)<\/script\s*>/ig;
const comment_re = /<!--([^]*?)-->/ig;
const line_re = /\n+/g;
const direct_re = /\{"pid"\:"pl_weibo_direct".*"\}/g;

make_req(config.url, config.filename, config.cookie);

function make_req(url, filename, cookie) {
  page.customHeaders = {
    'Cookie': cookie,
  };

  page.open(url, (status) => {
    console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] PHANTOMJS - ' + status + ': ' + JSON.stringify(config));

    let html = page.content;
    // 删除注释
    html = html.replace(comment_re, '');
    // 存储页面 xxx.json.html
    fs.write(filename + '.html', html, 'w');
    // 提取微博列表
    let matched = html.match(direct_re);
    // 存储列表 html 内容 xxx.json
    fs.write(filename, matched[0], 'w');

    phantom.exit();
  });

  page.onResourceError = function(res) {
    console.log('# err - id: ' + res.id + ', url: ' + res.url);
    console.log('##: ' + JSON.stringify(res));
  }

  page.onResourceTimeout = function(res) {
    console.log('# timeout - id: ' + res.id + ', url: ' + res.url);
  }
}
