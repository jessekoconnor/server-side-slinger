
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
                console.log('Music Hall events!!!!', JSON.stringify({ event }, null, 2));

                const [ month, day, _titlesAndTimes ] = event;
                if (!month || !day || !_titlesAndTimes?.length) return;

                const dataToFormat = [];
                const dataIfArrayOfStrings = [];
                
                // Could be array of arrays or array of strings
                let dataIsArrayOfArrays = false;
                _titlesAndTimes.forEach(_titleAndOrTime => {
                    if (Array.isArray(_titleAndOrTime)) {
                        // this day has multiple events
                        dataIsArrayOfArrays = true;
                        const [ title, time ] = _titleAndOrTime;
                        // console.log('Music Hall events!!!! -- array', JSON.stringify({ title, time, month, day, _titleAndOrTime }, null, 2));
                        dataToFormat.push({ title, time, month, day });
                    }
                    else {
                        dataIfArrayOfStrings.push(_titleAndOrTime);
                        // console.log('Music Hall events!!!! - non array', JSON.stringify({  _titleAndOrTime }, null, 2));
                    }
                });

                // If not array of arrays, then it's an array of strings and we need to grab the fields to format a single event
                if (!dataIsArrayOfArrays) {
                    const [ title, time ] = dataIfArrayOfStrings;
                    dataToFormat.push({ title, time, month, day });
                }

                // console.log('Music Hall events!!!!', JSON.stringify({ dataToFormat, dataIsArrayOfArrays }, null, 2));

                // Because this could be multiple events in one day, we need to format each one
                return dataToFormat.map(({ title, time, month, day }) => {
                    const dateAndTime = `${month} ${day} ${time}`;
                    return FormatService.formatEvent(title, dateAndTime, null, { title, time, month, day, dataToFormat });
                });
            },
        },
    }
);

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;
