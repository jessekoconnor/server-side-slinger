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

  describe('stringMDToDate', () => {
    it('should format Month and Day properly', () => {
      let rawString = 'December 29';
      let expectedDate = new Date(year+'-12-29T05:00:00.000Z')
      expect(DateService.stringMDToDate(rawString).getTime()).to.be.equal(expectedDate.getTime())
    })

    it('should format Month, Day, Year properly', () => {
      let rawString = 'December 29 ' + year;
      let expectedDate = new Date(year+'-12-29T05:00:00.000Z')
      expect(DateService.stringMDToDate(rawString).getTime()).to.be.equal(expectedDate.getTime())
    })

    it('should format Month, Day, Year and time (am) properly', () => {
      let rawString = '1:00 AM December 29 ' + year;
      let expectedDate = new Date(year+'-12-29T06:00:00.000Z')
      expect(DateService.stringMDToDate(rawString).getTime()).to.be.equal(expectedDate.getTime())
    })

    it('should format Month, Day and time (pm) properly', () => {``
      let rawString = '1:00 PM December 29 ';
      let expectedDate = new Date(year+'-12-29T18:00:00.000Z')
      expect(DateService.stringMDToDate(rawString).getTime()).to.be.equal(expectedDate.getTime())
    })

    it('should handle 1pm edt', () => {
      let rawString = '1pm December 29 ';
      let expectedDate = new Date(year+'-12-29T18:00:00.000Z')
      expect(DateService.stringMDToDate(rawString).getTime()).to.be.equal(expectedDate.getTime())
    })

    // it('should handle 1:30pm', () => {
    //   let rawString = '1:30 pm December 29 ';
    //   let expectedDate = new Date(year+'-12-29T18:00:00.000Z')
    //   expect(DateService.stringMDToDate(rawString).getTime()).to.be.equal(expectedDate.getTime())
    // })
  })

  describe('inPast', () => {
    it('should return true if a date is older than 24 hours', async () => {
      let datePast = dateXSecondsInFuture(-86401);
      expect(DateService.inPast(datePast)).to.be.true;
    })
    it('should return false if a date is less than 24 hours old', async () => {
      let datePast = dateXSecondsInFuture(-86400);
      expect(DateService.inPast(datePast)).to.be.false;
    })
  })

  
    
  // it('should call the formatting event for each returned event', async () => {
  //   mockScrapingResults.forEach(data => {
  //     expect(mockFormatEachEvent.calledWith(data)).to.be.true;
  //   });
  // })
});

function dateXSecondsInFuture(seconds) {
  console.log('seconds', seconds*1000)
  return new Date(new Date().getTime() + (seconds*1000));
}