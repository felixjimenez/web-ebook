var db = require("./index.json");
var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");
var async = require("async");
var data = require("./data.json");

var existIndex = data.map(function (item) {
  return item.index;
});


var config = {
  bookPagePrefix: 'http://it-ebooks.info/book/',
  imgSrcPrefix: 'http://it-ebooks.info',
  saveName: 'data.json'
};
console.log('\nstart crawling book data from it-ebooks.info...');
async.mapLimit(db, 5, function (item, cb) {
  getBookInfo(item, cb);
}, function () {

  fs.writeFileSync(config.saveName, JSON.stringify(data, null, 2));
  console.log('end crawling book!');

});

function getBookInfo(item, cb) {
  if (existIndex.indexOf(item.index) !== -1) {
    cb(null);
  } else {
    var url = config.bookPagePrefix + item.index;
    console.log('crawling:', url);
    request(url, function (err, res, body) {
      if (err) {console.error(err);process.exit(1);}
      var $ = cheerio.load(body);
      var obj = {
        bookName: $('[itemprop="name"]').text(),
        posterSrc: config.imgSrcPrefix + $('.ebook_view img').attr('src'),
        datePublished :$('[itemprop="datePublished"]').text(),
        numberOfPages :$('[itemprop="numberOfPages"]').text(),
        originDlLink: $('[href^="http://filepi"]').attr('href'),
        description: $('[itemprop="description"]').text(),
        originPageLink: url,
        index: item.index,
        customBookName: item.customeBookName,
        createTime: Date.now()
      };
      console.log('info: [' + obj.bookName + '] is ok');
      data.push(obj);
      cb(null, obj);
    });
  }
}