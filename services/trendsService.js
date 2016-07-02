const async = require('async');
const request = require('request');
const db = require('tandem-db');
const _ = require('underscore');
const WATSON_API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE = 0.6;

// *********************************
//  Watson Trend Analysis
// *********************************

// helper method for singleWatsonRequest
var filterResults = function(results, prop) {
  return results[prop].filter( function(item) {
    return parseFloat(item.relevance) > RELEVANCE;
  }).map( function(filtered) {
    return filtered.text.toLowerCase();
  });
};

var singleWatsonRequest = function(articleObj, doneCallback) {
  var parsedEntities, parsedConcepts, trends;

  request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedNamedEntities?apikey=' + WATSON_API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
    if (err) { console.log('An error occurred in singleWatsonRequest: ', err); }

    parsedEntities = filterResults(JSON.parse(body), 'entities');

    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + WATSON_API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
      if (err) { console.log('An error occurred in singleWatsonRequest: ', err); }

      parsedConcepts = filterResults(JSON.parse(body), 'concepts');

      trends = parsedEntities.concat(parsedConcepts);

      articleObj.trends = _.uniq(trends);
      // console.log(articleObj);
      // find the publication to which this article belongs
      db.Publication.where({pub_name: articleObj.pub_name}).fetch()
      .then( function(matchedPub) {
        var pubId = matchedPub ? matchedPub.attributes.id : null;

        // add our new article to the db before callback
        db.Article.forge({
          // "_id": '' + articleObj._id,
          "title": articleObj.title.slice(0, 255),
          "frequency_viewed": 0,
          "article_date": articleObj.article_date,
          "anger": articleObj.anger,
          "disgust": articleObj.disgust,
          "fear": articleObj.fear,
          "joy": articleObj.joy,
          "sadness": articleObj.sadness,
          "type": articleObj.type,
          "article_summary": articleObj.article_summary,
          "article_url": articleObj.article_url,
          "image_url": articleObj.image_url,
        }).save({ "pub_id": pubId })

        .then( function(articleModel) {

          // pass trends from the articleObj to the Model before passing down the pipeline
          articleModel.trends = articleObj.trends;

          doneCallback(null, articleModel);
        });
      });
    });
  });
};

var collectWatsonTrends = function(batch, callback) {
  console.log("BEGINNING collectWatsonTrends");
  async.map( batch,
             singleWatsonRequest,
             function(err, results){
               if (err) { console.log('An error occurred in collectWatsonTrends: ', err); }
               console.log("BEGINNING incorporateAllNewTrends");
               incorporateAllNewTrends(results, callback);
             }
  );
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
  // console.log('ARTICLES WITH TRENDS: ', articlesModelsWithTrends);
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
                  console.log("ENDING collectWatsonTrends");
                  rankingCallback();
                }
    );
  });
};

module.exports = collectWatsonTrends;
