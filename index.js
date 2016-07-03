var mongoFetch       = require('./workers/mongoFetch.js');
var sentimentService = require('./services/sentimentService.js');
var trendsService    = require('./services/trendsService.js');
var rankingService   = require('./services/rankingService.js');

// Fetch batches of raw article data from Mongo
mongoFetch( function(rawData) {

  // Augment articles with sentiment data from Alchemy
  sentimentService(rawData, function(sentimentData) {

    // Augment articles with trend data from Watson
    trendsService(sentimentData, function() {

      // Re-rank all trends to incorporate new data
      rankingService();
    });
  })
});
