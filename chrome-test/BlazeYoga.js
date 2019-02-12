class BlazeYoga {

    constructor() {
        this.DateService = require('./DateService');
        this.s3Prefix = 'https://s3.amazonaws.com/dashmobile/img/';
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
            result: data
        }
    }

    scrape() {
        return new Promise((resolve) => {
            let ScraperSSR = require('./ScraperSSR');

            ScraperSSR.scraper.run('https://www.blazenh.com/schedule', 'div.bw-session__basics',
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
                ]).then((events) => {
                // console.log('Scraping Handler: Blaze Yoga scraper returns: ', events);

                let header = this.formatheader('Blaze Yoga', 'Portsmouth', '', '');

                // Combine instructor into title for now
                events = events.map(event => (this.formatEvent(event[0] + event[1], event[2], event[3])));

                resolve(this.formatResponse(header, events));
            }).catch(err => (console.log(err)));
        });
    }
};

let lambdaCore;
module.exports = {
    lambdaHandler: async (event, context) => {
        let result = null;

        if(!lambdaCore) lambdaCore = new BlazeYoga();

        try {
            result = await lambdaCore.scrape();
        } catch (error) {
            return context.fail(error);
        }


        return context.succeed({statusCode: 200, body: JSON.stringify(result)});
    }
}