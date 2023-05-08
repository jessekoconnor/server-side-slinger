
const FormatService = require('../services/FormatService');
const Widget = require('../components/Widget');

const key = 'PressRoom';
const title = 'Press Room';
const subtitle = 'Portsmouth';

// let core = new Widget(key, title, subtitle,
//     [
//         'https://pressroomnh.com/live-music-portsmouth-nh-events/',
//         {
//             query: 'div.tribe_events',
//             attribute: 'data-tribejson',
//             json: true
//         }
//     ],
//     async event => {
//         return FormatService.formatEvent(event.title, event.dateDisplay || event.startTime);
//     });

let core = new Widget(key, title, subtitle,
    [
        'https://pressroomnh.com/live-music-portsmouth-nh-events/',
        'div.wpb_wrapper > div.wpb_row',
        [
            // Contains title
            'h2',
            // Date
            'h6',
        ]
    ],
    async event => {
        if(!event[0] || !event[1]) return;
        
        // console.log('Hello123!!!!', JSON.stringify({ event }, null, 2));
        const title = event[0];
        let dateString = event[1];


        // change dateString to be a string up until a '|' char
        const pipeIndex = dateString.indexOf('|');
        if (pipeIndex > -1) {
            dateString = dateString.substring(0, pipeIndex);
        }

        console.log('Hello456!!!!', JSON.stringify({ title, dateString }, null, 2));

        return FormatService.formatEvent(title, dateString);
    });

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;