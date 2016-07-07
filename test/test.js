const chai     = require('chai');
const assert   = chai.assert;
const expect   = chai.expect;
const mockKnex = require('mock-knex');
const tracker  = mockKnex.getTracker();
const db       = require('tandem-db');

const trendsService = require('../services/trendsService.js');

describe('Test bookshelf request with mock-knex', () => {

  tracker.install();

  describe('When calling incorporateAllNewTrends', () => {
    before(() => {
      const results = [
        { trend_name: "hello world" },
        { trend_name: "xoxo" },
        { trend_name: "foo" }
      ];

      tracker.on('query', (query) => {
          query.response(results);
      });
    });

    it("incorporates new trends into the existing trendCache", function () {
      var articlesWithTrends = [
        { trends: { 'foo': 1, 'bar': 1, 'baz': 1 } },
        { trends: { 'foo': 2, 'zar': 2, 'kaz': 2 } }
      ];

      return trendsService.incorporateAllNewTrends(articlesWithTrends, function(result){
        expect(Object.keys(result).length).to.equal(7);
      });
    });

    it("appends article_ids to new and existing trends", function () {
      var articlesWithTrends = [
        { trends: { 'foo': 1, 'bar': 1, 'baz': 1 } },
        { trends: { 'foo': 2, 'zar': 2, 'kaz': 2 } }
      ];

      return trendsService.incorporateAllNewTrends(articlesWithTrends, function(result){
        expect(result.foo).to.have.property('article_ids');
        expect(result.foo.article_ids[0]).to.equal(1);
        expect(result.foo.article_ids[1]).to.equal(2);
      });
    });

    it("does not affect existing trends without articles", function () {
      var articlesWithTrends = [
        { trends: { 'foo': 1, 'bar': 1, 'baz': 1 } },
        { trends: { 'foo': 2, 'zar': 2, 'kaz': 2 } }
      ];

      return trendsService.incorporateAllNewTrends(articlesWithTrends, function(result){
        expect(result.xoxo).to.not.have.property('article_ids');
      });
    });
  });

  describe('When calling filterResults', () => {

    it("filters object text based on relevance", function () {

      var results = { values: [
          { text: 'A', relevance: '1' },
          { text: 'B', relevance: '0.5' },
          { text: 'C', relevance: '0' },
          { text: 'D', relevance: '101' }
        ]
      };

      var result = trendsService.filterResults(results, 'values');

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal('a');
      expect(result[1]).to.equal('d');
    });
  });
});
