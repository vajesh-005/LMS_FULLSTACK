import React, { useEffect, useState } from "react";
import moment from "moment";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const COLORS = { peer: "#2196f3", self: "#4caf50", "Week Off": "#6c757d" };

export default function TeamLeaveCalendar({
  date,
  user,
  token,
  onNavigate,
  dayPropGetter, // passed from parent
}) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchTeamLeaves() {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const res = await fetch(
        `http://localhost:1110/calendar/events/${user.id}?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      const normalizeUtc = (iso) =>
        moment.utc(iso).local().startOf("day").toDate();

      // Map leave events
      const leaveEvents = data
        .filter((ev) => ["peer", "self"].includes(ev.category))
        .map((ev) => ({
          title: ev.name,
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
            end: day,
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
        if (a.category === "peer" && b.category === "self") return -1;
        if (a.category === "self" && b.category === "peer") return 1;
        return 0;
      });

      setEvents(allEvents);
    }

    fetchTeamLeaves();
  }, [date, user.id, token]);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: COLORS[event.category] || "#ccc",
      color: "white",
    },
  });

  return (
    <BigCalendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      date={date}
      onNavigate={onNavigate}          // enable navigation
      views={["month"]}
      eventPropGetter={eventStyleGetter}
      style={{ height: "70vh" }}
      dayPropGetter={dayPropGetter}    // highlights weekends shading
    />
  );
}
