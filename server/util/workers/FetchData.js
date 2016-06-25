var dummyData = require('../data/dummyData');
var dummyData2 = require('../data/dummyData2');
var ServicesController = require('../services/ServicesController');
var config = require('../../../env/client-config');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

module.exports = function(){
  var rawdata = dummyData;
  ServicesController.createSentiment(rawdata);
  ServicesController.createEmotion(rawdata);

  
  // MongoClient.connect(config.MONGO_URL, function(err, db) {
  // 	if (err) {
  // 		console.log('Unable to connect to Mongo', err);
  // 	} else {
  // 		//console.log('Connection established to tandem-mongo');
  //     var collection = db.collection('news');
  //     var data = collection.find();
  //     console.log('rawdata', data);
  // 	 //  for (var i = 0; i < rawdata.length; i++ ) {
		// 		// ServicesController.createSentiment(rawdata[i]);
  // 	 //  }
  // 	  db.close();
  // 	} 
  // });
	// sends data to ServicesController to send out
	
}

