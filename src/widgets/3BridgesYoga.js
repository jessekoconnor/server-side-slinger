
const FormatService = require('../services/FormatService');
const DateService = require('../services/DateService');
const Widget = require('../components/Widget');

const key = '3BridgesYoga';
const title = '3 Bridges Yoga';
const subtitle = 'Portsmouth';

let core = new Widget(key, title, subtitle,
    [
        'https://www.3bridgesyoga.com/portsmouth-schedule/?tribe_event_display=month',
        {
            query: '.tribe-events-present,.tribe-events-future .type-tribe_events',
            primary: '.tribe-event-day-28',
            attribute: 'data-tribejson',
            json: true
        }
    ],
    async (element) => {
        // console.log('FoundEvent', JSON.stringify(element, null, 2));
        console.log('FoundEvent', element.dateDisplay, element.title);
        if(!element.dateDisplay) return;
        // ------
        // Get rawDate, start and end times
        let rawDateString = element.dateDisplay,   //    December 29 @ 9:30 AM - 10:30 AM @
            splitString = rawDateString.split('@'), // [ 'December 29 ', ' 8:00 AM - 9:00 AM' ]
            monthDay = splitString[0].trim(),
            time = splitString[1],
            startTime, endTime, monthDayStart, monthDayEnd, rawDateEnd;

        if(time) {
            let splitStartEndTimes = time.trim().split('-'); // [' 8:00 AM ', ' 9:00 AM']
            startTime = splitStartEndTimes[0].trim();
            endTime = splitStartEndTimes[1].trim();

            if(startTime) {
                monthDayStart = monthDay + ' ' + startTime;
            }
            if(endTime) {
                monthDayEnd = monthDay + ' ' + endTime;
                rawDateEnd = DateService.stringMDToDate(monthDayEnd);
            }
        }
        let rawDate = DateService.stringMDToDate(monthDayStart || monthDay);
        // ------

        console.log('Got:', FormatService.formatEvent(element.title, rawDate, rawDateEnd));
        return FormatService.formatEvent(element.title, rawDate, rawDateEnd);
    });

exports.lambdaHandler = core.createLambdaHandler();
exports.scrapeAndCache = core.createScrapingHandler();
exports.functionName = key;
