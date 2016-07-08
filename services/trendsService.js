const async   = require('async');
const request = require('request');
const db      = require('tandem-db');

const WATSON_ENTITY_URL  = process.env.WATSON_ENTITY_URL;
const WATSON_CONCEPT_URL = process.env.WATSON_CONCEPT_URL;
const WATSON_API_KEY     = process.env.TANDEM_API_KEY;
const RELEVANCE          = 0.6;

// ****************************************************
//  Analysis Pipeline Step 3:
//
//  Augment scraped articles with Watson trend analysis
// ****************************************************

// Given a batch of articles to be associated with trends
var collectAllTrends = function(batch, rankingCallback) {

  console.log("________________________________________________________________");
  console.log("Beginning collectAllTrends");
  console.log("________________________________________________________________");

  db.Publications.fetch().then( function(allPubs) {

    // create a dictionary of all publications in advance to pass down to iterator singleTrendRequest
    var pubData = createPublicationsObj(allPubs);

    // for each article in this batch, append trend keywords before transfering to incorporateAllNewTrends
    async.map( batch,

               singleTrendRequest.bind(null, pubData),

               function(err, articleModelsWithTrends){
                 if (err) { console.log('An error occurred in collectAllTrends: ', err); }

                 incorporateAllNewTrends(articleModelsWithTrends, rankingCallback);
               }
    );
  }).catch( function(err) {
    console.log('Something went wrong in collectAllTrends', err);
  });
};

// helper method for collectAllTrends
var createPublicationsObj = function(allPubs) {
  return allPubs.models.reduce( function (memo, nextModel) {
    memo[nextModel.attributes.pub_name] = nextModel.attributes.id;
    return memo;
  }, {});
};

// Iterator for collectAllTrends: append Watson trend data to each article
var singleTrendRequest = function(pubData, articleObj, doneCallback) {
  var entityResults, conceptResults, trendsArr, trendsObj, pubId;

  var queryString =    '?apikey=' +
                   WATSON_API_KEY +
                          '&url=' +
           articleObj.article_url +
  '&outputMode=json&maxRetrieve=10';

  // API request to Watson entity analysis
  request(WATSON_ENTITY_URL + queryString, function (err, response, body) {
    if (err) { console.log('An error occurred in singleTrendRequest: ', err); }

    entityResults = filterResults(JSON.parse(body), 'entities');

    // API request to Watson concept analysis
    request(WATSON_CONCEPT_URL + queryString, function (err, response, body) {
      if (err) { console.log('An error occurred in singleTrendRequest: ', err); }

      conceptResults = filterResults(JSON.parse(body), 'concepts');

      // combine the results of both queries into a single collection
      trendsArr = entityResults.concat(conceptResults);

      // find the publication id to which this article belongs for foreign key
      pubId = pubData[articleObj.pub_name] || null;

      // save our new article to the db before callback
      db.Article.forge({
        "title"           : articleObj.title.slice(0, 255),
        "article_date"    : articleObj.article_date,
        "anger"           : articleObj.anger,
        "disgust"         : articleObj.disgust,
        "fear"            : articleObj.fear,
        "joy"             : articleObj.joy,
        "sadness"         : articleObj.sadness,
        "type"            : articleObj.type,
        "score"           : articleObj.score,
        "article_summary" : articleObj.article_summary,
        "article_url"     : articleObj.article_url,
        "image_url"       : articleObj.image_url,
        "frequency_viewed": 0
      }).save({ "pub_id": pubId })

      .then( function(articleModel) {

        // transfer trends from arr to obj to remove potential duplicates
        // also associate w/ this article's id
        trendsObj = createTrendsObj(trendsArr, articleModel);

        // append this collection of trends to the returned Article Model before passing back to collectAllTrends
        articleModel.trends = trendsObj;

        doneCallback(null, articleModel);
      })
      .catch( function(err) {
        console.log('Something went wrong in singleTrendRequest', err);
      });
    });
  });
};

// helper method for singleTrendRequest
var createTrendsObj = function(trendsArr, articleModel) {
  var trendsObj = {};

  trendsArr.forEach( function(trend) {
    trendsObj[trend] = articleModel.attributes.id;
  });

  return trendsObj;
};

// helper method for singleTrendRequest
var filterResults = function(results, prop) {
  return results[prop] && results[prop].filter( function(item) {
    return parseFloat(item.relevance) > RELEVANCE;
  }).map( function(filtered) {
    return filtered.text.toLowerCase();
  }) || [];
};

// *********************************
//  Incorporate Watson Trend Results
// *********************************

// Given a batch of ArticleModels with Trends that need to be added or updated,
// incorporate the new trends into the trendCache before passing to the ranking service
var incorporateAllNewTrends = function (articleModelsWithTrends, rankingCallback) {

  console.log("________________________________________________________________");
  console.log("Beginning incorporateAllNewTrends");
  console.log("________________________________________________________________");

  // query the db for existing trends and create a cache with lookup by trend_name,
  // then add the new trends from the current article batch to this cache
  // before passing off the completed collection to the ranking service
  db.Trends.fetch().then(function(allTrends) {

    var trendCache = buildExistingTrendCache(allTrends);

    trendCache = incorporateEachNewTrend(articleModelsWithTrends, trendCache);

    rankingCallback(trendCache);
  });
};

// helper method for incorporateAllNewTrends
var buildExistingTrendCache = function(allTrends) {
 return allTrends.models.reduce( function(memo, nextModel) {
   memo[nextModel.attributes.trend_name] = nextModel.attributes;
   return memo;
 }, {});
}

// helper method for incorporateAllNewTrends
var incorporateEachNewTrend = function(articleModelsWithTrends, trendCache) {
  articleModelsWithTrends.forEach( function(article) {

    for (var prop in article.trends) {

      // if the trend does not already exist in the cache, add it
      if (!trendCache[prop]) {
        trendCache[prop] = {
          trend_name: prop,
          rank      : null
        };
      }

      // if there are preexisting article associations, append this one to the list
      if (trendCache[prop].article_ids) {
        trendCache[prop].article_ids.push(article.trends[prop]);

      // else establish the article association array, with this as the first entry
      } else {
        trendCache[prop].article_ids = [article.trends[prop]];
      }
    }
  });

  return trendCache;
}

// expose additional methods for testing
module.exports = {
  filterResults,
  incorporateAllNewTrends,
  collectAllTrends
};
