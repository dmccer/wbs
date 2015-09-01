require('../db');

let Processor = require('./processor');
let Crawl = require('./crawl');

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
