var mongoFetch       = require('./workers/mongoFetch.js');
var sentimentService = require('./services/AlchemyLanguageService.js');
var trendsService    = require('./services/trendsService.js');
var rankingService   = require('./services/rankingService.js');

mongoFetch( function(rawData) {
  sentimentService(rawData, function(sentimentData) {
    trendsService(sentimentData, function() {
      rankingService();
    });
  })
});
