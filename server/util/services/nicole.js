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