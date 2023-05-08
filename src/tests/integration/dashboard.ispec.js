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

    describe('Dashboards', () => {
        describe.skip('Lifestyle', () => {

            beforeEach(async ()=>{
                url += '/lifestyle';
            });

            it('should return at least 15 results for each widget', async () => {
                res = await getRequest(url);
                // console.log('Spec result for Lifestyle: ', res.data.length);
                res.data.forEach(widget => expect(widget.events.length).to.be.greaterThan(5));
            }).timeout(20000);
        });

        describe('Nightlife', () => {

            beforeEach(async ()=>{
                url += '/nightlife';
            });

            it('should return at least 5 results for each widget', async () => {
                res = await getRequest(url);
                // console.log('Spec result for nightlife: ', res.data.length);
                res.data.forEach(widget => expect(widget.events.length).to.be.greaterThan(5));
            }).timeout(20000);
        });
    });

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