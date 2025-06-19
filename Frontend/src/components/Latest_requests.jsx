import React, { useRef, useEffect, useState } from "react";
import "../style/latest_requests.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import No_leaves from '../assets/No_leaves.png';

import { Token } from "./Token";
import BASE_URL from "./url";
import { Whisper, Popover, Button, Modal, Steps, Tooltip } from "rsuite";

function Latest_requests(props) {
  console.log(props , "request data")
  const whisperRef = useRef(null);

  const status_code = {
    200: "Approved",
    100: "Pending",
    300: "Rejected",
    350: "Cancelled",
  };

  const [pendingRequest, setPendingRequest] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLeaveData, setSelectedLeaveData] = useState(null);

  const handleOpenCancelPopup = (id) => {
    setSelectedId(id);
    setCancelPopupOpen(true);
  };

  const handleCancel = async () => {
    try {
      const { token } = Token();
      const response = await fetch(`${BASE_URL}/cancel-leave/${selectedId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("Failed to cancel leave");
      }
      setRefresh((item) => item + 1);
    } catch (error) {
      console.log(error.message);
    } finally {
      setCancelPopupOpen(false);
      setSelectedId(null);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedLeaveData(item);
    setViewModalOpen(true);
  };

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      try {
        const requests = await fetch(
          `${BASE_URL}/latest-leave-request/${props.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const requestsJson = await requests.json();
        console.log(requestsJson, "requestsJson");
        setPendingRequest(requestsJson);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchAll();
  }, [props.id, props.refreshKey, refresh]);

  const getDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  return (
    <div className="pending-section">
      <p className="title">Latest Leaves</p>
      {pendingRequest && pendingRequest.length > 0 ? (
        pendingRequest.map((item, index) => (
          <div key={index} className="pending-request-card">
            <div className="leave-type-and-status">
              <div className="leave-name">
                {item.leave_type}
                <Whisper
                  ref={whisperRef}
                  placement="bottomEnd"
                  trigger="click"
                  speaker={
                    <Popover arrow={false} full>
                      <div style={{ padding: 10 }}>
                        <p
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            handleViewDetails(item);
                            whisperRef.current?.close();
                          }}
                        >
                          View Details
                        </p>
                        {item.status !== 350 &&
                          item.status !== 300 &&
                          new Date(item.start_date) >=
                            new Date().setHours(0, 0, 0, 0) && (
                            <p
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleOpenCancelPopup(item.id);
                                whisperRef.current?.close?.();
                              }}
                            >
                              Cancel Leave
                            </p>
                          )}
                      </div>
                    </Popover>
                  }
                >
                  <button className="menu-icon">
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                </Whisper>
              </div>

              <div
                className={`status ${
                  item.status === 200
                    ? "approved"
                    : item.status === 300
                    ? "rejected"
                    : item.status === 350
                    ? "cancelled"
                    : "pending"
                }`}
              >
                {status_code[item.status]}
              </div>
            </div>

            <div className="date-and-days">
              <div className="date">
                {item.start_date &&
                  new Date(item.start_date).toLocaleDateString()}
              </div>
              <div className="date-difference">
                {getDifference(item.start_date, item.end_date) +
                  (getDifference(item.start_date, item.end_date) > 1
                    ? " Days"
                    : " Day")}
              </div>
              <div className="date">
                {item.end_date && new Date(item.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-requests-message">
          <img src={No_leaves} className="no-leaves-img"/>
          No leave requests applied.</div>
      )}

      <Modal
        open={cancelPopupOpen}
        onClose={() => setCancelPopupOpen(false)}
        size="xs"
        centered
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Modal.Header>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this leave request?
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setCancelPopupOpen(false)} appearance="subtle">
            No
          </Button>
          <Button
            className="cancel-btn"
            onClick={handleCancel}
            appearance="primary"
          >
            Yes, Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        centered
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Modal.Header>
          <Modal.Title>Leave Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeaveData && (
            <>
              <div className="main-modal" style={{ lineHeight: "1.8" }}>
                <div className="modal-flex-body">
                  <div className="modal-leave-details">
                    <p>
                      <strong>Name:</strong> {selectedLeaveData.name}
                    </p>
                    <p>
                      <strong>Leave Applied for: </strong>
                      {getDifference(
                        selectedLeaveData.start_date,
                        selectedLeaveData.end_date
                      )}{" "}
                      {getDifference(
                        selectedLeaveData.start_date,
                        selectedLeaveData.end_date
                      ) > 1
                        ? "Days"
                        : "Day"}
                    </p>
                    <p>
                      <strong>Reason:</strong>{" "}
                      <Whisper
                        placement="top"
                        trigger="hover"
                        speaker={<Tooltip>{selectedLeaveData.reason}</Tooltip>}
                      >
                        <span className="truncated-text">
                          {selectedLeaveData.reason}
                        </span>
                      </Whisper>
                    </p>
                  </div>
                  <div className="dates-range">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(
                        selectedLeaveData.start_date
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(
                        selectedLeaveData.end_date
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {status_code[selectedLeaveData.status]}
                      {selectedLeaveData.status === 300 &&
                        selectedLeaveData.approvals.some(
                          //some return the boolean value if the condition passed
                          (app) => app.status === 300 && app.comment
                        ) && (
                          <Whisper
                            placement="top"
                            trigger="hover"
                            speaker={
                              <Tooltip arrow={false}>
                                {
                                  selectedLeaveData.approvals.find(
                                    (app) => app.status === 300 && app.comment
                                  )?.comment
                                }
                              </Tooltip>
                            }
                          >
                            <span style={{ marginLeft: 6, cursor: "pointer" }}>
                              🛈
                            </span>
                          </Whisper>
                        )}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <Steps
                  currentStatus="error"
                  className="small-steps"
                  current={selectedLeaveData.approvals
                    .filter(
                      (app) =>
                        app && app.name && app.role && app.status !== null
                    )
                    .sort((a, b) => a.approval_order - b.approval_order)
                    .findIndex((app) => app.status !== 200)}
                  horizontal
                >
                  {selectedLeaveData.approvals
                    .filter(
                      (app) =>
                        app && app.name && app.role && app.status !== null
                    )
                    .sort((a, b) => a.approval_order - b.approval_order)
                    .map((approval, index, arr) => {
                      const isAfterRejection = arr
                        .slice(0, index)
                        .some((a) => a.status === 300);

                      let stepStatus = "wait";

                      if (isAfterRejection) {
                        stepStatus = "not-sent";
                      } else {
                        if (approval.status === 200) stepStatus = "finish";
                        else if (approval.status === 100)
                          stepStatus = "process";
                        else if (approval.status === 300) stepStatus = "error";
                      }

                      return (
                        <Steps.Item
                          key={index}
                          status={stepStatus}
                          title={
                            <div>
                              <p className="steps-name">{approval.name}</p>
                              <p className="steps-role">{approval.role}</p>
                            </div>
                          }
                          description={
                            stepStatus === "not-sent"
                              ? "Not sent for approval"
                              : approval.approved_at
                              ? `Approved at: ${new Date(
                                  approval.approved_at
                                ).toLocaleDateString()}`
                              : "Pending approval"
                          }
                        />
                      );
                    })}
                </Steps>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setViewModalOpen(false)} appearance="primary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Latest_requests;
