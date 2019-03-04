
const FormatService = require('../services/FormatService');
const Widget = require('../services/Widget');

exports.lambdaHandler = new Widget('PRESS_ROOM', 'Press Room', 'Portsmouth', '', '',
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
    }).createLambdaHandler();