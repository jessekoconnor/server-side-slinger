module.exports = {
    took: (start, end, message) => {
        let dif = start.getTime() - end.getTime(),
            Seconds_from_T1_to_T2 = dif / 1000,
            Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);

        console.log(message + " took: ", Seconds_Between_Dates);
    },
};
