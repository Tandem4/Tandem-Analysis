const async   = require('async');
const request = require('request');

const WATSON_SENTIMENT_URL = process.env.WATSON_SENTIMENT_URL;
const WATSON_EMOTION_URL   = process.env.WATSON_EMOTION_URL;
const WATSON_ALCHEMY_KEY   = process.env.TANDEM_ALCHEMY_KEY;
const Alchemy              = require('alchemy-api')(WATSON_ALCHEMY_KEY);

// ********************************************************
//  Analysis Pipeline Step 2:
//
//  Augment scraped articles with Watson sentiment analysis
// ********************************************************

var allSentimentRequests = function(articleBatch, trendsCallback) {

	console.log("________________________________________________________________");
	console.log("Beginning allSentimentRequests");
	console.log("________________________________________________________________");

	async.map( articleBatch,

		         singleSentimentRequest,

		         function (err, results) {
	             if ( err ) { console.log('An error occurred in allSentimentRequests', err); }

	             trendsCallback(results);
	           });
};

// Iterator for allSentimentRequests: append Watson sentiment data to each article
var singleSentimentRequest = function(article, doneCallback) {

	var queryString = "?url=" +
        article.article_url +
	               "&apikey=" +
	       WATSON_ALCHEMY_KEY +
	        "&outputMode=json";

    // API request to Watson emotion analysis
		request(WATSON_EMOTION_URL + queryString, function (error, response, body1) {
			if(error) {
				console.log("error", error)
			} else {
				var filteredData_E = JSON.parse(body1);
				var emotionObj = {};
				if ( filteredData_E.docEmotions ) {
	          article['anger'] = filteredData_E.docEmotions['anger'] * 100;
	          article['disgust'] = filteredData_E.docEmotions['disgust'] * 100;
	          article['fear'] = filteredData_E.docEmotions['fear'] * 100;
	          article['joy'] = filteredData_E.docEmotions['joy'] * 100;
	          article['sadness'] = filteredData_E.docEmotions['sadness'] * 100;
				} else {
					console.log('failed to ping docEmotions proper-like', filteredData_E);
				}

        // API request to Watson sentiment analysis
	      request(WATSON_SENTIMENT_URL + queryString, function (error, response, body2) {
				  if(error) {
					  console.log("error", error)
				  } else {
					  var filteredData_S = JSON.parse(body2);
					  var sentimentObj = {};
				  	if ( filteredData_S.docSentiment ) {

								article['score'] = filteredData_S.docSentiment['score'] * 100;
								article['type'] = filteredData_S.docSentiment['type'];;
				    } else {
				    	console.log('failed to ping docSentiment proper-like');
				    }
				  }

			    doneCallback(null, article);
				});
      }
	  });
};

module.exports = {
	allSentimentRequests
};
