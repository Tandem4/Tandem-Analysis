// var ServicesController = require('../services/ServicesController');
// var config = require('../../../env/client-config');

// var dummyData = require('../data/dummyData');
// var dummyData2 = require('../data/dummyData2');

var Promise = require('bluebird');
var mongodb = require('mongodb');
var mongo = require('mongodb-bluebird');
var MongoClient = mongodb.MongoClient;
var Collection = mongodb.Collection;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var async = require('async');

var TANDEM_MONGO_HOST = process.env.TANDEM_MONGO_HOST;
// var TANDEM_MONGO_PW = process.env.TANDEM_MONGO_PW;

var Alchemy = require('../services/AlchemyLanguageService.js')


var article_urls = [];


module.exports = function() {

  // test with dummy data
  // var rawdata = dummyData;
  // ServicesController.createSentiment(rawdata);
  // ServicesController.createEmotion(rawdata);

  // var rawDataArr = [];

  mongo.connect(TANDEM_MONGO_HOST).then(function(db) {
    var news = db.collection('news');
    return news.find()
    .then(function(rawArticleBatch) {
      // var rawDataArr = articleBatch;
      // console.log('returns an array', rawDataArr)
      // rawDataArr.forEach(Alchemy.sendData(data));

      console.log('returned from mongo:', rawArticleBatch);
      // async.map(rawDataArr, Alchemy.sendData, function (err, results) {
      //   if ( err ) {
      //     console.log('An error occured in async', err);
      //   }
      //   console.log('final results: ', results);
      // });
    })
    .catch(function(err) {
      console.log("An error occured in Mongo", err);
    });
  });

}


