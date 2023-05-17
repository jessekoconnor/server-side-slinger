
const FormatService = require('../services/FormatService');
const Widget = require('../components/Widget');

const key = 'PressRoom';
const title = 'Press Room';
const subtitle = 'Portsmouth';

let core = new Widget({
    key,
    title,
    subtitle,
    config: {
        url: 'https://pressroomnh.com/live-music-portsmouth-nh-events/',
        query: {
            val: 'div.wpb_wrapper > div.wpb_row',
            query: [
                // Contains title
                'h2',
                // Date
                'h6',
            ],
        },
        postProcessing: event => {
            if(!event[0] || !event[1]) return;
            
            const title = event[0];
            let dateString = event[1];

            // change dateString to be a string up until a '|' char
            const pipeIndex = dateString.indexOf('|');
            if (pipeIndex > -1) {
                dateString = dateString.substring(0, pipeIndex);
            }

            // console.log('Hello456!!!!', JSON.stringify({ title, dateString }, null, 2));

            return FormatService.formatEvent(title, dateString);
        },
    },
});

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;