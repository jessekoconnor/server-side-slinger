'use strict';

const chai = require('chai');
const expect = chai.expect;
let request = require('request');

describe('Tests index', function () {

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
    let url = 'http://localhost:3000/ssr';

    it('should return for blaze simple', async () => {

        let res = await postRequest(url,
            [
                'https://www.blazenh.com/schedule',
                'div.bw-session__basics'
            ]);
        // console.log('Spec result for SSR Scraper: ', res);
        expect(res).to.be.an("array");
    }).timeout(12000);

    it('should return for blaze w/ subselections', async () => {

        let res = await postRequest(url,
            ['https://www.blazenh.com/schedule', 'div.bw-session__basics',
                [
                    // Start time
                    '.hc_starttime',
                    // End time
                    '.hc_endtime',
                    // Class
                    '.bw-session__type',
                    // Instructor
                    '.bw-session__staff'
                ]
            ]);
        // console.log('Spec result for SSR Scraper: ', res);
        expect(res).to.be.an("array");
    }).timeout(12000);

    it('should return for blaze w/ attribute type subselections', async () => {
        let res = await postRequest(url,
            [
                'https://www.blazenh.com/schedule',
                'div.bw-session__basics',
                [
                    // Start time
                    {
                        query: '.hc_starttime',
                        attribute: 'datetime'
                    },
                    // End time
                    {
                        query: '.hc_endtime',
                        attribute: 'datetime'
                    },
                    // Class
                    '.bw-session__type',
                    // Instructor
                    '.bw-session__staff'
                ]
            ]);
        // console.log('Spec result for SSR Scraper: ', res);
        expect(res).to.be.an("array");
    }).timeout(20000);
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
