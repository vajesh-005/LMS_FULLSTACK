import React from "react";
import "../style/leaveTypeCard.css";

function LeaveTypeCard({ data }) {
  const typeCodeHandler = (name) => {
    if (!name || typeof name !== "string") return "N/A";
    const splitted = name.split(" ");
    let temp = "";
    splitted.map((item) => (temp += item[0].toUpperCase()));
    return temp;
  };
  const formatLeave = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return 0;
    return Number.isInteger(num) ? parseInt(num) : num;
  };
  return (
    <div className="card-wrapper">
      {data.map((leave, index) => (
        <div className="card-container" key={index}>
          <div className="type items">
            <div className="type-name">{leave.name}</div>
            <div className="type-code">
              {typeCodeHandler(leave.name) || "N/A"}
            </div>
          </div>

          <div className="leaves-remaining-div items">
            <div className="leave-remaining-title">Leaves Remaining</div>
            <div className="remaining-result">
  {formatLeave(leave.remaining_leaves)}
</div>

          </div>
          <div className="leaves-used-div items">
            <div className="leave-used-title">Leaves used</div>
            <div className="used-result">{formatLeave(leave.leaves_taken)}</div>
            </div>
          <div className="description">
            Description:
            <div className="text">{leave.description || "No description."}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeaveTypeCard;
