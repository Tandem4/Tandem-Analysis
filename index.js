const request = require('request');
const API_KEY = process.env.TANDEM_API_KEY;
const RELEVANCE = 0.5;

// 1) Decide how to interface with Analysis service and implement queue system
//    assume this represents a batch of article urls
var testUrl1 = 'http://www.bbc.com/news/uk-politics-32810887';
var testUrls = [
  'http://www.bbc.com/news/uk-politics-32810887',
  'https://www.washingtonpost.com/world/europe/britain-shocks-the-world-by-voting-to-leave-the-european-union/2016/06/24/3d100f4e-3998-11e6-af02-1df55f0c77ff_story.html',
  'https://www.washingtonpost.com/news/the-fix/wp/2016/06/24/donald-trumps-brexit-press-conference-was-beyond-bizarre/?hpid=hp_hp-top-table-main_fix-trump-newser-1130a-top%3Ahomepage%2Fstory',
  'http://www.bbc.com/sport/cricket/36626699'
];


// 2) How many ways can articles share trends?  Can articles host multiple trends?
// relevant categories: entities/keywords/concepts/taxonomy

// So far: This pulls out the top 10 entities from a single Watson response, and filters for relevance > .5.
var parsedEntities;
var parsedConcepts;

// can these be set up as promises?

// First query Watson API for entities
request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedNamedEntities?apikey=' + API_KEY + '&url=' + testUrl1 + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
  if (err) { console.log('There was an error in index.js', err) }
  if (!err && response.statusCode === 200) {
    var entityResults = JSON.parse(body);

    parsedEntities = entityResults.entities.filter( function(entity) {
      if (parseFloat(entity.relevance) > RELEVANCE) { return entity; }
    }).map( function(filtered) {
      return filtered.text;
    });

    // Next query for concepts
    request('http://gateway-a.watsonplatform.net/calls/url/URLGetRankedConcepts?apikey=' + API_KEY + '&url=' + testUrl1 + '&outputMode=json&maxRetrieve=10', function (err, response, body) {
      if (err) { console.log('There was an error in index.js', err) }
      if (!err && response.statusCode === 200) {
        var conceptResults = JSON.parse(body);

        parsedConcepts = entityResults.entities.filter( function(entity) {
          if (parseFloat(entity.relevance) > RELEVANCE) { return entity; }
        }).map( function(filtered) {
          return filtered.text;
        });

        // merge these into an array of keywords and pair with this article
        var trends = parsedEntities.concat(parsedConcepts);
        var article = {
          url: testUrl1,
          trends: trends
        }
        console.log(article);
      }
    });

  }
});

// { url: 'http://www.bbc.com/news/uk-politics-32810887',
//   trends:
//    [ 'European Union',
//      'UK',
//      'Prime Minister David Cameron',
//      'Britain',
//      'European Union',
//      'UK',
//      'Prime Minister David Cameron',
//      'Britain' ] }




// Now all articles have trends, articles complete.  Continue with trends:

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
