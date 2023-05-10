'use strict';

const chai = require('chai');
const expect = chai.expect;
let request = require('request');

const url = 'http://localhost:3000';

const configs = [
    {
        name: 'PressRoom',
        path: '/pressRoom',
    },
    {
        name: '3s',
        path: '/3s',
    },
    {
        name: 'Book&Bar',
        path: '/bookAndBar',
    }
];

describe('Integration testing suite for widgets', () => {

    configs.forEach(config => {
        describe(`Integration testing for widget: ${config.name}`, () => {
            let fullUrl = url + config.path;
            let res;
    
            before(async function() {
                this.timeout(20000);

                res = await getRequest(fullUrl);

                // console.log(`Spec result for ${config.name}:`, res);
            });
    
            it('should return at least 5 results', async () => {
                expect(res.events.length > 5).to.be.true;
            });
    
            it('should have a header and events (each contain at least rawDate and title)', async () => {
                expect(res.header).to.be.an('object');
                expect(res.events).to.be.an('array');
                res.events.forEach(event => {
                    expect(event.title).to.be.an('string');
                    expect(isValidDate(event.startDate)).to.be.true;
                });
            });
    
            it('should return events that are less than 10 days old', async () => {
                res.events.forEach(event => {
                    const startTime = new Date(event.startDate);
                    const tenDaysAgo = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 10));
                    // expect start time to be greater than 10 days ago
                    // console.log(startTime, 'tenDays: ', tenDaysAgo, 'event: ', event, startTime.getTime())
                    expect(startTime.getTime()).to.be.greaterThan(tenDaysAgo.getTime());
                });
            });
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