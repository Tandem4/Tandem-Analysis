var async             = require('async');
var mongo             = require('mongodb-bluebird');
var TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
var Alchemy           = require('../services/AlchemyLanguageService.js');
var TrendsService     = require('../services/trendsService.js');

// remove these modules:
// var Promise = require('bluebird');
// var mongodb = require('mongodb');
// var MongoClient = mongodb.MongoClient;
// var Collection = mongodb.Collection;
// var assert = require('assert');
// var ObjectId = require('mongodb').ObjectID;
// var TANDEM_MONGO_PW = process.env.TANDEM_MONGO_PW;
// var article_urls = [];


module.exports = function() {

  mongo.connect(TANDEM_MONGO_HOST).then(function(db) {
    var news = db.collection('news');
    return news.find()
    .then(function(rawArticleBatch) {
      var oneArticle = rawArticleBatch.slice(0,1);

      console.log('returned from mongo:', oneArticle);
      async.map(oneArticle, Alchemy.sendData, function (err, results) {
        if ( err ) { console.log('An error occurred in mongoFetch async', err); }
        console.log('final results from mongoFetch async: ', results);
        TrendsService(results);
      });
    })
    .catch(function(err) {
      console.log("An error occured in mongoFetch", err);
    });
  });

}


