'use strict'
const aws = require('aws-sdk');
const localLambda = process.env.LOCAL_LAMBDA === 'true';

class Dashboard {
    constructor(dashTitle) {
        this.title = dashTitle;
    }

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

    async scrape() {
        try {
            let promises = [];
            for(let funct of this.getFunctionNames()) {
                promises.push(this.invokeLambda(funct));
            }
            return Promise.all(promises);
        } catch(err) {
            console.log(err)
            console.log(`Scrape And Cache FAILED FOR dashboard = ${this.title}, WITH ERROR: ${err}`);
        }
    }

    // async createLambdaHandler(event, context) {
    createLambdaHandler() {
        return async (event, context) => {
            let result;
            try {
                console.log('GotHere1', event)
                // result = await this.invokeLambda('3BridgesYoga', "{}");
                result = await this.scrape();
                console.log('dashboard lambda handler success', result.map(r => r.header));
            } catch (error) {
                console.log(`lambdahander errored: ${error}`);
                return context.fail(error);
            }
            return context.succeed({statusCode: 200, body: JSON.stringify(result)});
        };
    }

    invokeLambda(funct) {
        return new Promise((res, rej) => {
            let lambda,
                params = {
                    FunctionName: funct,
                    // LogType: 'Tail',
                    Payload: "{}"
                };

            if(localLambda) {
                console.log('Local Lambda endabled, using local endpoint');
                lambda = new aws.Lambda({endpoint:'http://host.docker.internal:3001/'});
            } else {
                console.log('Local Lambda disabled, not using local endpoint');
                lambda = new aws.Lambda();
            }

            console.log(`Invoking lambda function w/ params ${JSON.stringify(params)}`);

            lambda.invoke(params, function(err, data) {
                if (err) {
                    console.log('Lambda has errored', err, err.stack);
                    rej(err)
                } // an error occurred
                else {
                    // console.log('Lambda has returned', data);           // successful response
                    res(JSON.parse(JSON.parse(data.Payload).body));
                }
            });
        });
    }
}

let core = new Dashboard(
    'Lifestyle'
);

exports.lambdaHandler = core.createLambdaHandler();