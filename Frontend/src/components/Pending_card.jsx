import "../style/Pending_card.css";
import { Token } from "./Token";
import BASE_URL from "./url";
function Pending_card({ data, refreshKey }) {
  console.log(refreshKey);
  const { decode, token } = Token();
  const readableDate = (input) => {
    const date = new Date(input);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formatted = day + "/" + month + "/" + year;
    return formatted;
  };

  const approveRequest = async (userId, requestId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/approve/${userId}/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log("Approval failed");
        return;
      }

      if (refreshKey) refreshKey();
    } catch (error) {
      console.log(error.message);
    }
  };

  const rejectRequest = async (userId , requestId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/reject/${userId}/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log("Rejection failed");
        return;
      }

      if (refreshKey) refreshKey();
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="leave-request-card-wrapper">
      {data.map((item, index) => {
        return (
          <div className="pending-card-container" key={index}>
            <div className="user-details">
              <div className="user-name">{item.employee_name || "Unknown"}</div>
              <div className="user-role">{item.employee_role || "Employee"}</div>
              <div className="user-email">{item.employee_email || "N/A"}</div>
            </div>
            <div className="leave-details-div">
              <div className="primary-reason">
                <div className="leave-type-div">
                  Leave type : {item.leave_type}
                </div>
                <div className="date-difference-div">
                  Applied for {item.date_diff} day
                </div>
                <div className="date-range-div">
                  <div className="start">{readableDate(item.start_date)}</div>
                  <div className="mid-point">--</div>
                  <div className="end">{readableDate(item.end_date)}</div>
                </div>
              </div>
              <div className="main-reason-div">
                Reason:
                <div className="reason-text-div">{item.reason}</div>
              </div>
            </div>
            <div className="approval-div">
              <button
                className="reject-btn btn"
                onClick={() => rejectRequest(decode.id, item.id)}
              >
                Reject
              </button>
              <button
                className="approve-btn btn"
                onClick={() => approveRequest(decode.id, item.id)}
              >
                Approve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Pending_card;
