import React, { useEffect, useState } from "react";
import "../style/dashboard_top.css";
import BASE_URL from './url.js';
function Dashboard_leave_details(props) {
  const [leaveRemaining, setLeaveRemaining] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/users/${props.id}/leaves`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error({message : " response not okay"})
        }

        const data = await response.json();
        setLeaveRemaining(data);
      } catch (err) {
        console.error("Error fetching leave data:", err.message);
      }
    };

    fetchAll();
  }, [props.id, props.refreshKey]);


  return (
    <div className="dashboard-leaves-details">
      <div className="days-remaining">
        <div className="day-count">
          {Number(leaveRemaining?.remaining_leaves) >= 0
            ? Number(leaveRemaining.remaining_leaves)
            : 0}
        </div>
        <p>Total remaining days</p>
      </div>
      <div className="days-used">
        <div className="day-count">
          {leaveRemaining?.total_leaves_used.split(".")[0] || 0}
        </div>
        <p>Leaves used </p>
      </div>
    </div>
  );
}

export default Dashboard_leave_details;
