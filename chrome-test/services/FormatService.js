module.exports = new class FormatService {
    constructor() {
        this.DateService = require('services/DateService');
    }

    tryCatch(fun) {
        try {
            return fun();
        } catch (e) {
            return 'Caught on : ' + e.toString();
        }
    }

    // Format events all in one place
    formatEvent(title, dateStringStart, dateStringEnd) {
        // Grab raw date nice and easy
        let rawDateStart = this.tryCatch(() => (this.DateService.tryToFormatDate(dateStringStart))),
            rawDateEnd = dateStringEnd ? this.tryCatch(() => (this.DateService.tryToFormatDate(dateStringEnd))) : undefined;

        return {
            rawDate: rawDateStart,
            rawDateEnd: rawDateEnd, // doesnt list any
            humanDate: this.tryCatch(() => (this.DateService.dateToString(rawDateStart))),
            startTime: this.tryCatch(() => (this.DateService.formatAMPM(rawDateStart))),
            endTime: this.tryCatch(() => (this.DateService.formatAMPM(rawDateEnd))),
            title: title,
        };
    }

    // Format the header in one place
    formatheader(title, subtitle, avatar, favicon) {
        return {
            title: title,
            subTitle: subtitle,
            imageFile: avatar,
            avatar32x32url: favicon
        };
    }

    formatResponse(header, data) {
        return {
            header: header,
            events: data
        }
    }
}