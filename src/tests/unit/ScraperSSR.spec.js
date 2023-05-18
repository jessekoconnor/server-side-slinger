'use strict';

const chai = require('chai');
const expect = chai.expect;
const ScraperSSRService = require('../../services/ScraperSSR').scraper;
const sinon = require('sinon');

describe('arr1ByArr2', () => {
    it('should return arr2 when arr1 is empty', () => {
        let arr1 = [];
        let arr2 = [1, 2, 3];
        expect(ScraperSSRService.arr1ByArr2(arr1, arr2)).to.be.equal(arr2);
    });

    it('should return arr2 when arr1 is array of arrays (empty)', () => {
        let arr1 = [[]];
        let arr2 = [1, 2, 3];
        expect(ScraperSSRService.arr1ByArr2(arr1, arr2)).to.be.equal(arr2);
    });

    it('should return arr1 when arr2 is empty array', () => {
        let arr1 = [1, 2, 3];
        let arr2 = [];
        expect(ScraperSSRService.arr1ByArr2(arr1, arr2)).to.be.equal(arr1);
    });

    it('should return arr1 when arr2 is array of arrays (empty)', () => {
        let arr1 = [1, 2, 3];
        let arr2 = [[]];
        expect(ScraperSSRService.arr1ByArr2(arr1, arr2)).to.be.equal(arr1);
    });
});

describe('flattenToTwoDinesionalArray', () => {
    it('shoult return empty array from empty array', () => {
        let arr = [];
        expect(ScraperSSRService.flattenToTwoDinesionalArray(arr)).to.be.deep.equal([]);
    });

    it('should return 1d array from 1d array', () => {
        let arr = [1, 2, 3];
        expect(ScraperSSRService.flattenToTwoDinesionalArray(arr)).to.be.deep.equal(arr);
    });

    it('should return 2d array from 2d array', () => {
        let arr = [[1, 2, 3]];
        expect(ScraperSSRService.flattenToTwoDinesionalArray(arr)).to.be.deep.equal(arr);
    });

    it('should return 2d array from 3d array', () => {
        let arr = [[[1, 2], [3,4]]];
        expect(ScraperSSRService.flattenToTwoDinesionalArray(arr)).to.be.deep.equal([[1, 2],[3, 4]]);
    });

    it('should return 2d array from 4d array', () => {
        let arr = [[[[1, 2], [3,4]]]];
        expect(ScraperSSRService.flattenToTwoDinesionalArray(arr)).to.be.deep.equal([[1, 2],[3, 4]]);
    });

    it('should return 2d array from 4d mixed array', () => {
        let arr = [[[[1, 2], [3,4]]], [5, 6]];
        expect(ScraperSSRService.flattenToTwoDinesionalArray(arr)).to.be.deep.equal([[1, 2],[3, 4], [5, 6]]);
    });
});

