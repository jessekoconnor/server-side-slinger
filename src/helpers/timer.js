const chai = require('chai');
const expect = chai.expect;

module.exports = {
    took: (start, end, message) => {
        let dif = start.getTime() - end.getTime(),
            Seconds_from_T1_to_T2 = dif / 1000,
            Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);

        console.log(message + " took: ", Seconds_Between_Dates);
    },
    allEventsAreLessThanXDaysOld: (events, days = 10) => {
        events.forEach(event => {
            const startTime = new Date(event.startDate);
            const tenDaysAgo = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * days));
            expect(startTime.getTime()).to.be.greaterThan(tenDaysAgo.getTime());
        });
    }
};
