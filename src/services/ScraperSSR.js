let
    puppeteer = require('puppeteer-core'),
    chromium = require('chrome-aws-lambda'),
    browser,
    { took } = require('../helpers/timer'),
    loadTime = new Date(),
    launchBrowser = async () => {
        return puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless
        });
    };

class ScraperSSR {

    // Hold up until the page loads
    async waitTillPageLoads(url) {
        try {
            let startTime = new Date();
            // browser = await puppeteer.launch({headless: true});
            if(!browser) {
                console.log('Generating browser...');
                browser = await launchBrowser();
                browser.on('disconnected', async () => {
                    console.log('browser is disconnected.');
                    await launchBrowser();
                });
            }

            // Profiling Launch
            let launchedTime = new Date();
            took(startTime, launchedTime, 'Puppeteer launch');


            const page = await browser.newPage();

            // Profiling new page
            let newPageLoaded = new Date();
            took(launchedTime, newPageLoaded, 'New Page');

            await page.goto(url, {waitUntil: 'domcontentloaded'});

            // Profiling page.goTo
            let goTo = new Date();
            took(newPageLoaded, goTo, 'page.goTo');

            return page;
        } catch (error) {
            console.log('could not load page: ', { error, url });
        }
    }

    // async closeBrowser() {
    //     await browser.close();
    // }

    async getInnerText(page, selector) {
        return page.$$eval(selector, async nodes => {
            if(nodes.length === 1) return nodes[0].innerText;
            return nodes.map(n => n.innerText);
        });
    }

    async getInnerAttributes(page, selector) {
        const selectorQuery = selector.query || selector;
        let data = await page.$$eval(selectorQuery, async (nodes,attr) => {
            let info = nodes.map(n => n.getAttribute(attr));
            if(info.length === 1) info = info[0];
            return info;
        }, selector.attribute);
        if(selector.json) {
            data = data.map(n => JSON.parse(n))
        }
        return data;
    }

    // Extract data from an element
    async evaluateElelemt(page, _selector) {
        const selector = _selector.query || _selector;
        // console.log('[Scraper SSR] evaluateElelemt', { selector, pageIsDefined: !!page });
        if (!page) {
            console.trace('page is not defined', { page, selector });
            return;
        }
        if(typeof selector === 'string') return this.getInnerText(page, selector);
        return this.getInnerAttributes(page, selector);
    }

    // Turn pages and selectors into data
    async getSelection(page, query) {
        // console.log('[Scraper SSR] getSelection debug', { query, pageIsDefined: !!page })
        const queryVal = query.val || query;
        const queryVals = Array.isArray(queryVal) ? queryVal : [queryVal];

        // Base case
        if(!query.query) {
            // console.log('[Scraper SSR] getSelection debug1', { queryVals })

            const res = [];
            for(let i = 0; i < queryVals.length;i++) {
                const curQueryVal = queryVals[i];
                // console.log('[Scraper SSR] getSelection debug1.1', { curQueryVal, pageIsDefined: !!page, pageText: page.innerText })

                res.push(this.evaluateElelemt(page, curQueryVal));
            }

            // console.log('[Scraper SSR] getSelection debug2', { queryVals, res })

            return Promise.all(res);
        }
        // Recursion case
        else {
            let masterResult = [];
            
            // Loop through all of the queries
            for(let i = 0; i < queryVals.length;i++) {
                const queryVal = queryVals[i].val || queryVals[i];
                let primaryElements = await page.$$(queryVal);

                // Process each matching element
                for(let i = 0; i < primaryElements.length;i++) {
                    let elem = primaryElements[i];

                    // console.log('[Scraper SSR] getSelection debug recurse', { elem: elem.innerText, queryVal, len: primaryElements.length, i })

                    let recursionResult = this.getSelection(elem, query.query);

                    // console.log('[Scraper SSR] getSelection debug recursion popping', { elem: elem.innerText, queryVal, len: primaryElements.length, i, recursionResult })

                    masterResult.push(recursionResult);
                }
            };
            return Promise.all(masterResult);
        }
    }

    // Main Method
    async run({ url, query }) {
        // Profile lambdaLoad
        let startTime = new Date();
        took(loadTime, startTime, '-------- Lambda loading --------');

        let page = await this.waitTillPageLoads(url);

        if (!page) {
            console.trace('Page is not defined!!', { page, url, query });
            return;
        }

        // Profile pageLoad
        let pageLoaded = new Date();
        took(startTime, pageLoaded, '-------- Function waitTillPageLoads --------');

        // Wait for first selector before proceeding
        await page.waitFor(query.val || query);

        // Profile waitFor
        let waitFor = new Date();
        took(pageLoaded, waitFor, '-------- Function waitForSelector --------');
        
        // console.log('[Scraper SSR] run debug1', { url, query });

        let result = await this.getSelection(page, query);

        // console.log('[Scraper SSR] run debug2', { result });

        // Profile getSelection
        let getSelection = new Date();
        took(waitFor, getSelection, '-------- Function getSelection --------');

        // Close browser and return
        // this.closeBrowser();
        return result;
    }
}

let scraper;
module.exports = {
    scraper: new ScraperSSR(),
    lambdaHandler: async (event, context, _this) => {
        let result = null;
        let browser = null;

        if(!scraper) scraper = new ScraperSSR();

        try {
            let params = JSON.parse(event.body);
            result = await scraper.run(...params);
        } catch (error) {
            return context.fail(error);
        } finally {
            if (browser !== null) {
                await browser.close();
            }
        }

        return context.succeed({statusCode: 200, body: JSON.stringify(result)});
    }
}