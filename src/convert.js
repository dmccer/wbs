let iconv = require('iconv-lite');

let s = '%CE%AA%C1%CB%C4%FA%B5%C4%D5%CA%BA%C5%B0%B2%C8%AB%A3%AC%C7%EB%CA%E4%C8%EB%D1%E9%D6%A4%C2%EB';

var buff = new Buffer(unescape(s), 'binary');
var result = iconv.decode(buff, 'gbk');

console.log(result);
