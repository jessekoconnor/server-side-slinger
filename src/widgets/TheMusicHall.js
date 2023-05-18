
const FormatService = require('../services/FormatService');
const Widget = require('../components/Widget');

const key = 'TheMusicHall';
const title = 'The Music Hall';
const subtitle = 'Portsmouth';

let core = new Widget(
    {
        key,
        title,
        subtitle,
        config: {
            url: 'https://www.themusichall.org/calendar/?exclude=&month=2023-06',
            query: {
                val: 'div.day--has-events',
                query: [
                    // month
                    'span.day__month',
                    // day
                    'span.day__number',
                    {
                        val: 'li.xdgp_genre-music',
                        query: [
                            // title
                            'p.event__title',
                            // time
                            'section.action__time'
                        ]
                    },
                ],
            },
            postProcessing: event => {
                // console.log('Music Hall events!!!!', JSON.stringify({ event }, null, 2));

                const [ month, day, title, _time ] = event;
                if (!month || !day || !title || !_time) return;

                const time = Array.isArray(_time) ? _time[0] : _time;

                const dateAndTime = `${month} ${day} ${time}`;

                return FormatService.formatEvent(title, dateAndTime, null, { month, day, title, time });
            },
        },
    }
);

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;
