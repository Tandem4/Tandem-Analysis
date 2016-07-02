var TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
var mongo             = require('mongodb');
var bluebird          = require('bluebird');
var mongoBluebird     = require('mongodb-bluebird');
var async             = require('async');

module.exports = function(callback) {

  mongoBluebird.connect(TANDEM_MONGO_HOST).then( function(db) {

    return db.collection('newnews').find()
    .then(function(rawArticleBatch) {

      // only send thru the first 20 articles each hour:
      // 1000 requests/per day
      // each article uses 4 queries (split between 2 api keys, = 500 requests/day)
      // 20 per hour = 480 requests per day
      // var articles = rawArticleBatch.slice(0,20);
      var articles = rawArticleBatch.slice(0,5);
      console.log(articles);
      // query the database and drop specifically these 20
      async.each(articles,
                 function(article, callback) {
                    db.collection('newnews').remove(article)
                    .then(function() {
                      callback();
                    });
                  },
                  function() {
                    callback(articles);
                    db.close();
                  }
      );
    })
    .catch(function(err) {
      console.log("An error occured in mongoFetch", err);
    })

  })

}
