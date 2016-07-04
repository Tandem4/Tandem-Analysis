const TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
const mongo             = require('mongodb');
const bluebird          = require('bluebird');
const mongoBluebird     = require('mongodb-bluebird');
const async             = require('async');

const mongoCollection = 'news';

module.exports = function(sentimentCallback) {

  mongoBluebird.connect(TANDEM_MONGO_HOST).then( function(db) {

    return db.collection(mongoCollection).find()
    .then(function(rawArticleBatch) {

      // only send thru the first 20 articles each hour:
      // 1000 requests/per day
      // each article uses 4 queries (split between 2 api keys, = 500 requests/day)
      // 20 per hour = 480 requests per day
      // var articles = rawArticleBatch.slice(0,20);
      var articles = rawArticleBatch.slice(0,1);

      // query mongo and drop specifically these 20
      async.each(articles,

                 function(article, doneCallback) {
                    db.collection(mongoCollection).remove(article)
                    .then(function() {
                      doneCallback();
                    });
                  },

                  function() {
                    sentimentCallback(articles);

                    // close the mongo connection when finished
                    db.close();
                  }
      );
    })
    .catch(function(err) {
      console.log("An error occured in mongoFetch", err);
    });
  });
}
