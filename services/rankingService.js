const async = require('async');
const db = require('tandem-db');

var rankSingleTrend = function(trendCount, currentTime, trend, callback) {

  //  Exponential Decay:  y = a(1 - r)^t
  //  rank = initialAmount * Math.pow(1 - decayRate, timePassed);
  //  use 24hrs as our time unit
  var ms = currentTime - Date.parse(trend.get("updated_at"));
  var s = ms / 1000;
  var min = s / 60;
  var h = min / 60;
  var rank = trendCount * Math.pow(1 - 0.5, h);

  db.Trend.where({_id: trend.attributes._id}).save({rank: rank}, {patch: true})
  .then(function (trend) {
    callback();
  }).catch( function(err) {
    console.log('There was an error in rankSingleTrend: ', err);
  });
};

var rankAllTrends = function() {
  console.log("BEGINNING rankAllTrends");
  db.Trends.fetch().then( function(allTrends) {
    var trendCount = allTrends.length;
    var currentTime = Date.now();

    async.map(allTrends.models,
              rankSingleTrend.bind(null, trendCount, currentTime),

              // close the database connection when finished
              function() {
                console.log("ENDING rankAllTrends");
                db.db.knex.destroy();
              }
    );
  });
};

module.exports = rankAllTrends;
