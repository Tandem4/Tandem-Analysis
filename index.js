var mongoFetch       = require('./util/workers/mongoFetch.js');
var sentimentService = require('./util/services/AlchemyLanguageService.js');
var trendsService    = require('./util/services/trendsService.js');
var rankingService   = require('./util/services/rankingService.js');

mongoFetch( function(rawData) {
  sentimentService(rawData, function(sentimentData) {
    trendsService(sentimentData, function() {
      rankingService();
    });
  })
});
