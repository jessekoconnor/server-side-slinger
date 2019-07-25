class DateService {

    constructor() {
        this.days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];
        this.months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
    }

    // Get AM/PM format from a date
    formatAMPM(date) {
        // var hours = date.getHours();
        // var minutes = date.getMinutes();
        // var ampm = hours >= 12 ? 'pm' : 'am';
        // hours = hours % 12;
        // hours = hours ? hours : 12; // the hour '0' should be '12'
        // minutes = minutes < 10 ? '0'+minutes : minutes;
        // var strTime = hours + ':' + minutes + ' ' + ampm;
        // return strTime;

        // DST fix for now
        date.setHours(date.getHours() - 1);

        let options = {};
        options.timeZone = 'America/New_York';
        // options.timeZoneName = 'short';
        let timeString = date.toLocaleTimeString('en-US', options);
        console.log('gotHere0', timeString);
        console.log('gotHere1', timeString.substr(0,4), timeString.substr(7));
        return timeString.substring(0,4) + timeString.substr(7);
    }

    // First try to just make a date first, then try other options
    tryToFormatDate(dateStr) {
        let newDate = new Date(dateStr);
        if (isNaN(newDate.getTime())) {
            return this.stringMDToDate(dateStr);
        } else return newDate;
    }

    // Creates a date from a string. Date is in current year.
    // 'December 29' => '2018-12-29T00:00:00.000Z'
    // 'December 29 2018' => '2018-12-29T00:00:00.000Z'
    // '1:00 AM December 29 2018' => '2018-12-29T06:00:00.000Z'
    stringMDToDate(string) {
        console.log('stringMDToDate', string);
        let newStr = string,
            newDate;

        var q = new Date();
        var y = q.getFullYear();

        // Add year if necessary
        if(newStr.indexOf(y) < 0) {
            newStr += ' ' + y;
        }

        // Turn 9pm into 9:00 pm
        newStr = newStr.replace(/\s?([\d])([am|pm|AM|PM])/, ' $1:00 $2');
        // Turn 7:30pm into 7:30 pm
        newStr = newStr.replace(/([\d]:\d\d)([am|pm|AM|PM])/, ' $1:00 $2');

        // Add timezone
        if(newStr.indexOf('EST') < 0) {
            newStr += ' ' + 'EST';
        }

        console.log('stringMDToDate2', newStr);

        newDate = new Date(newStr);
        if (isNaN(newDate.getTime())) {
            return 'Could not derive a date from(' + string + ' turned into ' + newStr + ')';
        } else return newDate;
    }

    dateToString(date) {
        let str = '';
        str += this.days[date.getDay()] + ' ';
        str += this.months[date.getMonth()] + ' ';
        str += date.getDate();
        return str;
    }

    inPast(date) {
        // Check back 24 hours becuase were not using exact times here yet
        return date < new Date(new Date().getTime() - (1000 * 60 * 60 * 24));
    } inFuture(date) {
        return !this.inPast(date);
    }
}

module.exports = new DateService();