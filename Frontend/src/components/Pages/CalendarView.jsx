import React, { useEffect, useState } from "react";
import moment from "moment";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import { Token } from "../Token";
import TeamLeaveCalendar from "./TeamLeaveCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import '../../style/common-calendar.css'
import Side_nav from "../Side_nav";

const localizer = momentLocalizer(moment);
const COLORS = {
  holiday: "#d9534f",
  floater: "#9c27b0",
  "Week Off": "#6c757d",
  self: "#4caf50",
  peer: "#2196f3",
};

export default function CalendarView() {
  const { decode, token } = Token();
  const [commonEvents, setCommonEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("common"); 

  const normalizeUtc = (iso) => moment.utc(iso).local().startOf("day").toDate();

  useEffect(() => {
    async function fetchCommon() {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const res = await fetch(
        `http://localhost:1110/calendar/events/${decode.id}?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      const common = data
        .filter((ev) => ["government", "floater", "Week Off"].includes(ev.type))
        .map((e) => ({
          title: e.name,
          start: normalizeUtc(e.start_date),
          end: normalizeUtc(e.end_date),
          allDay: true,
          category: e.type,
        }));

      setCommonEvents(common);
    }

    fetchCommon();
  }, [date, decode.id, token]);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: COLORS[event.category] || COLORS[event.type] || "#999",
      color: "white",
    },
  });

  const dayPropGetter = (date) =>
    [0, 6].includes(moment(date).day())
      

  return (
    <div  className=" width overall-calendar">
      <Side_nav/>

      <div className="grid">
      <div className="btn-div">
        <button
        className="common-calendar-btn"
          onClick={() => setViewMode("common")}
          style={{
            fontWeight: viewMode === "common" ? "bold" : "normal",
            backgroundColor: viewMode==="common" ? "#262626" : "transparent"
          }}
        >
          Common Calendar
        </button>
        <button
        className="team-calendar-btn"
          onClick={() => setViewMode("team")}
          style={{
            fontWeight: viewMode === "team" ? "bold" : "normal",
            backgroundColor: viewMode==="team" ? "#262626" : "transparent"
          }}
        >
          Team Calendar
        </button>
      </div>

      {viewMode === "common" ? (
        <div className="calendar-container">
          <h2>Common Calendar</h2>
          <BigCalendar className="common-calendar"
            localizer={localizer}
            events={commonEvents}
            startAccessor="start"
            endAccessor="end"
            date={date}
            onNavigate={setDate}
            views={["month"]}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
          />
        </div>
      ) : (
        <div className="calendar-container">
          <h2>Team Calendar</h2>
          <TeamLeaveCalendar
          className="team-calendar"
            user={decode}
            date={date}
            token={token}
            onNavigate={setDate}
            dayPropGetter={dayPropGetter}
          />
        </div>
      )}
      </div>
    </div>
  );
}
