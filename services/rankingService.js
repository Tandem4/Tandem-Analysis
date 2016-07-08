const async = require('async');
const db    = require('tandem-db');

// **********************************************************************************************
//  Analysis Pipeline Step 4:
//
//  Recalculate ranks for all trends.  Rankings are based on:
//      1) the number of articles associated with this trend
//      2) the age of those articles
//      3) the number of publications in which this trend has been featured
//
//  Function Cascade:
//  -----------------
//  `rankAllTrends` receives a cache of trend objects
//      each trend is sent to `routeTrend`, which directs to either:
//        `createTrendAndSave`
//          - or -
//        `checkForUpdates`
//        (if necessary, both of these will pass thru `createJoinTableAssociations`)
//          All trends end up in `calculateRank`
//   final callback of `rankAllTrends` returns to index.js to terminate db connection
//
// **********************************************************************************************

var rankAllTrends = function(trendCache, finalCallback) {

  console.log("________________________________________________________________");
  console.log("Beginning rankAllTrends");
  console.log("________________________________________________________________");

  // pass these shared variables thru to calculateRank
  var trendCount = Object.keys(trendCache).length;
  var currentTime = Date.now();

  // Given a batch of all existing and new trends, recalcuate each trend's rank
  async.each(trendCache,

            routeTrend.bind(null, trendCount, currentTime),

            function(err) {
              if (err) { console.log("An error occurred in rankAllTrends: ", err); }

              // All ranking complete: return to index.js to close db connection
              finalCallback();
            }
  );
};

// Iterator for rankAllTrends: Decide whether to process this trend as new or existing
var routeTrend = function(trendCount, currentTime, trend, doneCallback) {

  // if true, it's an existing trend
  if (!!trend.id) {
    checkForUpdates(trendCount, currentTime, trend, doneCallback);

  // if false, it's a new trend
  } else {
    createTrendAndSave(trendCount, currentTime, trend, doneCallback);
  }
}

// helper method for createOrUpdateTrendRecord
var createTrendAndSave = function(trendCount, currentTime, trend, doneCallback) {
  console.log("CREATING A NEW TREND RECORD FOR ", trend.trend_name);

  // create a new db record for this trend
  db.Trend.forge({ 'trend_name': trend.trend_name }).save()
  .then( function(trendModel) {

    // grab the id from the newly created trend model
    trend.id = trendModel.attributes.id;

    // create any necessary joins before passing to calculateRank
    createJoinTableAssociations(trend, trendModel);
  });
};

// helper method for createOrUpdateTrendRecord
var checkForUpdates = function(trendCount, currentTime, trend, doneCallback) {
  console.log("CHECKING FOR UPDATES ", trend.trend_name);

  // check whether an existing trend has new articles to add
  if (trend.article_ids) {
    db.Trend.forge({ 'id': trend.id }).fetch()
    .then( function(trendModel) {

      // create any necessary joins before passing to calculateRank
      createJoinTableAssociations(trend, trendModel);
    });

  //  otherwise just pass to calculateRank directly
  } else {
    calculateRank(trendCount, currentTime, trend, doneCallback);
  }
};

// helper method for createTrendAndSave and checkForUpdates
var createJoinTableAssociations = function(trend, trendModel) {

  async.each(trend.article_ids,

            // create an entry in the join table for each article in the list
            function(article_id, callback) {
              trendModel.articles().attach(article_id)
              .then(function() {
                callback();
              });
            },

            // then recalculate rank
            function() {
              calculateRank(trendCount, currentTime, trend, doneCallback);
            }
  );
};

// helper method for createJoinTableAssociations and checkForUpdates
var calculateRank = function(trendCount, currentTime, trend, doneCallback) {

  // Pull the dates and pub_id of all articles associated with this trend
  db.Trend.where('id', trend.id).fetch({withRelated: ['articles']})
  .then( function(results) {

    var articlesForThisTrend = results.relations.articles.models.map( function(article) {
      return {
        pub_id: article.attributes.pub_id,
        article_date: article.attributes.article_date
      };
    });

    var publications = {};

    // create a ranking value for each article within this trend based on time passed since publication
    var ranks = articlesForThisTrend.map( function(article) {

      // this will combine duplicates publications, if any
      publications[article.pub_id] = true;

      //  Exponential Decay:  y = a(1 - r)^t
      //  rank = initialAmount * Math.pow(1 - decayRate, timePassed);
      //  use 24hrs as our time unit
      var ms   = currentTime - Date.parse(article.article_date);
      var s    = ms / 1000;
      var min  = s / 60;
      var h    = min / 60;
      var d    = h / 24;

      return trendCount * Math.pow(1 - 0.5, d);
    });

    var sum = ranks.reduce( function(memo, next) {
      return memo + next;
    }, 0);

    // Cross-publication articles should be of a higher value than articles originating from the same publication
    sum *= (Object.keys(publications).length * .25);

    console.log("Calculated rank " + sum + " for trend ", trend.trend_name);

    // update the db Trend record with the newly calculated rank
    db.Trend.where({id: trend.id}).save({rank: sum || null}, {patch: true})
    .then( function(trend) {

      // return to rankAllTrends
      doneCallback();
    });
  });
};

module.exports = {
  rankAllTrends
};
