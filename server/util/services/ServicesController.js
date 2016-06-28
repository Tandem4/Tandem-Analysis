var Alchemy = require('../services/AlchemyLanguageService.js');
var config = require('../../../env/client-config');
var async = require('async');

// async.map(urls, AlchemyLanguageService, function(err, results) {
// 		if (err) {
// 			console.log("an error occured in Async Map", err);
// 		}
// 		console.log(results);
// 		return reuslts;
// });

	// // 1) Sentiment Analysis
	// // Watson ...
	// createSentiment: function(rawData) {
 //    Alchemy.sendData(config.SENTIMENT_URL, rawData)
	// },
	// // 2) Emotion Analysis
	// // Watson ...
 //  createEmotion: function(rawData) {
 //    Alchemy.sendData(config.EMOTION_URL, rawData)
 //  },
