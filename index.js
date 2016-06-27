const async = require('async');
const request = require('request');
const db = require('tandem-db');
const _ = require('underscore');
const API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE = 0.5;

// ************************************
//  Fetch Records from Analysis Service
// ************************************

// 1) Fetch records one at a time from Redis queue
//    'Empty' edge case

var testUrl1 = 'http://www.bbc.com/news/uk-politics-32810887';
var testUrls = [
  'http://www.bbc.com/news/uk-politics-32810887',
  'https://www.washingtonpost.com/world/europe/britain-shocks-the-world-by-voting-to-leave-the-european-union/2016/06/24/3d100f4e-3998-11e6-af02-1df55f0c77ff_story.html',
  'https://www.washingtonpost.com/news/the-fix/wp/2016/06/24/donald-trumps-brexit-press-conference-was-beyond-bizarre/?hpid=hp_hp-top-table-main_fix-trump-newser-1130a-top%3Ahomepage%2Fstory',
  'http://www.bbc.com/sport/cricket/36626699'
];

// *********************************
//  Trend analysis
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
var singleWatsonRequest = function(url, callback) {

  request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedNamedEntities?apikey=' + API_KEY + '&url=' + url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
    if (err) { console.log('An error occurred: ', err); }

    var parsedEntities = filterResults(JSON.parse(body), 'entities');

    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + API_KEY + '&url=' + url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
      if (err) { console.log('An error occurred: ', err); }

      var parsedConcepts = filterResults(JSON.parse(body), 'concepts');

      var trends = parsedEntities.concat(parsedConcepts);
      var article = {
        url: url,
        trends: _.uniq(trends)
      };

      callback(null, article);
    });
  });
};

// Loop through the current batch of urls to append trends for each item
// 1st para in async.each() is the array of items
async.map(testUrls,

  // 2nd param is the function that each item is passed to
  singleWatsonRequest,

  // 3rd param is the function to call when everything's done
  function(err, results){
    if (err) { console.log('An error occurred: ', err); }
    // console.log('completing async map: ', results);
    return results;
  }
);
// TODO:  Add these trends to the article objects, not just the url.
// pass this object off to the ranking algorithm to integrate with preexisting trends.

// *********************************
//  Trend Ranking
// *********************************

// Step One: Input
// Pass in the most recent article object as the argument to the ranking function.
var updateTrends = function(article) {

  // Identify the trends for this article.
  var newTrends = article.trends;

  // Step Two: Get Existing Trends
  // Query the db for all trends, save to a collection (object?).
  // (Am I doing multiple read/writes this way?  For each article? Can this be less expensive?  Can I use a hash table?)
  db.Trends.fetch()
  .then(function(allTrends) {

    // a single trend:
    console.log(allTrends.models[0].attributes);

    // grab the names of all existing trends
    var existingTrends = allTrends.models.map( function(model) {
      return model.attributes.trend_name;
    });

    // Step Three: Update Trends Collection
    // For each new trend:
    for (var trend in newTrends) {

      // Check and see if its name exists in the trends collection.
      if (_.contains(existingTrends, trend)) {

        // If it does, find that model in the allTrends collection
        // update its updated_at and article_count fields
        allTrends.findWhere( { 'trend_name': trend } )
        .then( function(trendToUpdate) {
          trendToUpdate.updated_at = Date.now();
          trendToUpdate.article_count++;
        });
      } else {

        // If it does not, add a new trend to this collection, setting article_count to 1, rank to null
        allTrends.add({
          trend_name: trend,
          created_at: Date.now(),
          updated_at: Date.now(),
          rank: null,
          article_count: 1
        });
      }
    }

    return allTrends;
  });
}

// returns the updated collection of trends
var updatedTrends = updateTrends({});

// Step 4: Re-rank Each Trend
//
// Write a ranking algorithm that handles one trend record.
// Once all trends for this article have been incorporated into the collection,
// Re-calculate the 'rank' field for all trends in the collection.
var rankTrend = function(trend) {
  var trendCount = updatedTrends.length;

  // - We need to know the number of trends total
  // - Trend importance should be weighted by its updated_at date, and exhibit half-life decay
  // - Trend importance should also be weighted by article count, but updated_at should have heavier weight

  // Exponential Decay:  y = a(1 - r)^t
  var a = trendCount; // initial amount, The number of trends
  var r = 0.5;        // decay rate r = .5 (half life)
  var t = (Date.now() - trend.updatedAt)/24;  //time (when t is 24hr, y is .5y) 24hr = 1 unit

  // also
  // y = originalAmount / 2^t, t being number of intervals

  // first we want to sort by date
  var rankBasedOnTime = a * Math.pow(1 - r, t);

  // for every article, increment by a certain percentage
  // the actual value of this will depend on what the ranks look like
}

// Each trend will be filtered through and have its rank field reassigned to an updated value.
for (var trend in updatedTrends) {
  rankTrend(trend);
}


// Step 5: Output: Update three tables.
// At this point, we need to send our 1) updated trend collection and 2) new article back to MySQL.
// Also: we need to make sure there's a record in the join table for each article-trend relationship added.
db.Trends.set(updatedTrends);
db.Articles.set(article);
db.article_trend.set(); //? join table in bookshelf?
