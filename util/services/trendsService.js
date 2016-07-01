const async = require('async');
const request = require('request');
const db = require('tandem-db');
const _ = require('underscore');
const WATSON_API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE = 0.5;

// *********************************
//  Trend analysis per article
// *********************************
// Rate limit: 1000 API calls per day, 500 records max

// helper method for singleWatsonRequest
var filterResults = function(results, prop) {
  return results[prop].filter( function(item) {
    return parseFloat(item.relevance) > RELEVANCE;
  }).map( function(filtered) {
    return filtered.text.toLowerCase();
  });
};

// Query Watson API for entities & concepts and attach to an article
var singleWatsonRequest = function(articleObj, doneCallback) {
  request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedNamedEntities?apikey=' + WATSON_API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
    if (err) { console.log('An error occurred in singleWatsonRequest: ', err); }

    var parsedEntities = filterResults(JSON.parse(body), 'entities');

    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + WATSON_API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
      if (err) { console.log('An error occurred in singleWatsonRequest: ', err); }

      var parsedConcepts = filterResults(JSON.parse(body), 'concepts');

      var trends = parsedEntities.concat(parsedConcepts);

      articleObj.trends = _.uniq(trends)

      // find the publication to which this article belongs
      db.Publication.where({pub_name: articleObj.pub_name}).fetch()
      .then( function(matchedPub) {
        // add our new article to the db before callback
        db.Article.forge({
          "_id": '' + articleObj._id,
          "title": articleObj.title,
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
        }).save({"pub_id": null})

        .then( function() {
          doneCallback(null, articleObj);
        });
      });
    });
  });
};

// For async batch processing:
// Loop through the current batch of articles to append trends for each one
var collectWatsonTrends = function(batch, callback) {

  // 1st para in async.each() is the array of items
  async.map(batch,

    // 2nd param is the function that each item is passed to
    singleWatsonRequest,

    // 3rd param is the function to call when everything's done
    function(err, results){
      if (err) { console.log('An error occurred in collectWatsonTrends: ', err); }
      incorporateAllNewTrends(results, callback);
    }
  );
};

// *********************************
//  Update Trends Table
// *********************************
// How to optimize for efficiency: Am I doing multiple read/writes this way?  For each article? Can this be less expensive?  Can I use a hash table/cache?

// Write a new trend record to the db
var createSingleTrend = function(newTrend, doneCallback) {
  db.Trend.forge({ 'trend_name': newTrend }).save()
  .then( function(trend) {
    console.log('Created: ', trend.attributes);
    doneCallback(null, true);
  }).catch( function(err) {
    console.log('There was an error in createSingleTrend: ', err);
  });
};

// Update the updated_at field of an existing trend record
var updateSingleTrend = function(existingTrend, doneCallback) {
  db.Trend.where({trend_name: existingTrend}).save(null, {patch: true})
  .then( function(trend) {
    console.log('Updated: ', trend.attributes);
    doneCallback(null, true);
  }).catch( function(err) {
    console.log('There was an error in updateSingleTrend: ', err);
  });
};

// Given a batch of articles with Trends that need to be added or updated
var incorporateAllNewTrends = function (articlesWithTrends, rankingCallback) {

  // BUG:  if there are duplicates trends between two articles in this batch, it may be added twice

  // Each of these will need access to the existing trends in the database
  // Make a call here once to share
  db.Trends.fetch().then(function(allTrends) {

    // save the names of all existing trends into an array
    var existingTrends = allTrends.models.map( function(model) {
      return model.attributes.trend_name;
    });

    // For every article in articlesWithTrends
    async.each( articlesWithTrends,

      // 2nd param is the function that each item is passed to (second parameter?)
      function(article, callback) {
        console.log('beginning asyncMap in incorporateAllNewTrends with: ', article)

        // for every trend belonging to this article
        async.each( article.trends,

          // either add or update a trend record in the db
          function(singleTrend, callback) {
            if (_.contains(existingTrends, singleTrend)) {
              updateSingleTrend(singleTrend, callback);
            } else {
              createSingleTrend(singleTrend, callback);
            }
          },

          function(err) {
            if (err) { console.log('An error occurred in incorporateAllNewTrends: ', err); }
            console.log('completing async.map in incorporateAllNewTrends.');
            callback();
          }
        );
      },

      // 3rd param is the function to call when everything's done
      function(err){
        if (err) { console.log('There was an error: ', err); }
        console.log('we made it to the end of incorporateAllNewTrends.');
        rankingCallback();
      }
    );
  });
};

// Then for each article in that collection
// run through its newly collected trends
// and either add or update the trend table
// Then re-rank all Trends given the new information
module.exports = collectWatsonTrends;
