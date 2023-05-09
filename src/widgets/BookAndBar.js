
const FormatService = require('../services/FormatService');
const Widget = require('../components/Widget');

const key = '3SArtspace';
const title = '3SArtspace';
const subtitle = 'Portsmouth';

let core = new Widget(key, title, subtitle,
    [
        'https://www.bookandbar.com/events-upcoming#/events',
        'div.events-container div.event-card',
        [
            // Contains title
            'div.event-name',
            // Contains subTitle
            'div.support',
            // date
            'span.date',
            // time
            'span.time',
        ]
    ],
    async event => {
        console.log('BookAndBar events!!!!', JSON.stringify({ event }, null, 2));

        let title = event[0];
        let subTitle = event[1];
        // append subtitle
        if (subTitle) {
            title += ` - ${subTitle}`;
        };

        const startDate = event[2];
        const startTime = event[3];
        const startDateAndTime = `${startDate} ${startTime}`;

        return FormatService.formatEvent(title, startDateAndTime, null, { title, subTitle, startDate, startTime });
    });    

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;