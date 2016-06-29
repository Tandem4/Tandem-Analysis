var AlchemyAPI = require('alchemy-api');
var async = require('async');
var config = require('../../../env/client-config');
var alchemy = new AlchemyAPI(config.LANGUAGE_KEY);
var request = require('request');

var dummyURL = "http://www.telegraph.co.uk/sponsored/health/healthcare-innovation/12179634/innovative-healthcare-products.html?WT.mc_id=tmgspk_listfour_1292_12179634&utm_source=tmgspk&utm_medium=listfour&utm_content=1292&utm_campaign=tmgspk_listfour_1292_12179634";

module.exports = {
	sendData: function(row, callback) {
		//console.log('row', row);
	var queryString = "?url=" + 
        row.article_url + 
	               "&apikey=" + 
	      config.LANGUAGE_KEY + 
	        "&outputMode=json";

	var dataObj = row;

		request(config.EMOTION_URL + queryString, function (error, response, body1) {
			if(error) {
				console.log("error", error)
			} else {
				var filteredData_E = JSON.parse(body1);
				var emotionObj = {};
				//console.log('filtered data', filteredData_E);
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

	      request(config.SENTIMENT_URL + queryString, function (error, response, body2) {
				  if(error) {
					  console.log("error", error)
				  } else { 
					  var filteredData_S = JSON.parse(body2); 
					  var sentimentObj = {};
				  	if ( filteredData_S.docSentiment ) {
								dataObj['score'] = filteredData_S.docSentiment['score'] * 100;
								dataObj['type'] = filteredData_S.docSentiment['type'];;
		            dataObj['_id'] = row._id;
	            //console.log('should return dataObj', dataObj);			      
				    } else {
				    	console.log('failed to ping docSentiment proper-like');
				    }  
            // dataArr.push(dataObj);
				  }

			    callback(null, dataObj); 
			    // pass on to nicole
				});
      }
	  });
	}
}


