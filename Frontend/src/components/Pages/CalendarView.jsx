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
  holiday: {
    backgroundColor: "#f9d7d6", // deeper blush
    color: "#d32f2f",            // darker red
  },
  floater: {
    backgroundColor: "#f3d6f7", // richer lavender
    color: "#7b1fa2",            // deeper purple
  },
  "Week Off": {
    backgroundColor: "#dce1e6", // muted gray-blue
    color: "#495057",            // strong slate
  },
  self: {
    backgroundColor: "#d2f0d9", // deeper mint
    color: "#388e3c",            // stronger green
  },
  peer: {
    backgroundColor: "#c9e3fc", // bold sky blue tint
    color: "#1565c0",            // deep blue
  },
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

  const eventStyleGetter = (event) => {
    const colorInfo = COLORS[event.category] || COLORS[event.type];
  
    return {
      style: {
        backgroundColor: colorInfo?.backgroundColor || "#e0e0e0", 
        color: colorInfo?.color || "#333", 
        border: `1px solid ${colorInfo?.color || "#999"}`,
        borderRadius: "5px",
        fontWeight: 500,
        padding: "2px 6px",
      },
    };
  };
  

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
            backgroundColor: viewMode==="common" ? "#1b263b" : "transparent",
            color: viewMode==="common"? "white" : "#1b263b"
          }}
        >
          Common Calendar
        </button>
        <button
        className="team-calendar-btn"
          onClick={() => setViewMode("team")}
          style={{
            fontWeight: viewMode === "team" ? "bold" : "normal",
            backgroundColor: viewMode==="team" ? "#1b263b" : "transparent",
            color: viewMode==="team"? "white" : "#1b263b"
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
