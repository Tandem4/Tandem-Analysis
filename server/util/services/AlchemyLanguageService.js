var AlchemyAPI = require('alchemy-api');
var config = require('../../../env/client-config');
var alchemy = new AlchemyAPI(config.LANGUAGE_KEY);

var dummyURL = "http://www.telegraph.co.uk/sponsored/health/healthcare-innovation/12179634/innovative-healthcare-products.html?WT.mc_id=tmgspk_listfour_1292_12179634&utm_source=tmgspk&utm_medium=listfour&utm_content=1292&utm_campaign=tmgspk_listfour_1292_12179634";

module.exports = {
	sendData: function(url) {
		alchemy.emotion(dummyURL, {}, function(err, lang) {
			if(err) {
				throw err;
			} else {
				//var sentiment = lang.docSentiment;
				console.log('lang', lang);
				//console.log('sentiment', sentiment);
			}
		})
	}
}
