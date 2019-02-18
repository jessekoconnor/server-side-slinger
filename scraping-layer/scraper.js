let
    // puppeteer = require('puppeteer'),
    puppeteer = require('puppeteer-core'),
    chromium = require('chrome-aws-lambda'),
    browser,
    took = (start, end, label) => {
        let dif = start.getTime() - end.getTime(),
            Seconds_from_T1_to_T2 = dif / 1000,
            Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        console.log(label + " took: ", Seconds_Between_Dates);
    },
    loadTime = new Date();

class Scraper {

    // Hold up until the page loads
    async waitTillPageLoads(url) {
        try {
            let startTime = new Date();
            // browser = await puppeteer.launch({headless: true});
            if(!browser) {
                console.log('Generating browser...');
                browser = await puppeteer.launch({
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath,
                    headless: chromium.headless,
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
            console.log('could not load page: ', error);
        }
    }

    // async closeBrowser() {
    //     await browser.close();
    // }

    // Extract data from an element
    async evaluateElelemt(page, selector) {
        if(typeof selector === 'string') {
            return await page.$$eval(selector, async nodes => {
                if(nodes.length === 1) return nodes[0].innerText;
                return nodes.map(n => n.innerText);
            });
        } else {
            return await page.$$eval(selector.query, async (nodes,attr) => {
                console.log('gotAttributeNode', nodes[0]);
                if(nodes.length === 1) return nodes[0].getAttribute(attr);
                return nodes.map(n => n.getAttribute(attr));
            }, selector.attribute);
        }
    }

    // Turn pages and selectors into data
    async getSelection(page, selector, subSelectors) {
        // Base case
        if(!subSelectors) {
            return this.evaluateElelemt(page, selector);
        }
        // Recursion case
        else {
            let primaryElements = await page.$$(selector),
                masterResult = [];

            // Map primary selections To an array containing all subselections
            // for each primay selection
            for(let i = 0; i < primaryElements.length;i++) {
                let elem = primaryElements[i],
                    subselections = [];
                // for each subselection
                for(let j=0;j<subSelectors.length;j++) {
                    let subSel = await this.getSelection(elem, subSelectors[j]);
                    // save subselection
                    subselections.push(subSel);
                }
                // save that set of subselections to primary entry
                masterResult.push(subselections);
            }
            return masterResult;
        }
    }

    // Main Method
    async run(url, primarySelector, subSelectors) {
        // Profile lambdaLoad
        let startTime = new Date();
        took(loadTime, startTime, '-------- Lambda loading --------');

        let page = await this.waitTillPageLoads(url);

        // Profile pageLoad
        let pageLoaded = new Date();
        took(startTime, pageLoaded, '-------- Function waitTillPageLoads --------');

        // console.log('[Scraper SSR] run debug', url, primarySelector, subSelectors);

        // Wait for first selector before proceeding
        await page.waitFor(primarySelector);

        // Profile waitFor
        let waitFor = new Date();
        took(pageLoaded, waitFor, '-------- Function waitForSelector --------');

        let result = await this.getSelection(page, primarySelector, subSelectors);

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
    scraper: new Scraper(),
    lambdaHandler: async (event, context, _this) => {
        let result = null;
        let browser = null;

        if(!scraper) scraper = new Scraper();

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