'use strict';

const chai = require('chai');
const expect = chai.expect;
let request = require('request');
let { allEventsAreNew } = require('../../helpers/timer');

const url = 'http://localhost:3000';

const configs = [
    // {
    //     name: 'Lifestyle',
    //     path: '/lifeStyle',
    // },
    {
        name: 'nightLife',
        path: '/nightLife',
    },
];

describe('Integration testing suite for dashboards', () => {

    configs.forEach(config => {
        describe(`Integration testing for dashboard: ${config.name}`, () => {
            let fullUrl = url + config.path;
            let res;
            
            before(async function() {
                this.timeout(40000);
                this.retries(3);

                res = await getRequest(fullUrl);

                // console.log(`Spec result for ${config.name}:`, res);
            });

            it('should return at least 5 results for each widget', async () => {
                res.data.forEach(widget => expect(widget.events.length).to.be.greaterThan(5));
            });

            it('should return events that are less than 10 days old', async () => {
                res.data.forEach(widget => {
                    expect(allEventsAreNew(widget.events, 30)).to.be.true;
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