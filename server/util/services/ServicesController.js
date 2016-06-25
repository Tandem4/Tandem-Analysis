var Tone = require('../WatsonApi/ToneAnalyzer.js');
var Alchemy = require('../services/AlchemyLanguageService.js');

module.exports = {
	// 1) Sentiment Analysis
	// Watson ...
	createSentiment: function(rawData) {
   //console.log(rawData, 'Expect text to be article info');
   //return Tone.sendData(rawData);
   return Alchemy.sendData(rawData.article_url)
	},
	// 2) Tone
	// Watson ...
  createSiteFavorability: function(req, res) {

  },
}
