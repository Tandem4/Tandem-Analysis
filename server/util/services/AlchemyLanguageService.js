var AlchemyAPI = require('alchemy-api');
var config = require('../../../env/client-config');
var alchemy = new AlchemyAPI(config.LANGUAGE_KEY);
var request = require('request');

var dummyURL = "http://www.telegraph.co.uk/sponsored/health/healthcare-innovation/12179634/innovative-healthcare-products.html?WT.mc_id=tmgspk_listfour_1292_12179634&utm_source=tmgspk&utm_medium=listfour&utm_content=1292&utm_campaign=tmgspk_listfour_1292_12179634";

module.exports = {
	sendData: function(endpoint, url) {
	var queryString = "?url=" + 
	                 dummyURL + 
	               "&apikey=" + 
	      config.LANGUAGE_KEY + 
	        "&outputMode=json";

		request(endpoint + queryString, function (error, response, body) {
			if(error) {
				console.log("error", error)
			} else {
        console.log('body:', body['docEmotions']);
				if ( body.docEmotions ) {
          var emotionObject = {
            anger: body.docEmotions['anger'] * 100,
            disgust: body.docEmotions['disgust'] * 100,
            fear: body.docEmotions['fear'] * 100,
            joy: body.docEmotions['joy'] * 100,
            sadness: body.docEmotions['sadness'] * 100,
          }  
          console.log('emotionObject', emotionObject);
				}
				if ( body.docSentiment ) {
					var sentimentObj = {
						score: body.docSentiment['score'] * 100,
						type: body.docSentiment['type']
					}
					console.log('sentimentObject', emotionObject);
				}
		  }
		});
	}
}
