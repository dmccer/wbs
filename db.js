var mongoose = require('mongoose');
var path = require('path');
var config = require('./config');
var logger = console;

function connect() {
  logger.info('正在连接数据库...');
  mongoose.connect(config.mongodb.url + ':' + config.mongodb.port + '/' + config.mongodb.name, {
    db: { native_parser: true },
    server: {
      poolsize: 5
    },
    user: config.mongodb.user,
    pass: config.mongodb.pass
  });
  logger.info('数据库连接成功...');
}

connect();

mongoose.connection.on('error', function(err) {
  logger.error('数据库连接错误：');
  logger.info(err.message);
});

mongoose.connection.on('disconnected', function() {
  logger.fatal('数据库连接断开，正重连...');
  connect();
  logger.fatal('数据库重新连接成功');
});
