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
        // console.log('[Scraper SSR] evaluateElelemt', { selectorType: typeof selector, pageIsDefined: !!page });
        if (!page) {
            console.trace('page is not defined', { page, selector });
            return;
        }
        if(typeof selector === 'string') return this.getInnerText(page, selector);
        return this.getInnerAttributes(page, selector);
    }

    // Turn pages and selectors into data
    async getSelection(page, query, depth = 1) {
        const queries = Array.isArray(query) ? query : [query];
        
        // console.log('[Scraper SSR] getSelection top level', { query, pageIsDefined: !!page })
        const baseCaseResults = [];
        let recursionResults = [];

        for(let i = 0; i < queries.length; i++) {
            const curQuery = queries[i];
            const queryVal = curQuery.val || curQuery;

            // Base case
            if(!curQuery.query) {
                // console.log('[Scraper SSR] getSelection basecase1', { queryVals })

                // console.log('[Scraper SSR] getSelection basecase1.1', { curQuery, pageIsDefined: !!page, pageText: page.innerText })

                // const promise = await this.evaluateElelemt(page, curQuery);
                const promise = this.evaluateElelemt(page, curQuery);
                baseCaseResults.push(promise);

                // console.log('[Scraper SSR] getSelection basecase2', { queries, res })
            }
            // Recursion case
            else {
                let primaryElements = await page.$$(queryVal);

                // Process each matching element
                for(let i = 0; i < primaryElements.length;i++) {
                // for(let i = 0; i < 1;i++) {
                    let elem = primaryElements[i];

                    // console.log('[Scraper SSR] getSelection debug recurse', { elem: elem.innerText, queryVal, len: primaryElements.length, i })

                    let recursionResult = this.getSelection(elem, curQuery.query, depth + 1);
                    // let recursionResult = await this.getSelection(elem, curQuery.query, depth + 1);

                    // console.log('[Scraper SSR] getSelection debug recurse2', { elem: elem.innerText, recursionResult, len: primaryElements.length, i })

                    // console.log('[Scraper SSR] getSelection debug recursion popping', { elem: elem.innerText, queryVal, len: primaryElements.length, i, recursionResult })

                    recursionResults.push(recursionResult);
                }
            };
        }

        const [baseCasesResolved, recurionCasesResolved] = await Promise.all([
            Promise.all(baseCaseResults),
            Promise.all(recursionResults),
        ]);
        // const [baseCasesResolved, recurionCasesResolved] = [baseCaseResults, recursionResults];

        const combinedResults = this.arr1ByArr2(baseCasesResolved, recurionCasesResolved);
        const flattened = this.flattenToTwoDinesionalArray(combinedResults);
        // console.log('[Scraper SSR] getSelection debug recursion popping', JSON.stringify({ baseCasesResolved, recurionCasesResolved, combinedResults, flattened, depth }, null, 2));

        return combinedResults;
        // return [...baseCaseResults, ...recursionResults];
    }

    // Flatten two arrays together
    // arr1 = [1,2,3] arr2 = [4,5]
    // result = [[1,2,3,4], [1,2,3,5]]
    arr1ByArr2(arr1, _arr2) {
        let result = [];

        // console.log('flattenArrays debug1', JSON.stringify({ arr1, _arr2, arr1IsEmpty: this.isEmptyArrayOrArrayOfEmptyArrays(arr1), arr2IsEmpty: this.isEmptyArrayOrArrayOfEmptyArrays(_arr2) }, null, 2));

        if (this.isEmptyArrayOrArrayOfEmptyArrays(arr1)) return _arr2;
        if (this.isEmptyArrayOrArrayOfEmptyArrays(_arr2)) return arr1;

        const arr2 = this.isArrayOfArrays(_arr2) ? _arr2 : [_arr2];
        for(let j = 0; j < arr2.length; j++) {
            let arr2Array = arr2[j];
            // console.log('flattenArrays debug2', JSON.stringify({ arr1,arr2, _arr2, isArrofArrs: this.isArrayOfArrays(_arr2), arr2Array, res: [...arr1, ...arr2Array] }, null, 2))
            result.push([...arr1, ...arr2Array]);
        }

        if (this.isArrayOfArraysButOnlyOneElementNested(result)) return result[0];

        return result;
    }

    // flattens X dimensional array to 2 dimensional array if X is greater than 2
    flattenToTwoDinesionalArray(arr, maxArrayDimensions = 2, depth = 1) {
        // console.log('flattenToTwoDinesionalArray debug0', JSON.stringify({ arr, maxArrayDimensions, depth }, null, 2));

        if (!Array.isArray(arr)) return arr;

        let toRet = [];
        for(let i = 0; i < arr.length; i++) {
            const elem = arr[i];

            if (!Array.isArray(elem)) toRet.push(elem);
            else {
                const arrDepth = this.getDepthOfArray(elem);
                const depthGreaterThanDesired = arrDepth > maxArrayDimensions - 1;
                let flattened = false;
                // console.log('flattenToTwoDinesionalArray debug1', JSON.stringify({ elem, toRet, depth, maxArrayDimensions, depthGreaterThanDesired, arrDepth, maxArrayDimensions }, null, 2))
                if (depthGreaterThanDesired) {
                    flattened = this.flattenToTwoDinesionalArray(elem, maxArrayDimensions, depth + 1);
                    toRet = toRet.concat(flattened);
                }
                else {
                    toRet.push(elem);
                }
                // console.log('flattenToTwoDinesionalArray debug2', JSON.stringify({ arr, elem, toRet, depth, i, flattened, maxArrayDimensions, depthGtDesired: depth > 2, arrDepth, maxArrayDimensions }, null, 2))
            }
        }
        return toRet;




        const arrayDepth = this.getDepthOfArray(arr);
        console.log('flattenToTwoDinesionalArray debug1', { arr, depth, depthGt2: depth > 2, arrayDepth })

        if (arrayDepth < desiredDepth + 1) return arr;
        const flattenedOneLevel = this.flattenArray(arr);
        const res = this.flattenToTwoDinesionalArray(flattenedOneLevel, desiredDepth, depth + 1);
        console.log('flattenToTwoDinesionalArray debug2', { arr, depth, depthGt2: depth > 2, arrayDepth, res })
        return res;
    }

    getDepthOfArray(arr, depth = 0) {
        if (!Array.isArray(arr)) return depth;
        return this.getDepthOfArray(arr[0], depth + 1);
    }

    // flattens 2 dimensional array to 1 dimensional array

    flattenArray(arr) {
        console.log('flattenArray debug1', JSON.stringify({ arr }, null, 2))
        if (!Array.isArray(arr)) return arr;
        console.log('flattenArray debug2', { arr, reduced: arr.reduce((acc, val) => acc.concat(val), []) })
        return arr.reduce((acc, val) => {
            const depthOfVal = this.getDepthOfArray(val);
            if (depthOfVal < 2) {
                console.log('flattenArray debug3', { arr, val, depthOfVal, acc, res: [...acc, val] })
                return acc.push(val);
            }
            console.log('flattenArray debug4', { arr, val, depthOfVal, acc, res: acc.concat(val) })
            return acc.concat(val);
        }, []);
    }

    isArrayOfArraysButOnlyOneElementNested(arr) {
        return Array.isArray(arr) && Array.isArray(arr[0]) && arr.length === 1;
    }

    isArrayOfArrays(arr) {
        return Array.isArray(arr) && Array.isArray(arr[0]);
    }

    isEmptyArrayOrArrayOfEmptyArrays(arr) {
        return Array.isArray(arr) && (arr.length === 0 || (Array.isArray(arr[0]) && arr[0].length === 0));;
    };

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

const ScraperSSRInstance = new ScraperSSR();

let scraper;
module.exports = {
    scraper: ScraperSSRInstance,
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