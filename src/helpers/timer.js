module.exports = {
    took: (start, end, message) => {
        let dif = start.getTime() - end.getTime(),
            Seconds_from_T1_to_T2 = dif / 1000,
            Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);

        console.log(message + " took: ", Seconds_Between_Dates);
    },
    allEventsAreNew: (events, days = 10) => {
        for(let i = 0; i < events.length; i++) {
            const startTime = new Date(events[i].startDate);
            const tenDaysAgo = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * days));
            if (startTime.getTime() < tenDaysAgo.getTime()) {
                console.error('Event is not new', events[i]);
                return false;
            }
        }
        return true;
    },
};
