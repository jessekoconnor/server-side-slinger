const s3Prefix = 'https://s3.amazonaws.com/dashmobile-deploy/img/';

module.exports = new class FormatService {
    constructor() {
        this.DateService = require('./DateService');
    }

    tryCatch(fun) {
        try {
            return fun();
        } catch (e) {
            return 'Caught on : ' + e.toString();
        }
    }

    // Format events all in one place
    formatEvent(title, dateStringStart, dateStringEnd, additionalContext) {
        // Grab raw date nice and easy
        let parsedStartDate = this.tryCatch(() => (this.DateService.tryToFormatDate(dateStringStart))),
            parsedEndDate = dateStringEnd ? this.tryCatch(() => (this.DateService.tryToFormatDate(dateStringEnd))) : undefined;

        console.log('formatEvent', JSON.stringify({ title, dateStringStart, dateStringEnd, parsedStartDate, parsedEndDate }, null, 2))

        return {
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            title: title,
            context: { title, dateStringStartRaw: dateStringStart, dateStringEndRaw: dateStringEnd, additionalContext },
            humanReadable: this.DateService.getLocalDateTime({ start: parsedStartDate, end: parsedEndDate }),
        };
    }

    // Format the header in one place
    formatheader(title, subtitle, widgetKey) {
        return {
            title: title,
            subTitle: subtitle,
            imageFile: s3Prefix + 'avatar/' + widgetKey + '.png',
            avatar32x32url: s3Prefix + 'favicon/' + widgetKey  + '.png'
        };
    }

    formatResponse(header, data) {
        return {
            header: header,
            events: data
        }
    }
}