var ServicesController = require('../services/ServicesController');
var config = require('../../../env/client-config');

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

var Alchemy = require('../services/AlchemyLanguageService')


var article_urls = [];


module.exports = function() {

  // test with dummy data
  // var rawdata = dummyData;
  // ServicesController.createSentiment(rawdata);
  // ServicesController.createEmotion(rawdata);
  
  // var rawDataArr = [];

  mongo.connect(config.MONGO_URL).then(function(db) {
    var news = db.collection('news');
    return news.find()
    .then(function(item) {
      var rawDataArr = item;
      // console.log('returns an array', rawDataArr)
      // rawDataArr.forEach(Alchemy.sendData(data));
      async.map(rawDataArr, Alchemy.sendData, function (err, results) { 
        if ( err ) { 
          console.log('An error occured in async', err); 
        }
        console.log('final results: ', results); 
      });
    })
    .catch(function(err) {
      console.log("An error occured in Mongo", err);
    });
  });

}


