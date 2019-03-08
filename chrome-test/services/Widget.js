const CachingService = require('./CachingService');
const FormatService = require('./FormatService');
const ScraperSSR = require('./ScraperSSR');
module.exports = class Widget {
    constructor(widgetKey, title, subtitle, avatarUrl, faviconUrl, scrapingArgs, formatEachEvent) {
        this.widgetKey = widgetKey;
        this.header = FormatService.formatheader(title, subtitle, avatarUrl, faviconUrl);
        this.scrapingArgs = scrapingArgs;
        this.formatEachEvent = formatEachEvent;
    }

    async scrapeAndCache() {
        try {
            // Check the cache, return if still valid
            let cachedData = await CachingService.getWidget(this.widgetKey),
                fetchStart = new Date();

            if(cachedData && cachedData.isValid) {
                console.log(`Returning cached widget `, this.widgetKey);
                return cachedData.doc;
            } else {
                console.log(`Cache not valid, fetching data... `, this.widgetKey);
            }

            // Otherwise scrape
            let scrapingResult = await this.scrapeEasy(this.scrapingArgs, this.formatEachEvent);

            // Grab the total time btw scrape and cache
            scrapingResult.timeTaken = new Date().getTime() - fetchStart.getTime();

            // and then cache result
            await CachingService.put(this.widgetKey, scrapingResult);
            return scrapingResult;
        } catch(err) {
            console.log(`Scrape And Cache FAILED FOR id = ${this.widgetKey}, WITH ERROR: ${err}`);
        }
    }

    async scrapeEasy(scrapingArgs, formatEachEvent) {
        // console.log('Scraping Handler: Blaze Yoga scraper returns: ', events);
        let events = await ScraperSSR.scraper.run(...scrapingArgs);

        // Format each event
        let formattedEvents = [];
        for(let event of events) {
            let formattedEvent = await formatEachEvent(event);
            if(formattedEvent) {
                formattedEvents.push(formattedEvent);
            }
        }

        // Return and cache result
        return FormatService.formatResponse(this.header, formattedEvents);
    }

    // async createLambdaHandler(event, context) {
    createLambdaHandler() {
        return async (event, context) => {
            let result;
            try {
                result = await this.scrapeAndCache();
            } catch (error) {
                console.log(`lambdahander errored: ${error}`);
                return context.fail(error);
            }
            return context.succeed({statusCode: 200, body: JSON.stringify(result)});
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