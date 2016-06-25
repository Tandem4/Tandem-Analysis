
module.exports = {
	// 1) Add General Tone
  createGeneralTone: function(textObj) {
  	var generalTone = parseInt(textObj['anger']) + parseInt(textObj['disgust']) + parseInt(textObj['fear']) + parseInt(textObj['happiness']) + parseInt(textObj['sadness']);
  	textObj['generalTone'] = generalTone/5; 
  	console.log('expect generalTone in textObj', textObj);
  }
}
