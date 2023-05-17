
const FormatService = require('../services/FormatService');
const Widget = require('../components/Widget');

const key = 'BookAndBar';
const title = 'Book & Bar';
const subtitle = 'Portsmouth';

let core = new Widget(
    {
        key,
        title,
        subtitle,
        config: {
            url: 'https://www.bookandbar.com/events-upcoming#/events',
            query: {
                val: 'div.events-container div.event-card',
                query: [
                    // Contains title
                    'div.event-name',
                    // Contains subTitle
                    'div.support',
                    // date
                    'span.date',
                    // time
                    'span.time',
                ],
            },
            postProcessing: event => {
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
            },
        },
    }
);    

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;
