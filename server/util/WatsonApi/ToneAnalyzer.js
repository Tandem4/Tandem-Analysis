var watson = require('watson-developer-cloud');
var config = require('../../../env/client-config');
var Tandem = require('../services/TandemAnalyzeService.js');


var tone_analyzer = watson.tone_analyzer({
  username: config.TONE_USERNAME,
  password: config.TONE_PASSWORD,
  version: 'v3',
  version_date: '2016-05-19'
});



module.exports = {
  sendData: function(textData) {
    tone_analyzer.tone({ text: textData }, function(err, tone) {
      if (err) {
        console.log('createEmotionGraph error', err);
      }
      else {
        if(tone.document_tone.tone_categories === undefined) {
          res.status(400).send('createTrendOverTime failed to produce usable data.');
        }

        console.log('Expect anger score to register', tone.document_tone.tone_categories[0].tones);

        var textObj = {
          anger: tone.document_tone.tone_categories[0].tones[0].score*100,
          disgust: tone.document_tone.tone_categories[0].tones[1].score*100,
          fear: tone.document_tone.tone_categories[0].tones[2].score*100,
          happiness: tone.document_tone.tone_categories[0].tones[3].score*100,
          sadness: tone.document_tone.tone_categories[0].tones[4].score*100,
          analytical: tone.document_tone.tone_categories[1].tones[0].score*100,
          confident: tone.document_tone.tone_categories[1].tones[1].score*100,
          tentative: tone.document_tone.tone_categories[1].tones[2].score*100,
    			openness: tone.document_tone.tone_categories[2].tones[0].score*100,
    			conscientiousness: tone.document_tone.tone_categories[2].tones[1].score*100,
    			extraversion: tone.document_tone.tone_categories[2].tones[2].score*100,  
    			agreeableness: tone.document_tone.tone_categories[2].tones[3].score*100, 
    			emotionalRange: tone.document_tone.tone_categories[2].tones[4].score*100 	      
          // userId: req.user.id, 
          // sessionId: req.body.sessionId 
        }
        //console.log(textObj, 'Expect textObj to have emotion-number pairs');
        // create general tone 
        Tandem.createGeneralTone(textObj);
      }
    });
  }
}