
const FormatService = require('../services/FormatService');
const DateService = require('../services/DateService');
const Widget = require('../services/Widget');

exports.lambdaHandler = new Widget('3BY_YOGA', '3 Bridges Yoga', 'Portsmouth', '3BridgesYoga-wide-640.png', '3BYfavicon.png',
    [
        'https://www.3bridgesyoga.com/portsmouth-schedule/?tribe_event_display=month',
        {
            query: '.tribe-events-thismonth,.tribe-events-othermonth .type-tribe_events',
            attribute: 'data-tribejson',
            json: true
        }
    ],
    async (element) => {
        // console.log('FoundEvent', JSON.stringify(element, null, 2));
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
                monthDayEnd = endTime + ' ' + monthDay;
                rawDateEnd = DateService.stringMDToDate(monthDayEnd);
            }
        }
        let rawDate = DateService.stringMDToDate(monthDayStart || monthDay);
        // ------

        return FormatService.formatEvent(element.title, rawDate, rawDateEnd);
    }).createLambdaHandler();
    // event => FormatService.formatEvent(event[0] + event[1], event[2], event[3])).createLambdaHandler();