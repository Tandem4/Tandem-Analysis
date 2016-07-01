const async = require('async');
const db = require('tandem-db');

// *********************************
//  Trend Ranking
// *********************************
//  Exponential Decay:  y = a(1 - r)^t
//  rank = initialAmount * Math.pow(1 - decayRate, timePassed);

// BUG:  when these get re-ranked, their updated_at field changes
var rankSingleTrend = function(trendCount, currentTime, trend, callback) {

  // use 24hrs as our time unit
  var ms = currentTime - Date.parse(trend.get("updated_at"));
  var s = ms / 1000;
  var min = s / 60;
  var h = min / 60;
  var rank = trendCount * Math.pow(1 - 0.5, h);

  db.Trend.where({_id: trend.attributes._id}).save({rank: rank}, {patch: true})
  .then(function (trend) {
    console.log('Updated rank for trend: ', trend.attributes);
    callback();
  }).catch( function(err) {
    console.log('There was an error in rankSingleTrend: ', err);
  });
};

var rankAllTrends = function() {

  // grab all trends from the db now that they've been updated per the new batch of articles
  db.Trends.fetch().then(function(allTrends) {
    var trendCount = allTrends.length;
    var currentTime = Date.now();

    // For each trend in this collection,
    async.map(allTrends.models,

      // call a ranking function on it
      rankSingleTrend.bind(null, trendCount, currentTime),

      // then close the database connection when finished
      function() {
        db.db.knex.destroy();
      }
    );
  });
};

// // Also: we need to make sure there's a record in the join table for each article-trend relationship added.
// db.article_trend.set(); //? join table in bookshelf?

// TODO: wrap this into module.exports
// TODO: implement changes to schema for tandem-db

// Given a batch of articles to process,
// Append a collection of trends to each article

module.exports = rankAllTrends;
