
const FormatService = require('../services/FormatService');
const Widget = require('../services/Widget');

exports.lambdaHandler = new Widget('BLAZE_YOGA', 'Blaze Yoga', 'Portsmouth', '', '',
    [
        'https://www.blazenh.com/schedule',
        'div.bw-session__basics',
        [
            // Class
            '.bw-session__type',
            // Instructor
            '.bw-session__staff',
            // Start time
            {
                query: '.hc_starttime',
                attribute: 'datetime'
            },
            // End time
            {
                query: '.hc_endtime',
                attribute: 'datetime'
            }
        ]
    ],
    event => FormatService.formatEvent(event[0] + event[1], event[2], event[3])).createLambdaHandler();