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

// TODO:  load a few of these into the db with the seed file to work with initially
var redisObject = {
    emotionObject:  {
      anger: 44.8812,
      disgust: 39.0578,
      fear: 60.339,
      joy: 2.7489,
      sadness: 10.0003,
      _id: '576e0fcb1a97e5ae1d450a72'
    },
    sentimentObject: {
      type: 'positive',
      _id: '576e0fcb1a97e5ae1d450a72'
    },
    rawData: {
      "pub_name": "telegraph",
      "pub_url": "http://www.telegraph.co.uk",
      "title": "Creating a healthier world",
      "article_url": "http://www.bbc.com/sport/cricket/36626699",
      "image_url": "http://www.telegraph.co.uk/content/dam/spark/Spark%20Distribution%20images/GSK-laborator-small.jpg",
      "article_date": "2016-06-24T15:17:19-07:00",
      "article_summary": "Creating a healthier world",
      _id: '576e0fcb1a97e5ae1d450a72'
    }
  };

// move nested properties into first-level properties and consolidate duplicates
var consolidateObject = function(obj) {
  var parentProps = ['rawData', 'emotionObject', 'sentimentObject'];

  parentProps.forEach( function(parentProp) {
    for (var prop in obj[parentProp]) {
      obj[prop] = obj[parentProp][prop];
    }
    delete obj[parentProp];
  });

  return obj;
};

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
var singleWatsonRequest = function(articleObj, callback) {

  request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedNamedEntities?apikey=' + API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
    if (err) { console.log('An error occurred: ', err); }

    var parsedEntities = filterResults(JSON.parse(body), 'entities');

    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + API_KEY + '&url=' + articleObj.article_url + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
      if (err) { console.log('An error occurred: ', err); }

      var parsedConcepts = filterResults(JSON.parse(body), 'concepts');

      var trends = parsedEntities.concat(parsedConcepts);

      articleObj.trends = _.uniq(trends)

      // return articleObj;
      callback(articleObj);
    });
  });
};

// For async batch processing:
// Loop through the current batch of urls to append trends for each item
// 1st para in async.each() is the array of items
// async.map(testUrls,

//   // 2nd param is the function that each item is passed to
//   singleWatsonRequest,

//   // 3rd param is the function to call when everything's done
//   function(err, results){
//     if (err) { console.log('An error occurred: ', err); }
//     // console.log('completing async map: ', results);
//     return results;
//   }
// );

// *********************************
//  Update Trends Table
// *********************************
// How to optimize for efficiency: Am I doing multiple read/writes this way?  For each article? Can this be less expensive?  Can I use a hash table/cache?

// // Fetch existing trends and incorporate new trends from the current article object
var incorporateNewTrends = function(articleWithTrends) {

//   // Query the db for all trends
  db.Trends.fetch()
  .then(function(allTrends) {

    // grab the names of all existing trends
    var existingTrends = allTrends.models.map( function(model) {
      return model.attributes.trend_name;
    });


    // TODO:  async map instead of forEach? callback would be ranking algorithm
    // For each new trend:
    articleWithTrends.trends.forEach( function(trend) {

      // Check and see if its name exists in the trends collection.
      if (_.contains(existingTrends, trend)) {

        // If it does, update its updated_at field
        db.Trend.where({trend_name: trend}).save(null, {patch: true})
        .then(function () {
          console.log('Updated trend: ', trend);
        }).catch( function(err) {
          console.log('There was an error: ', err);
        });

      // if it's a brand new trend, create a new Trend record
      } else {
        db.Trend.forge({ 'trend_name': trend }).save()
        .then( function() {
          console.log('New trend added: ', trend);
        }).catch( function(err) {
          console.log('There was an error: ', err);
        });
      }

    });
  });
}

// *********************************
//  Trend Ranking
// *********************************

var rankSingleTrend = function(trend) {

};
// // Step 4: Re-rank Each Trend
// //
// // Write a ranking algorithm that handles one trend record.
// // Once all trends for this article have been incorporated into the collection,
// // Re-calculate the 'rank' field for all trends in the collection.
// var rankTrend = function(trend) {
//   var trendCount = updatedTrends.length;

//   // - We need to know the number of trends total
//   // - Trend importance should be weighted by its updated_at date, and exhibit half-life decay
//   // - Trend importance should also be weighted by article count, but updated_at should have heavier weight

//   // Exponential Decay:  y = a(1 - r)^t
//   var a = trendCount; // initial amount, The number of trends
//   var r = 0.5;        // decay rate r = .5 (half life)
//   var t = (Date.now() - trend.updatedAt)/24;  //time (when t is 24hr, y is .5y) 24hr = 1 unit

//   // also
//   // y = originalAmount / 2^t, t being number of intervals

//   // first we want to sort by date
//   var rankBasedOnTime = a * Math.pow(1 - r, t);

//   // for every article, increment by a certain percentage
//   // the actual value of this will depend on what the ranks look like
// }

// // Each trend will be filtered through and have its rank field reassigned to an updated value.
// for (var trend in updatedTrends) {
//   rankTrend(trend);
// }


// // Step 5: Output: Update three tables.
// // At this point, we need to send our 1) updated trend collection and 2) new article back to MySQL.
// // Also: we need to make sure there's a record in the join table for each article-trend relationship added.
// db.Trends.set(updatedTrends);
// db.Articles.set(article);
// db.article_trend.set(); //? join table in bookshelf?

// 1)
// prepare the current article for trend analysis:
var articleToProcess = consolidateObject(redisObject);
console.log('articleToProcess: ', articleToProcess);

// 2)
// append watson-identified trends to the current article:
singleWatsonRequest(articleToProcess, function(articleWithTrends){
  console.log('articleWithTrends: ', articleWithTrends);

  // 3)
  // add new or update preexisting trend records:
  incorporateNewTrends(articleWithTrends, function() {
    console.log('this is a callback');
  });

  // may need to use async map with a callback here.




});



// close the database connection when finished
// }).finally( function() {
//   // db.bookshelf.knex.destroy();
// });
