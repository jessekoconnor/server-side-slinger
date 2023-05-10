'use strict';

const chai = require('chai');
const expect = chai.expect;
const DateService = require('../../services/DateService');
const sinon = require('sinon');

describe('Date Service', () => {
  let year = new Date().getFullYear();

  beforeEach(async () => {
    
  })

  afterEach(() => {
    
  })

  describe('tryToFormatDate', () => {
    it('should handle parsable iso date (simple strategy)', () => {
      let rawString = year + '-12-29T05:00:00.000Z';
      expect(DateService.tryToFormatDate(rawString).getTime()).to.be.equal(new Date(rawString).getTime())
    });

    it('should handle parsable human date `1:00 AM December 29, year`', () => {
      let rawString = '1:00 AM December 29 ' + year;
      let expectedDate = year + '-12-29T05:00:00.000Z';
      expect(DateService.tryToFormatDate(rawString).toISOString()).to.be.equal(expectedDate)
    });

    it('should handle less parsable human date (no year)', () => {
      let rawString = '1pm December 29 ';
      let expectedDate = year + '-12-29T17:00:00.000Z';
      expect(DateService.tryToFormatDate(rawString).toISOString()).to.be.equal(expectedDate)
    });

    it('should handle less parsable human date w/ other chars in it (Pipes and other stuff)', () => {
      let rawString = '1pm December 29 | DOORS open at noon';
      let expectedDate = year+'-12-29T17:00:00.000Z'
      expect(DateService.tryToFormatDate(rawString).toISOString()).to.be.equal(expectedDate)
    });

    // Date goes to next day
    it('should handle less parsable human date that spans to next UTC day', () => {
      let rawString = 'SAT AUG 19 2023 8:00 PM | fdsjkafjdlskjf ';
      expect(DateService.tryToFormatDate(rawString).toISOString()).to.be.equal('2023-08-20T00:00:00.000Z')
    });
    
    it('should handle less parsable human date w/ @ symbol', () => {
      let rawString = 'AUG 19 @ 8:00 PM | fdsjkafjdlskjf ';
      expect(DateService.tryToFormatDate(rawString).toISOString()).to.be.equal('2023-08-20T00:00:00.000Z')
    });

    it('should handle less parsable human date w/ @ symbol and short hand hour', () => {
      let rawString = 'AUG 19 @ 12PM | fdsjkafjdlskjf ';
      expect(DateService.tryToFormatDate(rawString).toISOString()).to.be.equal('2023-08-19T16:00:00.000Z')
    });
  });

  describe('inPast', () => {
    it('should return true if a date is older than 24 hours', async () => {
      let datePast = dateXSecondsInFuture(-86401);
      expect(DateService.inPast(datePast)).to.be.true;
    })
    it('should return false if a date is less than 24 hours old', async () => {
      let datePast = dateXSecondsInFuture(-86400);
      expect(DateService.inPast(datePast)).to.be.false;
    })
  });
});

function dateXSecondsInFuture(seconds) {
  console.log('seconds', seconds*1000)
  return new Date(new Date().getTime() + (seconds*1000));
}