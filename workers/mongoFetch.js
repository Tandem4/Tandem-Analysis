const TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
const mongo             = require('mongodb');
const bluebird          = require('bluebird');
const mongoBluebird     = require('mongodb-bluebird');
const async             = require('async');

const mongoCollection = 'newnews';

// *********************************************************************
//  Analysis Pipeline Step 1:
//
//  Fetch scraped article data for sentiment, trend and ranking analysis
// *********************************************************************

var mongoFetch = function(sentimentCallback) {

  mongoBluebird.connect(TANDEM_MONGO_HOST).then( function(db) {

    return db.collection(mongoCollection).find()
    .then(function(rawArticleBatch) {

      var articles = rawArticleBatch;

      async.each(articles,

                deleteFromMongo.bind(null, db),

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
};

// helper method for mongoFetch
var deleteFromMongo = function(dbConnection, article, doneCallback) {
  dbConnection.collection(mongoCollection)
  .remove(article)
  .then(function() {
    doneCallback();
  });
};

module.exports = mongoFetch;
