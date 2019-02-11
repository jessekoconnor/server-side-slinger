const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.lambdaHandler = async (event, context) => {
    let result = null;
    let browser = null;

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        let page = await browser.newPage();

        console.log('gotHere1');

        await page.goto(event.url || 'https://google.com');

        console.log('gotHere2');

        result = await page.title();
        console.log('gotHere3', result);
    } catch (error) {
        return context.fail(error);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    return context.succeed({statusCode: 200, body: result});
};