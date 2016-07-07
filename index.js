const mongoFetch       = require('./workers/mongoFetch.js');
const mysql            = require('tandem-db');
const sentimentService = require('./services/sentimentService.js').allSentimentRequests;
const trendsService    = require('./services/trendsService.js').collectAllTrends;
const rankingService   = require('./services/rankingService.js').rankAllTrends;

// Open Mongo connection to fetch batch of raw article data
mongoFetch( function(rawData) {

  // Augment articles with sentiment data from Alchemy
  sentimentService(rawData, function(sentimentData) {

    // Augment articles with trend data from Watson
    trendsService(sentimentData, function(trendCache) {

      // Re-rank all trends to incorporate new data
      rankingService(trendCache, function() {
        console.log("Completed Analysis Service.");

        // close the MySQL connection when finished
        mysql.db.knex.destroy();
      });
    });
  })
});
