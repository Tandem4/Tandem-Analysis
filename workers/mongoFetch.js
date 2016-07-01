var TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
var mongo             = require('mongodb');
var bluebird          = require('bluebird');
var mongoBluebird     = require('mongodb-bluebird');

module.exports = function(callback) {

  mongoBluebird.connect(TANDEM_MONGO_HOST).then( function(db) {

    return db.collection('news').find()
    .then(function(rawArticleBatch) {
      var oneArticle = rawArticleBatch.slice(0,1);
      callback(oneArticle);
    })
    .catch(function(err) {
      console.log("An error occured in mongoFetch", err);
    }).finally(function() {
      db.close();
    });
  });

}
