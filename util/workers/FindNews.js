var assert = require('assert');


module.exports = function(db, callback) {
  var news = db.collection('news').find();
  news.each(function(err, rawdata) {
    assert.equal(err, null);
    if (err) {
      console.log('An error occured at FindNews', err);
    }
    if ( rawdata !== null ) {
      callback(rawdata);
    } 
  });
}