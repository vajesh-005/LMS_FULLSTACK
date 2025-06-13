import "../style/pending_card.css";
import { useState } from "react";
import { Token } from "./Token";
import BASE_URL from "./url";
import { Modal, Form, Button } from "rsuite";

function Pending_card({ data, refreshKey }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);

  const { decode, token } = Token();

  const readableDate = (input) => {
    const date = new Date(input);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const approveRequest = async (userId, requestId) => {
    try {
      const response = await fetch(`${BASE_URL}/approve/${userId}/${requestId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("Approval failed");
        return;
      }

      if (refreshKey) refreshKey();
    } catch (error) {
      console.log(error.message);
    }
  };

  const rejectRequest = async (userId, requestId, comment) => {
    try {
      const response = await fetch(`${BASE_URL}/reject/${userId}/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });

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
      {data.map((item, index) => (
        <div className="pending-card-container" key={index}>
          <div className="user-details">
            <div className="user-name">{item.employee_name || "Unknown"}</div>
            <div className="user-role">{item.employee_role || "Employee"}</div>
            <div className="user-email">{item.employee_email || "N/A"}</div>
          </div>
          <div className="leave-details-div">
            <div className="primary-reason">
              <div className="leave-type-div">Leave type: {item.leave_type}</div>
              <div className="date-difference-div">Applied for {item.date_diff} day</div>
              <div className="date-range-div">
                <div className="start">{readableDate(item.start_date)}</div>
                <div className="mid-point">-</div>
                <div className="end">{readableDate(item.end_date)}</div>
              </div>
            </div>
            <div className="main-reason-div">
              Reason:
              <div className="reason-text-div">{item.reason}</div>
            </div>
          </div>
          <div className="approval-div">
            <Button
              className="reject-btn btn"
              color="red"
              onClick={() => {
                setSelectedApprovalId(item.id);
                setShowRejectModal(true);
              }}
            >
              Reject
            </Button>
            <button
              className="approve-btn btn"
              onClick={() => approveRequest(decode.id, item.id)}
            >
              Approve
            </button>
          </div>
        </div>
      ))}

      {/* MODAL MUST BE INSIDE RETURN */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group>
              <Form.ControlLabel>Comment</Form.ControlLabel>
              <Form.Control
                name="comment"
                componentClass="textarea"
                rows={4}
                value={rejectComment}
                onChange={(value) => setRejectComment(value)}
                placeholder="Add a comment.."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button appearance="subtle" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={async () => {
              await rejectRequest(decode.id, selectedApprovalId, rejectComment);
              setShowRejectModal(false);
              setRejectComment("");
              setSelectedApprovalId(null);
            }}
          >
            Reject
          </Button>
          
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Pending_card;
