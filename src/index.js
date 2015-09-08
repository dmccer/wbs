// require('../db');

let path = require('path');
// let shell = require('shelljs');
let spawn = require('child_process').spawn;
let Processor = require('./processor');
let Crawl = require('./crawl');

// (function() {
//   const PHANTOMJS = 'casperjs';
//   const LOGINJS = './built/src/_login.js';
//
//   let casper = spawn(PHANTOMJS, [LOGINJS], {
//     stdio: 'inherit'
//   });
//
//   casper.on('close', () => {
//     console.log('DDDDDD');
//   });
// })();

(function(keywords) {
  let crawl = new Crawl(keywords);

  crawl.on('page', (err, filename) => {
    if (err) {
      throw err;
    }

    let processor = new Processor(filename);
    processor.run();
  });

  crawl.run();
})('二手车 西安');
