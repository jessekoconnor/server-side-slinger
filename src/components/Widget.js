const CachingService = require('../services/CachingService');
const FormatService = require('../services/FormatService');
const ScraperSSR = require('../services/ScraperSSR');

module.exports = class Widget {

    constructor({ key, title, subtitle, config }) {
        this.widgetKey = key;
        this.lambdaFunctionName = key;
        this.header = FormatService.formatheader(title, subtitle, key);
        this.scrapingConfig = config;
    }

    async scrapeAndCache({ cacheKey } = {}, { functionName } = {}) {
        try {
            // console.log(`Scrape And Cache STARTING FOR id = ${this.widgetKey}`, { functionName, cacheKey })
            const fetchStart = new Date();
            let scrapingResult = await this.scrapeAway(this.scrapingConfig);

            // Grab the total time btw scrape and cache
            scrapingResult.timeTaken = new Date().getTime() - fetchStart.getTime();
            
            try {
                await CachingService.put(cacheKey || functionName, scrapingResult);
            } catch(error) {
                console.error(`CachingService.cacheResult errored`, JSON.stringify({ error, cacheKey }));
            }

            // console.log(`Scrape And Cache SUCCESS FOR id = ${this.widgetKey}, WITH RESULT: ${JSON.stringify(scrapingResult, null, 2)}`);
            return scrapingResult;
        } catch(err) {
            console.log(`Scrape And Cache FAILED FOR id = ${this.widgetKey}, WITH ERROR: ${err}`);
        }
    }

    async scrapeAway(scrapingConfig) {
        // console.log(`Scraping Handler: ${JSON.stringify(scrapingConfig, null, 2)}`);
        let events = await ScraperSSR.scraper.run(scrapingConfig);
        // console.log('Scraping Handler results: ', JSON.stringify(events, null, 2));

        // Format each event
        let formattedEvents = [];
        const seen = new Set();
        for(let event of events) {
            let formattedEvent = scrapingConfig.postProcessing(event);
            if (formattedEvent) {
                const { startDate, title } = formattedEvent;
                const hash = `${startDate}-${title}`;
                if (!seen.has(hash)) {
                    formattedEvents.push(formattedEvent);
                    seen.add(hash);
                }
            };
        }

        // Return and cache result
        return FormatService.formatResponse(this.header, await Promise.all(formattedEvents));
    }

    // async createLambdaHandler(event, context) {
    createLambdaHandler() {
        return async (event, context) => {
            let result;
            try {
                result = await this.scrapeAndCache(event, context);
                return context.succeed({statusCode: 200, body: JSON.stringify(result)});
            } catch (error) {
                console.log(`lambdahandler errored: ${error}`);
                return context.fail(error);
            }
        };
    }

    // async createLambdaHandler(event, context) {
    createScrapingHandler() {
        return async () => {
            try {
                return this.scrapeAndCache();
            } catch (error) {
                console.log(`scrapeAndCache errored: ${error}`);
            }
        };
    }
};