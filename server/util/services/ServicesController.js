var Tone = require('../WatsonApi/ToneAnalyzer.js');
var Alchemy = require('../services/AlchemyLanguageService.js');
var config = require('../../../env/client-config');

module.exports = {
	// 1) Sentiment Analysis
	// Watson ...
	createSentiment: function(rawData) {
    Alchemy.sendData(config.SENTIMENT_URL, rawData.article_url)
	},
	// 2) Emotion Analysis
	// Watson ...
  createEmotion: function(rawData) {
    Alchemy.sendData(config.EMOTION_URL, rawData.article_url)
  },
}
