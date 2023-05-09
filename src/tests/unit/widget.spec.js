'use strict';

const chai = require('chai');
const expect = chai.expect;
const Widget = require('../../components/Widget');
const sinon = require('sinon');

describe('Widget', () => {
  let mockScrapingResults,
      mockFormatEachEvent,
      ScraperSSR,
      res;

  beforeEach(async function() {
    this.timeout(20000);

    mockScrapingResults = ['MOCK_EVENT1', 'MOCK_EVENT2']
    mockFormatEachEvent = sinon.spy();
    ScraperSSR = require('../../services/ScraperSSR');
    sinon.stub(ScraperSSR.scraper, 'run').returns(mockScrapingResults);
    res = await new Widget(
      'MOCK_WIDGET_KEY', 
      'MOCK_TITLE', 
      'MOCK_SUB_TITLE', 
      'MOCK_SCRAPING_ARGS', 
      mockFormatEachEvent
    ).scrapeAndCache();
  });

  afterEach(() => {
    ScraperSSR.scraper.run.restore();
  })

  it('should call the scrapperSSR\'s run method', async () => {
    expect(ScraperSSR.scraper.run.called).to.be.true;
  })
    
  it('should call the formatting event for each returned event', async () => {
    mockScrapingResults.forEach(data => {
      expect(mockFormatEachEvent.calledWith(data)).to.be.true;
    });
  })
});