const async   = require('async');
const request = require('request');
const db      = require('tandem-db');

const ENTITY_URL     = process.env.ENTITY_URL;
const CONCEPT_URL    = process.env.CONCEPT_URL;
const WATSON_API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE      = 0.6;

// *********************************
//  Watson Trend Analysis
// *********************************

var collectAllTrends = function(batch, rankingCallback) {
  // console.log("Beginning collectAllTrends with ", batch);

  db.Publications.fetch().then( function(allPubs) {

    // create a dictionary of all publications in advance to pass down to iterator
    var pubData = allPubs.models.reduce( function (memo, nextModel) {
      memo[nextModel.attributes.pub_name] = nextModel.attributes.id;
      return memo;
    }, {});

    // for each article in this batch, append trend keywords and transfer to incorporateAllNewTrends
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

// Decorator function to append watson trend data to article
var singleTrendRequest = function(pubData, articleObj, doneCallback) {
  var parsedEntities, parsedConcepts, trendsArr, trendsObj, pubId;

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
      trendsArr = parsedEntities.concat(parsedConcepts);

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

        // transfer trends to obj to remove potential duplicates and also associate w/ this article's id
        trendsObj = {};
        trendsArr.forEach( function(trend) {
          trendsObj[trend] = articleModel.attributes.id;
        });

        // append these trends to the returned Article Model before passing back to collectAllTrends
        articleModel.trends = trendsObj;
        console.log("NEW TRENDS for one article: ", trendsObj);

        doneCallback(null, articleModel);
      });
    });
  });
};

// helper method for singleTrendRequest
var filterResults = function(results, prop) {
  return results[prop] && results[prop].filter( function(item) {
    return parseFloat(item.relevance) > RELEVANCE;
  }).map( function(filtered) {
    return filtered.text.toLowerCase();
  }) || [];
};


// Given a batch of ArticleModels with Trends that need to be added or updated, passed down from collectAllTrends
var incorporateAllNewTrends = function (articleModelsWithTrends, rankingCallback) {
  // console.log("Beginning incorporateAllNewTrends with ", articleModelsWithTrends);

  // query the db for existing trends and create a cache, then add the new trends to the cache
  db.Trends.fetch().then(function(allTrends) {

    // cache: lookup by trend_name
    var trendCache = allTrends.models.reduce( function(memo, nextModel) {
      memo[nextModel.attributes.trend_name] = nextModel.attributes;
      return memo;
    }, {});

    // add all new trends to the trendCache
    articleModelsWithTrends.forEach( function(article) {

      for (var prop in article.trends) {

        // if the trend already exists in the cache,
        if (!trendCache[prop]) {
          trendCache[prop] = {
            trend_name: prop,
            rank      : null
          };
        }

        // if there are preexisting article associations, append this one to the list
        if (trendCache[prop].article_ids) {
          trendCache[prop].article_ids.push(article.trends[prop]);

        // else establish the article association array with this as the first entry
        } else {
          trendCache[prop].article_ids = [article.trends[prop]];
        }
      }
    });

    rankingCallback(trendCache);
  });
};

module.exports = collectAllTrends;
