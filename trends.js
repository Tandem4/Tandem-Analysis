const async = require('async');
const request = require('request');
const db = require('tandem-db');
const _ = require('underscore');
const API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE = 0.5;

// ************************************
//  Fetch Records from Analysis Service
// ************************************

// 1) Receive records in batches from Analysis service
var articleBatch = [
  {
    // emotionObject:  {
      anger: 44.8812,
      disgust: 39.0578,
      fear: 60.339,
      joy: 2.7489,
      sadness: 10.0003,
      _id: '576e0fcb1a97e5ae1x450a72',
    // },
    // sentimentObject: {
      type: 'positive',
      // _id: '576e0fcb1a97e5ae1d450a72'
    // },
    // rawData: {
      "pub_name": "USA Today",
      "pub_url": "http://www.telegraph.co.uk",
      "title": "Creating a stealthier world",
      "article_url": "http://www.bbc.com/sport/cricket/36626699",
      "image_url": "http://www.telegraph.co.uk/content/dam/spark/Spark%20Distribution%20images/GSK-laborator-small.jpg",
      "article_date": "2016-06-24T15:17:19-07:00",
      "article_summary": "Creating a healthier world",
      // _id: '576e0fcb1a97e5ae1d450a72'
    // }
  },
  {
    // emotionObject:  {
      anger: 29.8812,
      disgust: 44.0578,
      fear: 40.339,
      joy: 29.7489,
      sadness: 21.0003,
      _id: '576e0fcb1a97e5ae1d450a99',
    // },
    // sentimentObject: {
      type: 'negative',
    //   _id: '576e0fcb1a97e5ae1d450a72'
    // },
    // rawData: {
      "pub_name": "USA Today",
      "pub_url": "http://www.telegraph.co.uk",
      "title": "Destroying a healthier world",
      "article_url": "http://www.bbc.com/news/uk-politics-32810887",
      "image_url": "http://www.telegraph.co.uk/content/dam/spark/Spark%20Distribution%20images/GSK-laborator-small.jpg",
      "article_date": "2016-05-24T15:17:19-07:00",
      "article_summary": "Destroying a healthier world",
    //   _id: '576e0fcb1a97e5ae1d450a72'
    // }
  }
];

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
  console.log('calling singleWatsonRequest with ', articleObj.title);
  request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedNamedEntities?apikey=' + API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
    if (err) { console.log('An error occurred in singleWatsonRequest: ', err); }

    var parsedEntities = filterResults(JSON.parse(body), 'entities');

    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
      if (err) { console.log('An error occurred in singleWatsonRequest: ', err); }

      var parsedConcepts = filterResults(JSON.parse(body), 'concepts');

      var trends = parsedEntities.concat(parsedConcepts);

      articleObj.trends = _.uniq(trends)

      // find the publication to which this article belongs
      db.Publication.where({pub_name: articleObj.pub_name}).fetch()
      .then( function(matchedPub) {

        // add our new article to the db before callback
        db.Article.forge({
          "_id": articleObj._id,
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
        }).save({"pub_id": matchedPub._id})

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
      callback(results);
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
collectWatsonTrends(articleBatch, function(articlesWithTrends) {
  console.log('articlesWithTrends: ', articlesWithTrends);

  // Then for each article in that collection
  // run through its newly collected trends
  // and either add or update the trend table
  // Then re-rank all Trends given the new information
  incorporateAllNewTrends(articlesWithTrends, rankAllTrends);

});