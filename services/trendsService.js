const async   = require('async');
const request = require('request');
const db      = require('tandem-db');
const _       = require('underscore');

// refactor for url + query string
const ENTITY_URL     = process.env.ENTITY_URL;
const CONCEPT_URL    = process.env.CONCEPT_URL;
const WATSON_API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE      = 0.6;

// *********************************
//  Watson Trend Analysis
// *********************************

// helper method for singleTrendRequest
var filterResults = function(results, prop) {
  return results[prop] && results[prop].filter( function(item) {
    return parseFloat(item.relevance) > RELEVANCE;
  }).map( function(filtered) {
    return filtered.text.toLowerCase();
  }) || [];
};

var singleTrendRequest = function(pubData, articleObj, doneCallback) {
  var parsedEntities, parsedConcepts, trends;

  var queryString =    '?apikey=' +
                   WATSON_API_KEY +
                          '&url=' +
           articleObj.article_url +
  '&outputMode=json&maxRetrieve=10';

  request(ENTITY_URL + queryString, function (err, response, body) {
    if (err) { console.log('An error occurred in singleTrendRequest: ', err); }

    parsedEntities = filterResults(JSON.parse(body), 'entities');

    request(CONCEPT_URL + queryString, function (err, response, body) {
      if (err) { console.log('An error occurred in singleTrendRequest: ', err); }

      parsedConcepts = filterResults(JSON.parse(body), 'concepts');

      trends = parsedEntities.concat(parsedConcepts);

      articleObj.trends = _.uniq(trends);

      // find the publication id to which this article belongs
      var pubId = pubData[articleObj.pub_name];

      // save our new article to the db before callback
      db.Article.forge({
        "title"           : articleObj.title.slice(0, 255),
        "frequency_viewed": 0,
        "article_date"    : articleObj.article_date,
        "anger"           : articleObj.anger,
        "disgust"         : articleObj.disgust,
        "fear"            : articleObj.fear,
        "joy"             : articleObj.joy,
        "sadness"         : articleObj.sadness,
        "type"            : articleObj.type,
        "article_summary" : articleObj.article_summary,
        "article_url"     : articleObj.article_url,
        "image_url"       : articleObj.image_url,
      }).save({ "pub_id": pubId })

      .then( function(articleModel) {

        // pass trends from the articleObj to the Model before passing down the pipeline
        articleModel.trends = articleObj.trends;

        doneCallback(null, articleModel);
      });
    });
  });
};

var collectAllTrends = function(batch, callback) {
  console.log("BEGINNING collectAllTrends");

  // fetch and map all publications in advance to pass down to iterator
  db.Publications.fetch().then( function(allPubs) {

    var pubData = allPubs.models.reduce( function (memo, nextModel) {
      memo[nextModel.pub_name] = nextModel.id;
      return memo;
    }, {});

    async.map( batch,
               singleTrendRequest.bind(null, pubData),
               function(err, results){
                 if (err) { console.log('An error occurred in collectAllTrends: ', err); }
                 console.log("BEGINNING incorporateAllNewTrends");
                 incorporateAllNewTrends(results, callback);
               }
    );
  }).catch( function(err) {
    console.log('Something went wrong in collectAllTrends', err);
  });
};

// *********************************
//  Update Trends Table
// *********************************

// Write a new trend record to the db
var createSingleTrend = function(newTrend, articleId, doneCallback) {
  db.Trend.forge({ 'trend_name': newTrend }).save()
  .then( function(trend) {
    trend.articles().attach(articleId);
    doneCallback(null, true);
  }).catch( function(err) {
    console.log('There was an error in createSingleTrend: ', err);
  });
};

// Update the updated_at field of an existing trend record
var updateSingleTrend = function(existingTrend, articleId, doneCallback) {
  db.Trend.where({trend_name: existingTrend}).save(null, {patch: true})
  .then( function(trend) {
    trend.articles().attach(articleId);
    doneCallback(null, true);
  }).catch( function(err) {
    console.log('There was an error in updateSingleTrend: ', err);
  });
};

// Given a batch of articles with Trends that need to be added or updated
var incorporateAllNewTrends = function (articlesModelsWithTrends, rankingCallback) {
  console.log("BEGINNING incorporateAllNewTrends");
  console.log('ARTICLES WITH TRENDS: ', articlesModelsWithTrends);
  db.Trends.fetch().then(function(allTrends) {

    // save the names of all existing trends into an array
    var existingTrends = allTrends.models.map( function(model) {
      return model.attributes.trend_name;
    });

    // for each article, for each trend within that article, update or create a trend record
    async.each( articlesModelsWithTrends,
                function(article, callback) {

                  async.each( article.trends,
                              function(singleTrend, callback) {
                                if (_.contains(existingTrends, singleTrend)) {
                                  updateSingleTrend(singleTrend, article, callback);
                                } else {
                                  createSingleTrend(singleTrend, article, callback);
                                }
                              },
                              function(err) {
                                if (err) { console.log('An error occurred in incorporateAllNewTrends: ', err); }
                                callback();
                              }
                  );
                },
                function(err){
                  if (err) { console.log('There was an error: ', err); }
                  console.log("ENDING collectAllTrends");
                  rankingCallback();
                }
    );
  });
};

module.exports = collectAllTrends;
