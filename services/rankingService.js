const async = require('async');
const db = require('tandem-db');
const _ = require('underscore');

var rankSingleTrend = function(trendCount, currentTime, trend, callback) {

  // 1) Pull the dates of all articles associated with that trend, also publication id
  db.Trend.where('id', trend.id).fetch({withRelated: ['articles']})
  .then( function(results) {
    var articlesForThisTrend = results.relations.articles.models.map( function(article) {
      return {
        pub_id: article.attributes.pub_id,
        article_date: article.attributes.article_date
      };
    });
    console.log('ARTICLES FOR THIS TREND: ', articlesForThisTrend.length, articlesForThisTrend);

    var publications = [];

    var ranks = articlesForThisTrend.map( function(article) {

      if (!_.contains(publications, article.pub_id)) {
        publications.push(article.pub_id);
      }

      //  Exponential Decay:  y = a(1 - r)^t
      //  rank = initialAmount * Math.pow(1 - decayRate, timePassed);
      //  use 24hrs as our time unit
      var ms = currentTime - Date.parse(article.article_date);
      var s = ms / 1000;
      var min = s / 60;
      var h = min / 60;
      var rank = trendCount * Math.pow(1 - 0.5, h);
      return rank;
    });

    var sum = ranks.reduce( function(memo, next) {
      return memo + next;
    }, 0);

    // Cross-publication articles should be of a higher value than articles originating from the same publication
    sum *= publications.length * 1.25;

    db.Trend.where({id: trend.attributes.id}).save({rank: sum || null}, {patch: true})
    .then(function (trend) {
      callback();
    }).catch( function(err) {
      console.log('There was an error in rankSingleTrend: ', err);
    });

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
