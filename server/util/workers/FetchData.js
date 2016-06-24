var dummyData2 = require('../data/dummyData2');
var ServicesController = require('../services/ServicesController');

module.exports = function(){
	// now => take data from datadump || later => gets data from Kani on an interval
	// checks and collects only new data
  var rawdata = dummyData2;
	// sends data to ServicesController to send out
	var toneData = ServicesController.createEmotionGraph(rawdata);
}

