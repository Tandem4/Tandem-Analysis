var async = require('async');
var request = require('request');

var SENTIMENT_URL = process.env.WATSON_SENTIMENT_URL;
var EMOTION_URL   = process.env.WATSON_EMOTION_URL;
var ALCHEMY_KEY   = process.env.TANDEM_ALCHEMY_KEY;
var AlchemyAPI    = require('alchemy-api');
var Alchemy       = new AlchemyAPI(ALCHEMY_KEY);

// *********************************
//  Alchemy Sentiment Analysis
// *********************************

var singleAlchemyRequest = function(row, callback) {

	var queryString = "?url=" +
            row.article_url +
	               "&apikey=" +
	              ALCHEMY_KEY +
	        "&outputMode=json";

	var dataObj = row;

		request(EMOTION_URL + queryString, function (error, response, body1) {
			if(error) {
				console.log("error", error)
			} else {
				var filteredData_E = JSON.parse(body1);
				var emotionObj = {};
				if ( filteredData_E.docEmotions ) {
	          dataObj['anger'] = filteredData_E.docEmotions['anger'] * 100;
	          dataObj['disgust'] = filteredData_E.docEmotions['disgust'] * 100;
	          dataObj['fear'] = filteredData_E.docEmotions['fear'] * 100;
	          dataObj['joy'] = filteredData_E.docEmotions['joy'] * 100;
	          dataObj['sadness'] = filteredData_E.docEmotions['sadness'] * 100;
	          dataObj['_id'] = row._id;
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
								dataObj['score'] = filteredData_S.docSentiment['score'] * 100;
								dataObj['type'] = filteredData_S.docSentiment['type'];;
		            dataObj['_id'] = row._id;
				    } else {
				    	console.log('failed to ping docSentiment proper-like');
				    }
				  }

			    callback(null, dataObj);
				});
      }
	  });
	}

var allAlchemyRequests = function(batch, callback) {
  console.log("BEGINNING allAlchemyRequests");
	async.map( batch,
		         singleAlchemyRequest,
		         function (err, results) {
	             if ( err ) { console.log('An error occurred in AlchemyLanguageService', err); }
	             console.log("FINISHING allAlchemyRequests");
	             callback(results);
	           });
};

module.exports = allAlchemyRequests;
