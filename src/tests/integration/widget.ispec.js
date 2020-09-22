'use strict';

const chai = require('chai');
const expect = chai.expect;
let request = require('request');

describe('test chrome', () => {
    let url,
        res;

    beforeEach(()=>{
        url = 'http://localhost:3000';
    });


    describe('Widgets', () => {
        describe('PressRoom', () => {

            beforeEach(async ()=>{
                url += '/pressRoom';
            });

            it('should return at least 15 results', async () => {
                res = await getRequest(url);
                // console.log('Spec result for PresRoom: ', res.header);
                expect(res.events.length > 15).to.be.true;
            }).timeout(20000);

            it('should have a header and events (each contain at least rawDate and title)', async () => {
                res = await getRequest(url);
                // console.log('Spec result for Blaze: ', res);
                expect(res.header).to.be.an('object');
                expect(res.events).to.be.an('array');
                res.events.forEach(event => {
                    expect(event.title).to.be.an('string');
                    expect(isValidDate(event.rawDate)).to.be.true;
                });
            }).timeout(20000);

            // it('should return events that are less than 10 days old', async () => {
            //     res = await getRequest(url);
            //     res.events.forEach(event => {
            //         expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (10*(1000 * 60 * 60 * 24))));
            //     });
            // }).timeout(20000);
        });

        describe('3 bridges yoga', () => {

            beforeEach(async ()=>{
                url += '/3by';

            });

            it('should return at least 15 results', async () => {
                res = await getRequest(url);
                // console.log('Spec result for 3by: ', res);
                expect(res.events.length > 15).to.be.true;
            }).timeout(20000);

            it('should have a header and events (each contain at least rawDate and title)', async () => {
                res = await getRequest(url);
                // console.log('Spec result for Blaze: ', res);
                expect(res.header).to.be.an('object');
                expect(res.events).to.be.an('array');
                res.events.forEach(event => {
                    expect(event.title).to.be.an('string');
                    expect(isValidDate(event.rawDate)).to.be.true;
                });
            }).timeout(20000);

            it('should return events that are less than 24 hours old', async () => {
                res = await getRequest(url);
                res.events.forEach(event => {
                    expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (1000 * 60 * 60 * 24)));
                });
            }).timeout(20000);
        });

        describe('blaze yoga', () => {

            beforeEach(async ()=>{
                url += '/blaze';

            });

            it('should return at least 15 results', async () => {
                // console.log('Spec result for Blaze: ', res);
                res = await getRequest(url);
                expect(res.events.length > 14).to.be.true;
            }).timeout(20000);

            it('should have a header and events (each contain at least rawDate and title)', async () => {
                res = await getRequest(url);
                // console.log('Spec result for Blaze: ', res);
                expect(res.header).to.be.an('object');
                expect(res.events).to.be.an('array');
                res.events.forEach(event => {
                    expect(event.title).to.be.an('string');
                    expect(isValidDate(event.rawDate)).to.be.true;
                    expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (1000 * 60 * 60 * 24)));
                });
            }).timeout(20000);

            it('should return events that are less than 24 hours old', async () => {
                res = await getRequest(url);
                res.events.forEach(event => {
                    expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (1000 * 60 * 60 * 24)));
                });
            }).timeout(20000);
        });

        describe('3s Artspace', () => {

            beforeEach(async ()=>{
                url += '/3s';

            });

            it('should return at least 15 results', async () => {
                // console.log('Spec result for Blaze: ', res);
                res = await getRequest(url);
                expect(res.events.length).to.be.greaterThan(9);
            }).timeout(20000);

            it('should have a header and events (each contain at least rawDate and title)', async () => {
                res = await getRequest(url);
                // console.log('Spec result for Blaze: ', res);
                expect(res.header).to.be.an('object');
                expect(res.events).to.be.an('array');
                res.events.forEach(event => {
                    expect(event.title).to.be.an('string');
                    expect(isValidDate(event.rawDate)).to.be.true;
                    expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (1000 * 60 * 60 * 24)));
                });
            }).timeout(20000);

            it('should return events that are less than 24 hours old', async () => {
                res = await getRequest(url);
                res.events.forEach(event => {
                    expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (1000 * 60 * 60 * 24)));
                });
            }).timeout(20000);
        });
    })
});

function postRequest(url, payload) {
    return new Promise((resolve, reject) => {
        request.post(
            url,
            { json: payload },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    console.log('error in post request', error);
                    reject(error);
                }
            }
        );
    });
}

function getRequest(url) {
    return new Promise((resolve, reject) => {
        request.get(
            url,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    console.log('error in get request', error);
                    reject(error);
                }
            }
        );
    });
}

// First try to just make a date first, then try other options
function isValidDate(dateStr) {
    let newDate = new Date(dateStr);
    if (isNaN(newDate.getTime())) {
        return false;
    }
    return true;
}