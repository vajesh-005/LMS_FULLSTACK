import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../style/calendar.css";

function RangeCalendar({ startDate, endDate, onDateChange = () => {} }) {
  const [range, setRange] = useState([
    {
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      key: "selection",
    },
  ]);

  const handleChange = (item) => {
    const selection = item.selection;
    setRange([selection]);

    const toYMD = (date) => date.toLocaleDateString("en-CA");
    const start_date = toYMD(selection.startDate);
    const end_date = toYMD(selection.endDate);

    onDateChange({ start_date, end_date });
};

  return (
    <div className="range-wrapper">
      <DateRange
        editableDateInputs={true}
        onChange={handleChange}
        moveRangeOnFirstSelection={false}
        ranges={range}
        className="calendar-element"
        minDate={new Date()}
        // disabledDay={(date) => {
        //   const day = date.getDay();
        //   return day === 0 || day === 6; // Disable Sunday and Saturday
        // }}
      />
    </div>
  );
}

export default RangeCalendar;
