let fs = require('fs');
let system = require('system');
let child_process = require('child_process');
let wb = JSON.parse(fs.read('./built/config.json').toString()).wb;

let casper = require('casper').create({
  pageSettings: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
  },
  verbose: true,
  logLevel: "debug"
});

casper.start();

casper.open('http://weibo.com', {
  method: 'get',
  headers: {
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Cookie': 'YF-Ugrow-G0=57484c7c1ded49566c905773d5d00f82; SUB=_2AkMiutPadcNhrAJTnvgXy2njZIlOglG9_I60M0jUJxMxHBt_7D83qlE_tRCKCj2D0ZDnVvxFPYzFcUug8cY47A..; SUBP=0033WrSXqPxfM72wWs9jqgMF55529P9D9WFUiXTHVCKw9XByCqKlNwKV5JpVFPyDwPHQUKec15tt',
    'Host': 'weibo.com',
    'Referer': 'http://passport.weibo.com/visitor/visitor?entry=miniblog&a=enter&url=http%3A%2F%2Fweibo.com%2F&domain=.weibo.com&sudaref=http%3A%2F%2Fpassport.weibo.com%2Fvisitor%2Fvisitor%3Fentry%3Dminiblog%26a%3Denter%26url%3Dhttp%253A%252F%252Fweibo.com%252F%26domain%3D.weibo.com%26sudaref%3Dhttp%253A%252F%252Flogin.sina.com.cn%252Fsso%252Flogout.php%253Fentry%253Dminiblog%2526r%253Dhttp%25253A%25252F%25252Fweibo.com%25252Flogout.php%25253Fbackurl%25253D%2525252F%26ua%3Dphp-sso_sdk_client-0.6.14%26_rand%3D1441160351.4064&ua=php-sso_sdk_client-0.6.14&_rand=1441160428.7742'
  }
});

casper.thenEvaluate((username, password) => {
  document.querySelector('[name="username"]').value = username;
  document.querySelector('[name="password"]').value = password;
}, wb.username, wb.password);

casper.then(function() {
  this.click('[action-type="btn_submit"]');
});

casper.then(function() {
  this.wait(3000, function() {
    this.evaluate(function() {
      window.sinaSSOController.feedBackUrlCallBack({
        "result": false,
        "errno": "4049",
        "reason": "\u4e3a\u4e86\u60a8\u7684\u5e10\u53f7\u5b89\u5168\uff0c\u8bf7\u8f93\u5165\u9a8c\u8bc1\u7801"
      });
    });
  });
});

casper.then(input_code_and_submit);

function input_code_and_submit() {
  let img = this.evaluate(() => {
    return document.querySelector('.code img').src;
  });

  let i = img.lastIndexOf('/');
  let name = img.substring(i + 1);

  let curl = child_process.execFile('wget', [img], null, function(err, stdout, stderr) {
    fs.move(name, './verify.png');
  });

  this.wait(3000, function() {
    console.log('验证码地址: ' + img);

    let verifycode = system.stdin.readLine();

    this.waitFor(function() {
      return this.evaluate(function(verifycode) {
        return document.querySelector('[name="verifycode"]').value = verifycode;
      }, verifycode);
    }, function() {
      fs.remove('./verify.png');

      this.evaluate(function() {
        console.log(document.querySelector('[name="username"]').value);
        console.log(document.querySelector('[name="password"]').value);
        console.log(document.querySelector('[name="verifycode"]').value);
      });

      this.click('[action-type="btn_submit"]');
    });
  });
}

casper.waitForUrl(/weibo\.com\/[a-z0-9A-Z]+\/home/, function() {
  fs.write('./built/login.json', JSON.stringify({
    cookies: casper.page.cookies,
    referer: this.getCurrentUrl()
  }));
});

casper.on('remote.message', function(msg) {});

casper.on('navigation.requested', function(url, navigationType, navigationLocked) {});

casper.run();
