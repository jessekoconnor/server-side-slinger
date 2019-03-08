'use strict'

class Dashboard {
    constructor(dashTitle, ...widgets) {
        this.title = dashTitle;
        this.widgets = widgets;
    }

    async scrape() {
        try {
            let promises = [];
            for(let widget of this.widgets) {
                promises.push(widget.scrapeAndCache());
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
                result = await this.scrape();
                console.log('dashboard lambda handler success', result);
            } catch (error) {
                console.log(`lambdahander errored: ${error}`);
                return context.fail(error);
            }
            return context.succeed({statusCode: 200, body: JSON.stringify(result)});
        };
    }
}

let core = new Dashboard('Lifestyle', require('../widgets/3BridgesYoga'), require('../widgets/BlazeYoga'));

exports.lambdaHandler = core.createLambdaHandler();