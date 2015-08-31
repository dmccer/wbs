let fs = require('fs');
let system = require('system');
let page = require('webpage').create();
let moment = require('moment');

make_req(system.args[1], system.args[2]);

const script_re = /<script(?:\s+[^>]*)?>([\w\W]*?)<\/script\s*>/ig;
const comment_re = /<!--([^]*?)-->/ig;
const line_re = /\n+/g;
const direct_re = /\{"pid"\:"pl_weibo_direct".*"\}/g;

function make_req(url, filename) {
  page.open(url, (status) => {
    console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] PHANTOMJS - ' + status + ': ' + system.args.reverse().join(' - '));

    let html = page.content;
    html = html.replace(comment_re, '');

    fs.write(filename + '.html', html, 'w');

    var matched = html.match(direct_re);

    fs.write(filename, matched[0], 'w');

    phantom.exit();
  });
}
