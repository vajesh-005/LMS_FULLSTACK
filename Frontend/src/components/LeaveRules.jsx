import React from "react";
import "../style/leaveRules.css";

function LeaveRules() {
  const handleClick = () => {
    window.open("/leave_policy_LMS.pdf", "_blank");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={handleClick} className="download-btn">📄 View Leave Policy</button>
    </div>
  );
}

export default LeaveRules;
