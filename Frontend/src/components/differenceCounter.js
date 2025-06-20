const getDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  function calculateLeaveDays(
    startDate,
    endDate,
    startDayType = 0,
    endDayType = 0
  ) {
    const workingDays = getDifference(startDate, endDate);

    let leaveDays;

    if (workingDays === 1) {
      // Same-day leave
      if (startDayType === 1 && endDayType === 2) return 1;
      if (startDayType === 1 && endDayType === 1) return 0.5;
      if (startDayType === 2 && endDayType === 2) return 0.5;
      return 1; // Full day
    }

    // Multi-day leave
    leaveDays = workingDays;
    if (startDayType === 1 || startDayType === 2) leaveDays -= 0.5;
    if (endDayType === 1 || endDayType === 2) leaveDays -= 0.5;

    return leaveDays;
  }

  export default calculateLeaveDays;