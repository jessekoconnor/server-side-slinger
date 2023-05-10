
const FormatService = require('../services/FormatService');
const Widget = require('../components/Widget');

const key = '3SArtspace';
const title = '3SArtspace';
const subtitle = 'Portsmouth';

let core = new Widget(key, title, subtitle,
    [
        'https://www.3sarts.org/theater-performances/local-music',
        'div.calendar div.calendar-event-details',
        [
            // Contains title
            'h1',
            // <time>noon</time>
            'time'
        ]
    ],
    async event => {
        // console.log('3s events!!!!', JSON.stringify({ event }, null, 2));
        return FormatService.formatEvent(event[0], event[1]);
    });    

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;
