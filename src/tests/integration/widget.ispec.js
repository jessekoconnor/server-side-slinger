'use strict';

const chai = require('chai');
const expect = chai.expect;
let request = require('request');

describe('test chrome', () => {
    let url = 'http://localhost:3000/ssr',
        res;

    beforeEach(()=>{
        url = 'http://localhost:3000';
    });

    describe('Dashboards', () => {
        describe('Lifestyle', () => {

            beforeEach(async ()=>{
                url += '/lifestyle';
            });

            it('should return at least 15 results for each widget', async () => {
                res = await getRequest(url);
                // console.log('Spec result for Lifestyle: ', res);
                res.forEach(widget => expect(widget.events.length > 15).to.be.true);
            }).timeout(20000);
        });
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

            it('should return events that are less than 24 hours old', async () => {
                res = await getRequest(url);
                res.events.forEach(event => {
                    expect(new Date(event.rawDate)).to.be.above(new Date(new Date().getTime() - (1000 * 60 * 60 * 24)));
                });
            }).timeout(20000);
        });

        describe('3 bridges yoga', () => {

            beforeEach(async ()=>{
                url += '/3by';

            });

            it.only('should return at least 15 results', async () => {
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

        describe('ssr basic', function () {

            beforeEach(()=>{
                url += '/ssr';
            });

            // it('verifies successful response', async () => {
            //     const result = await app.lambdaHandler(event, context)
            //
            //     expect(result).to.be.an('object');
            //     expect(result.statusCode).to.equal(200);
            //     expect(result.body).to.be.an('string');
            //
            //     let response = JSON.parse(result.body);
            //
            //     expect(response).to.be.an('object');
            //     expect(response.message).to.be.equal("Google");
            //     expect(response.location).to.be.an("string");
            // });


            // it('should return for blaze simple', async () => {
            //
            //     let res = await postRequest(url,
            //         [
            //             'https://www.blazenh.com/schedule',
            //             'div.bw-session__basics'
            //         ]);
            //     console.log('Spec result for SSR Scraper: ', res);
            //     expect(res).to.be.an("array");
            // }).timeout(15000);
            //
            // it('should return for blaze w/ subselections', async () => {
            //
            //     let res = await postRequest(url,
            //         ['https://www.blazenh.com/schedule', 'div.bw-session__basics',
            //             [
            //                 // Start time
            //                 '.hc_starttime',
            //                 // End time
            //                 '.hc_endtime',
            //                 // Class
            //                 '.bw-session__type',
            //                 // Instructor
            //                 '.bw-session__staff'
            //             ]
            //         ]);
            //     // console.log('Spec result for SSR Scraper: ', res);
            //     expect(res).to.be.an("array");
            // }).timeout(15000);

            // it('should return for blaze w/ attribute type subselections', async () => {
            //     let res = await postRequest(url,
            //         [
            //             'https://www.blazenh.com/schedule',
            //             'div.bw-session__basics',
            //             [
            //                 // Start time
            //                 {
            //                     query: '.hc_starttime',
            //                     attribute: 'datetime'
            //                 },
            //                 // End time
            //                 {
            //                     query: '.hc_endtime',
            //                     attribute: 'datetime'
            //                 },
            //                 // Class
            //                 '.bw-session__type',
            //                 // Instructor
            //                 '.bw-session__staff'
            //             ]
            //         ]);
            //     // console.log('Spec result for SSR Scraper: ', res);
            //     expect(res).to.be.an("array");
            // }).timeout(20000);
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