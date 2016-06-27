var ServicesController = require('../services/ServicesController');
var config = require('../../../env/client-config');

var dummyData = require('../data/dummyData');
var dummyData2 = require('../data/dummyData2');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
//var FindNews = require('./FindNews');

var findNews = function(db, callback) {
  var news = db.collection('news').find();
  news.each(function(err, rawdata) {
    assert.equal(err, null);
    if (err) {
      console.log('An error occured at findNews', err);
    }
    if ( rawdata !== null ) {
      callback(rawdata);
    } 
  });
}


module.exports = function(){

  // test with dummy data
  // var rawdata = dummyData;
  // ServicesController.createSentiment(rawdata);
  // ServicesController.createEmotion(rawdata);
  

  MongoClient.connect(config.MONGO_URL, function(err, db) {
    assert.equal(null, err);
    if (err) {
      console.log('An error occured on MongoClient connection', err);
    } else {
      findNews(db, function(rawdata){
        //console.log('our raw data url', rawdata.article_url);
        ServicesController.createSentiment(rawdata);
        ServicesController.createEmotion(rawdata);

        db.close();
      })
      
    }
  })

}

