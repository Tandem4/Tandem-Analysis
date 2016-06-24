var Tone = require('../../WatsonApi/ToneAnalyzer.js');

module.exports = {


	// 1) Trend Over Time
	// Needs Google Trends API
  createTrendOverTime: function(textData) {
    
  },
	// 2) Overall Favorabiltiy 
	// ???
	createOverallFavorability: function(textData) {

	},
	// 3) Emotion Graph
	// Watson Tone Analyzer
	createEmotionGraph: function(textData) {
   console.log(textData, 'Expect text to be an article');
   return Tone.sendData(textData);

	},
	// 4) News Site Favorability 
	// Watson ...
  createSiteFavorability: function(req, res) {

  }
}
