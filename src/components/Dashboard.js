'use strict'
const aws = require('aws-sdk');
const localLambda = process.env.LOCAL_LAMBDA === 'true';
const CachingService = require('../services/CachingService');
const { took } = require('../helpers/timer');


class Dashboard {
    constructor(dashTitle) {
        this.title = dashTitle;
    }

    // Arrayify env variables that start with `Function1...20`
    getFunctionNames() {
        let functions = [],
            stub = 'Function';
        for(let i = 1; i < 20; i++) {
            if(process.env[stub + i.toString()]) {
                functions.push(process.env[stub + i.toString()])
            }
        }
        return functions;
    }

    // For each child lambda, invoke
    async scrape({ start }) {
        try {
            let promises = [];
            for(let functName of this.getFunctionNames()) {
                // console.log(`Invoking lambda ${functName}`);
                promises.push(this.invokeLambdaAfterCheckingCache({ functName, start }));
            }
            return Promise.all(promises);
        } catch(err) {
            console.log(err)
            console.log(`Scrape And Cache FAILED FOR dashboard = ${this.title}, WITH ERROR: ${err}`);
        }
    }

    // Lambda service context encapsulation
    createLambdaHandler() {
        const start = new Date();
        return async (event, context) => {
            let result;
            try {
                result = await this.scrape({ start });
                // console.log('dashboard lambda handler success', result.map(r => r.header));
            } catch (error) {
                console.log(`lambdahander errored: ${error}`);
                return context.fail(error);
            }

            // Wrap data in dashboard object
            let dashboardContainer = {
                title: this.title,
                data: result
            }

            return context.succeed({statusCode: 200, body: JSON.stringify(dashboardContainer)});
        };
    }

    invokeLambdaAndCache({ params, lambda, cachedData, retry = 3, start }) {
        return new Promise((res, rej) => {
            if (retry === 0) {
                console.error(`DASH -- Failed to invoke lambda ${params.FunctionName} after 3 retries`);
                return rej();
            }
            const functName = params.FunctionName;

            // Log how long it took before invoking
            took(start, new Date(), `--- took before invoking ${functName} ---`);

            lambda.invoke(params, async function(err, data) {
                if (err) {
                    console.log('Lambda has errored', err, err.stack);
                    // Check cache data in case of failure
                    if (cachedData?.isValid === false) {
                        console.error(`DASH -- Returning cached widget due to scraping failure`, functName, err);
                        return res(cachedData.doc);
                    } else {
                        console.log(`DASH -- invocation for ${functName}, retrying time #${retry}...`)
                        // Recursively try again
                        return invokeLambdaAndCache({ params, lambda, cachedData, retry: retry - 1 })
                            .then(res)
                            .catch(rej);
                    }
                } // an error occurred
                else {
                    // console.log('Lambda has returned', data.payload);           // successful response
                    let parsedRes;
                    try {
                        parsedRes = JSON.parse(JSON.parse(data.Payload).body);
                        return res(parsedRes);
                    } catch(e) {
                        console.error('Lambda response is not json', e, data.payload);
                        return res(parsedRes);
                    }
                    
                }
            });
        });
    }

    async invokeLambdaAfterCheckingCache({ functName, start }) {
        // Check the cache, return if still valid
        let cachedData = await CachingService.getWidget(functName);
        if(cachedData && cachedData.isValid) {
            console.log(`DASH -- Returning cached widget, saved a lambda call `, functName);
            return cachedData.doc;
        }

        // Prep lambda for invoking
        let lambda;
        if(localLambda) {
            console.log('Local Lambda endabled, using local endpoint');
            lambda = new aws.Lambda({endpoint:'http://host.docker.internal:3001/'});
        } else {
            // console.log('Local Lambda disabled, not using local endpoint');
            lambda = new aws.Lambda();
        }

        let params = {
            FunctionName: functName,
            // LogType: 'Tail',
            Payload: JSON.stringify({ cacheKey: functName }),
        };
        return this.invokeLambdaAndCache({ lambda, params, cachedData, start });
    }
}

let core = new Dashboard(
    process.env["DashboardName"]
);

exports.lambdaHandler = core.createLambdaHandler();