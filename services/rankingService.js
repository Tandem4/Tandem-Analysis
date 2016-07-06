const async = require('async');
const db    = require('tandem-db');

var rankAllTrends = function(trendCache, finalCallback) {
  // console.log("Beginning rankAllTrends with ", trendCache);

  var trendCount = Object.keys(trendCache).length;
  var currentTime = Date.now();

  async.each(trendCache,

            rankSingleTrend.bind(null, trendCount, currentTime),

            function(err) {
              if (err) { console.log("An error occurred in rankAllTrends: ", err); }
              finalCallback();
            }
  );
};

// for all trends new and existing, compute a rank based on attributes of the articles associated with it
var rankSingleTrend = function(trendCount, currentTime, trend, doneCallback) {

  // ensure that either version of the conditional completes before moving on to calculateRank
  async.map( [trend],

      // pass trend to calculateRank via this wrapper function
      // conditionally executes createTrendAndSave if necessary, otherwise just passes thru to calculateRank
      function(trend, doneCallback) {

        // if true, it's an existing trend
        if (!!trend.id) {
          checkForUpdates(trendCount, currentTime, trend, doneCallback);

        // if false, it's a new trend
        } else {
          createTrendAndSave(trendCount, currentTime, trend, doneCallback);
        }
      },

    function(err, rank) {
      // console.log("Calculated rank " + rank + " for trend ", trend);

      db.Trend.where({id: trend.id}).save({rank: rank || null}, {patch: true})
      .then( function(trend) {
        doneCallback(err, trend);
      });
  });
};

// helper method for rankSingleTrend conditional
var createTrendAndSave = function(trendCount, currentTime, trend, doneCallback) {
  console.log("CREATING A NEW TREND RECORD FOR ", trend);
  db.Trend.forge({ 'trend_name': trend.trend_name }).save()
  .then( function(trendModel) {

    // grab the id from the newly created trend model
    trend.id = trendModel.attributes.id;

    // create an entry in the join table
    trend.article_ids.forEach( function(article_id) {
      trendModel.articles().attach(article_id);
    });

    calculateRank(trendCount, currentTime, trend, doneCallback);
  });
};

// check whether an existing trend has new articles to add
var checkForUpdates = function(trendCount, currentTime, trend, doneCallback) {
  console.log("CHECKING FOR UPDATES ", trend);

  // if there are new articles to add, fetch the Trend model to create a join table entry
  if (trend.article_ids) {
    db.Trend.forge({ 'id': trend.id }).fetch()
    .then( function(trendModel) {
      console.log("FETCHED ", trendModel)

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
    });

  //  otherwise just recalculate rank
  } else {
    calculateRank(trendCount, currentTime, trend, doneCallback);
  }
}

// helper method for rankSingleTrend
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

    // create a ranking value for each article within this trend, then sum them
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

    doneCallback(null, sum);
  });
};

module.exports = rankAllTrends;
