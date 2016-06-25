const async = require('async');
const request = require('request');
const _ = require('underbar');
const API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE = 0.5;

// ************************************
//  Fetch Records from Analysis Service
// ************************************

// 1) Decide how to interface with Analysis service and implement queue system
//    assume this represents a batch of article urls
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

    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + API_KEY + '&url=' + testUrl1 + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
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

// *********************************
//  Trend Ranking
// *********************************



// TODO:  Add these trends to the article objects, not just the url.
// pass this object off to the ranking algorithm to integrate with preexisting trends.

// Now all articles have trends, articles complete.  Continue with trends:




// Data handling priorities:
// Collect trends for each article and amass a collection.

// Determine how mutiple trends affects our schema / join table?
// Formerly: Articles had one trend, a trend had many articles
// Now:  Articles have many trends, a trend has many articles

// Once we have multiple trends, we need to query our existing collection of trends and add these ones
// The schema needs to be updated to reflect how many articles a trend has
// The schema needs to be updated with an updated_at field for half-life calculation.

// First: write a ranking algorithm that handles one trend record.

// Consider:  revisit how to keep a history of ranks for each trend?







// Ranking: custom algorithm
// Each trend weighted by quantity of articles and degradation of half life since last update.
// Trends are identified by name, not id (if the same keyword comes up again in a new search)
// How will similar trends be combined?
// Pull out all existing trend data (cache?), add new trends and run through ranking algorithm
  // - Best way to handle comparision with past data?
  // - a cache(index), if it empties for some reason, it does a fetch, otherwise it just keeps adding/updating/pushing
  // - Updates to schema:
  // - Trends need to know about:  # of articles
  // - Half life since last update (exponential decay of rank based on date current + date updated)
  // Will it work for very large and for very small counts?
  // Will it work for very fast rises and for very slow rises?
  // Will it work in spite a cycles of typical human behavior?
  // I needed to answer this question too.  But I looked to signal processing literature on the topic of trend removal.  The basic idea is that there is signal and noise.  The signal, in this case, is the trend and the noise is all the other stuff going on that you are trying to factor out.  There is a fairly simple algorithm in Random Data, Chapter 11.1.2, by Julias S Bendat and Allan G. Piersol.  It essentially computes a linear regression, where the dependent variable is your time series (Trend + Noise) values and the independent variable is the order of the time series values (n=1,2,3,4,5,6...N).  You have to decide how large your window of time is to evaluate upon (i.e. how many N records are you going to try to detect a trend among)
  // Frequently, computation of ranking functions can be simplified by taking advantage of the observation that only the relative order of scores matters, not their absolute value; hence terms or factors that are independent of the document may be removed, and terms or factors that are independent of the query may be precomputed and stored with the document.

// Insert new articles and updated/new trends into MySQL

// HTTP server pulls out all trends and displays according to rank.


// Attributions:
// Provide a clickable hyperlink to www.alchemyapi.com with the text "Text Analysis by AlchemyAPI" within your website or application; and
// Provide attribution to AlchemyAPI within any published works that are based on or mention AlchemyAPI, or content generated by AlchemyAPI, including but not limited to research papers and journal articles.
// Provide attribution to AlchemyAPI within all web pages or documents where AlchemyAPI content and/or API results are used or displayed.
