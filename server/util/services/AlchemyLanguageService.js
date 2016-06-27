var AlchemyAPI = require('alchemy-api');
var config = require('../../../env/client-config');
var alchemy = new AlchemyAPI(config.LANGUAGE_KEY);
var request = require('request');

var dummyURL = "http://www.telegraph.co.uk/sponsored/health/healthcare-innovation/12179634/innovative-healthcare-products.html?WT.mc_id=tmgspk_listfour_1292_12179634&utm_source=tmgspk&utm_medium=listfour&utm_content=1292&utm_campaign=tmgspk_listfour_1292_12179634";

module.exports = {
	sendData: function(endpoint, rawData) {
	var queryString = "?url=" + 
        rawData.article_url + 
	               "&apikey=" + 
	      config.LANGUAGE_KEY + 
	        "&outputMode=json";

		request(endpoint + queryString, function (error, response, body) {
			if(error) {
				console.log("error", error)
			} else {
				var filteredData = JSON.parse(body);
				if ( filteredData.docEmotions ) {
          var emotionObj = {
            anger: filteredData.docEmotions['anger'] * 100,
            disgust: filteredData.docEmotions['disgust'] * 100,
            fear: filteredData.docEmotions['fear'] * 100,
            joy: filteredData.docEmotions['joy'] * 100,
            sadness: filteredData.docEmotions['sadness'] * 100, 
            _id: rawData._id
          }  
          console.log('emotionObject', emotionObj);
				}
				if ( filteredData.docSentiment ) {
					var sentimentObj = {
						score: filteredData.docSentiment['score'] * 100,
						type: filteredData.docSentiment['type'],
            _id: rawData._id
					}
		       console.log('sentimentObject', sentimentObj);
				}
		  }
		});
	}
}
