const async   = require('async');
const request = require('request');

const SENTIMENT_URL = process.env.WATSON_SENTIMENT_URL;
const EMOTION_URL   = process.env.WATSON_EMOTION_URL;
const ALCHEMY_KEY   = process.env.TANDEM_ALCHEMY_KEY;
const AlchemyAPI    = require('alchemy-api');
const Alchemy       = new AlchemyAPI(ALCHEMY_KEY);

// *********************************
//  Watson Sentiment Analysis
// *********************************

var allSentimentRequests = function(batch, trendsCallback) {

	async.map( batch,

		         singleSentimentRequest,
		         function (err, results) {
	             if ( err ) { console.log('An error occurred in AlchemyLanguageService', err); }

	             trendsCallback(results);
	           });
};

// Decorator function to append watson sentiment data to article
var singleSentimentRequest = function(article, doneCallback) {

	var queryString = "?url=" +
            article.article_url +
	               "&apikey=" +
	              ALCHEMY_KEY +
	        "&outputMode=json";


		request(EMOTION_URL + queryString, function (error, response, body1) {
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

	      request(SENTIMENT_URL + queryString, function (error, response, body2) {
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

module.exports = allSentimentRequests;
