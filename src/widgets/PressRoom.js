
const FormatService = require('../services/FormatService');
const Widget = require('../services/Widget');

const key = 'PressRoom';
const title = 'Press Room';
const subtitle = 'Portsmouth';

let core = new Widget(key, title, subtitle,
    [
        'https://pressroomnh.com/portsmouth-nh-events/month/',
        {
            query: 'div.tribe_events',
            attribute: 'data-tribejson',
            json: true
        }
    ],
    async event => {
        return FormatService.formatEvent(event.title, event.dateDisplay || event.startTime);
    });

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;