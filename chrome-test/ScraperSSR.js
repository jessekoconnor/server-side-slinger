let
    // puppeteer = require('puppeteer'),
    puppeteer = require('puppeteer-core'),
    chromium = require('chrome-aws-lambda'),
    browser;

class ScraperSSR {

    // Hold up until the page loads
    async waitTillPageLoads(url) {
        try {
            // browser = await puppeteer.launch({headless: true});
            browser = await puppeteer.launch({
                  args: chromium.args,
                  defaultViewport: chromium.defaultViewport,
                  executablePath: await chromium.executablePath,
                  headless: chromium.headless,
                });
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'domcontentloaded'});
            return page;
        } catch (error) {
            console.log('could not load page: ', error);
        }
    }

    async closeBrowser() {
        await browser.close();
    }

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
        let page = await this.waitTillPageLoads(url);

        console.log('gotHere1', url, primarySelector, subSelectors);

        // Wait for first selector before proceeding
        await page.waitFor(primarySelector);

        let result = await this.getSelection(page, primarySelector, subSelectors);

        // Close browser and return
        this.closeBrowser();
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