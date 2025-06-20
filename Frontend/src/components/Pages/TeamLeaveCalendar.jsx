import React, { useEffect, useState } from "react";
import moment from "moment";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import BASE_URL from "../url";

const localizer = momentLocalizer(moment);
const COLORS = {
  peer: {
    backgroundColor: "#d2e9fb",
    color: "#1565c0",
    borderLeft: "4px solid #1565c0",
  },
  me: {
    backgroundColor: "#d4f5dc",
    color: "#2e7d32",
    borderLeft: "4px solid #2e7d32",
  },
  manager: {
    backgroundColor: "#fff3cd",
    color: "#b8860b",
    borderLeft: "4px solid #b8860b",
  },
  reportee: {
    backgroundColor: "#f8d7da",
    color: "#a71d2a",
    borderLeft: "4px solid #a71d2a",
  },
  "Week Off": {
    backgroundColor: "#f1f3f5",
    color: "#6c757d",
    borderLeft: "4px solid #6c757d",
  },
};



export default function TeamLeaveCalendar({
  date,
  user,
  token,
  onNavigate,
  dayPropGetter, 
}) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchTeamLeaves() {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const res = await fetch(
        `${BASE_URL}/calendar/events/${user.id}?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      const normalizeUtc = (iso) =>
        moment.utc(iso).local().startOf("day").toDate();

      // Map leave events
      const leaveEvents = data
      .filter((ev) =>
        ["me", "peer", "manager", "reportee"].includes(ev.category)
      )
      .map((ev) => ({
        title: `${ev.name} (${ev.category})`,
        start: normalizeUtc(ev.start_date),
        end: moment(normalizeUtc(ev.end_date)).add(1, "day").toDate(),
        allDay: true,
        category: ev.category,
      }));
    

      // Generate week-off events using the same utility logic
      const weekOffs = [];
      let cursor = moment(date).startOf("month");
      const end = moment(date).endOf("month");
      while (cursor <= end) {
        const dow = cursor.day();
        if (dow === 0 || dow === 6) {
          const day = cursor.toDate();
          weekOffs.push({
            title: "Week Off",
            start: day,
            end: moment(day).add(1, "day").toDate(),
            allDay: true,
            category: "Week Off",
          });
        }
        cursor.add(1, "day");
      }

      // Combine and sort
      const allEvents = [...leaveEvents, ...weekOffs];
      allEvents.sort((a, b) => {
        // ensure week offs stay in calendar but leave coloring is separate
        if (a.category === "peer" && b.category === "me") return -1;
        if (a.category === "me" && b.category === "peer") return 1;
        return 0;
      });

      setEvents(allEvents);
    }

    fetchTeamLeaves();
  }, [date, user.id, token]);

  const eventStyleGetter = (event) => {
    const colorConfig = COLORS[event.category] || {
      backgroundColor: "#e9ecef",
      color: "#343a40",
      borderLeft: "4px solid #343a40",
    };
  
    const isWeekOff = event.title === "Week Off";
  
    return {
      style: {
        backgroundColor: colorConfig.backgroundColor,
        color: colorConfig.color,
        borderLeft: colorConfig.borderLeft,
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 500,
        whiteSpace: "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
        // padding: "2px 4px",
        lineHeight: 1.2,
        ...(isWeekOff && {
          textAlign: "center",
          fontSize: "0.8rem",
        }),
      },
    };
  };
  
  
  const CustomEvent = ({ event }) => (
    <div
      title={event.title} // native tooltip on hover
      style={{
        fontSize: "0.65rem",
        whiteSpace: "nowrap",       // 🔑 one line
        overflow: "hidden",         // 🔑 hide overflow
        textOverflow: "ellipsis",   // 🔑 show ...
      }}
    >
      {event.title}
    </div>
  );
  
  
  

  return (
    <BigCalendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  date={date}
  onNavigate={onNavigate}
  views={["month"]}
  popup
  popupOffset={{ x: 10, y: 20 }}
  showAllEvents={false} // ensure overflow logic kicks in
  components={{
    event: CustomEvent, // optional, custom rendering
  }}
  dayPropGetter={dayPropGetter}
  eventPropGetter={eventStyleGetter}
  style={{ height: "70vh" }}

  messages={{
    showMore: (total) => `+${total} more`,
  }}
    dayLayoutAlgorithm="no-overlap"
    
  /** Optional but helpful */
  // maxRows={2}
/>

  );
}
