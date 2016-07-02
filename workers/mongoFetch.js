var TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
var mongo             = require('mongodb');
var bluebird          = require('bluebird');
var mongoBluebird     = require('mongodb-bluebird');

module.exports = function(callback) {

  mongoBluebird.connect(TANDEM_MONGO_HOST).then( function(db) {

    return db.collection('newnews').find()
    .then(function(rawArticleBatch) {
      // db.collection('news').remove( { } );
      var articles = rawArticleBatch.slice(0,100);
      callback(articles);
    })
    .catch(function(err) {
      console.log("An error occured in mongoFetch", err);
    }).finally(function() {
      db.close();
    });
  });

}
