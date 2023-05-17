class DateService {

    constructor() {}

    inPast(date) {
        // Check back 24 hours becuase were not using exact times here yet
        return date < new Date(new Date().getTime() - (1000 * 60 * 60 * 24));
    } inFuture(date) {
        return !this.inPast(date);
    }

    // First try to just make a date first, then try other options
    tryToFormatDate(dateStr) {
        let trimmedDateStr = dateStr.trim().toUpperCase();
        let splitStringsToTry = this.splitStringBySpecialChars(trimmedDateStr);

        if (this.isValidIsoDate(trimmedDateStr)) {
            return new Date(trimmedDateStr);
        }

        const strategies = [
            { name: 'ensureTimeZone', func: this.ensureTimeZone.bind(this) },
            { name: 'ensureYear', func: this.ensureYear.bind(this) },
            { name: 'ensureHoursAndAMPMformat', func: this.ensureHoursAndAMPMformat.bind(this) },
            { name: 'ensureSymbolsRemoved', func: this.ensureSymbolsRemoved.bind(this) },
        ];

        // Try each split string separately
        for(let j = 0; j < splitStringsToTry.length; j++) {
            let splitStr = splitStringsToTry[j];

            // Loop through each strategy
            let safeString = splitStr;
            for(let i = 0; i < strategies.length; i++) {
                let strategy = strategies[i];
                safeString = strategy.func(safeString);
                // console.log('tryToFormatDate1', { strategy: strategy.name, splitStr, safeString, isValidDate: this.isValidDate(safeString) });
            }
            // console.log('tryToFormatDate2', { safeString, isValidDate: this.isValidDate(safeString) });
            if (this.isValidDate(safeString)) {
                return new Date(safeString);
            }
        }

        return new Error(`could not parse date from ${trimmedDateStr}`);
    }

    // regex to match only if string is an iso date
    isValidIsoDate(dateStr) {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return isoDateRegex.test(dateStr);
    }

    // split the string into an array of strings split by pipe chars
    splitStringBySpecialChars(dateStr) {
        let trimmedDateStr = dateStr.trim();
        let splitStr = trimmedDateStr.split(/[\|]/);
        // console.log('splitStringBySpecialChars', { trimmedDateStr, splitStr });
        return splitStr;
    }

    // Break down down into parts and create a date
    getLocalDateTime({ start, end }) {
        const options = {
            timeZone: 'America/New_York',
            timeZoneName: 'short',
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            year: 'numeric',
        };

        return {
            // extract just the time of day from a date
            start: start?.toLocaleString('en-US', options),
            end: end?.toLocaleString('en-US', options),
        }
    }

    // Tests is a date is successfully parsed
    isValidDate(dateStr) {
        const dateObj = new Date(dateStr);
        // check if date is valid
        if (Object.prototype.toString.call(dateObj) === "[object Date]") {
            // it is a date
            if (isNaN(dateObj.getTime())) {  // d.valueOf() could also work
                // date is not valid
                return false;
            }
            else {
                // date is valid
                return true;
            }
        }
        return false;
    }


    // String sanitization strategies
    // Tests if a string contains a timezone
    hasTimeZone(dateStr) {
        const timeZones = [
            'est',
            'edt',
            'cst',
            'cdt',
            'mst',
            'mdt',
            'pst',
            'pdt',
            'z',
        ];
        const lowerCaseStr = dateStr.toLowerCase();
        for(let i = 0; i < timeZones.length; i++) {
            let timeZone = timeZones[i];
            if(lowerCaseStr.indexOf(timeZone) > -1) {
                return true;
            }
        }
        return false;
    }
    ensureTimeZone(dateStr) {
        // console.log('ensureTimeZone', dateStr, this)
        if (!this.hasTimeZone(dateStr)) {
            return `${dateStr} EDT`;
        }
        return dateStr;
    }

    ensureYear(dateStr) {
        const year = new Date().getFullYear();
        if (dateStr.indexOf(year) < 0 && dateStr.indexOf(year + 1) < 0) {
            return `${dateStr} ${year}`;
        }
        return dateStr;
    }

    ensureHoursAndAMPMformat(dateStr) {
        let newStr = dateStr;
        let matched = false
        const toTry = [
            // Turn 730pm into 7:30 pm
            {
                name: 'HoursMins am/pm expander',
                search: /(\d\d?)(\d\d)\s?([am|pm|AM|PM])/,
                return: '$1:$2 $3',
            },
            // Turn 7:30pm into 7:30 pm
            // Turn 10:30pm into 10:30 pm
            {
                name: 'HoursMins am/pm expander',
                search: /(\d\d?:\d\d?)\s?([am|pm|AM|PM])/,
                return: '$1 $2',
            },
            // Turn 9pm into 9:00 pm
            {
                name: 'HoursOnly am/pm expander',
                search: /(\d\d?)\s?([am|pm|AM|PM])/,
                return: '$1:00 $2',
            }
        ];
        for(let i = 0; i < toTry.length; i++) {
            let tryThis = toTry[i];
            // console.log('ensureAMPMformat', { tryThis, startStr: dateStr, matches: dateStr.match(tryThis.search), afterIfMatches: dateStr.replace(tryThis.search, tryThis.return) });
            if (dateStr.match(tryThis.search)) {
                newStr = dateStr.replace(tryThis.search, tryThis.return);
                break;
            }
        }
        return newStr;
    }

    ensureSymbolsRemoved(dateStr) {
        return dateStr.replace(/[\@]/g, ' ');
    }
}

module.exports = new DateService();