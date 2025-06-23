import React, { useEffect, useState } from "react";
import "../style/request_form.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useToaster, Message, Button } from "rsuite";
import RangeCalendar from "./RangeCalendar";
import { Token } from "./Token";
import BASE_URL from "./url";

function Request_form(props) {
  const { token } = Token();
  const toaster = useToaster();

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    start_day_type: 0,
    end_day_type: 0,
  });

  const [leaveTypeName, setleaveTypeName] = useState([]);
  const [floaterDates, setFloaterDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch leave types + floater dates
  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/leave-name/${props.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${BASE_URL}/holidays/floater`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([leaveTypeRes, floaterRes]) => {
        const leaveTypes = await leaveTypeRes.json();
        const floaterRaw = await floaterRes.json();

        setleaveTypeName(leaveTypes);
        setFloaterDates(floaterRaw.map((item) => item.date));
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [props.id, token]);

  useEffect(() => {
    const normalizedStart = formData.start_date?.substring(0, 10);
    const normalizedEnd = formData.end_date?.substring(0, 10);
    const isValidFloaterDate =
      normalizedStart === normalizedEnd &&
      floaterDates.includes(normalizedStart);

    const floater = leaveTypeName.find((t) =>
      t.name.toLowerCase().includes("floater")
    );

    if (isValidFloaterDate && floater) {
      // Auto-select floater if not already selected
      if (formData.leave_type_id !== floater.id) {
        setFormData((prev) => ({
          ...prev,
          leave_type_id: floater.id,
        }));
      }
    } else {
      // Reset leave type if a non-floater date is selected while floater was selected
      if (formData.leave_type_id === floater?.id) {
        setFormData((prev) => ({
          ...prev,
          leave_type_id: "",
        }));
      }
    }
  }, [formData.start_date, formData.end_date, floaterDates, leaveTypeName]);

  const handleChange = (event) => {
    const { name, value } = event.target;
  
    const numericFields = ["leave_type_id", "start_day_type", "end_day_type"];
    const parsedValue = numericFields.includes(name) ? parseInt(value, 10) : value;
  
    setFormData((prev) => {
      const updated = { ...prev, [name]: parsedValue };
  
      // Auto-update end_day_type if it's a single-day leave
      const isSingleDay = updated.start_date && updated.end_date && updated.start_date === updated.end_date;
  
      if (isSingleDay && name === "start_day_type") {
        updated.end_day_type = parsedValue;
      }
  
      return updated;
    });
  };
  

  const isFormValid = () =>
    formData.start_date &&
    formData.end_date &&
    formData.leave_type_id &&
    formData.reason.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toaster.push(
        <Message type="warning" closable duration={3000}>
          Please fill out all fields before submitting.
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/request-leave/${props.id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        props.onSuccess?.();

        toaster.push(
          <Message type="success" closable duration={3000}>
            {responseData.message || "Leave request submitted successfully!"}
          </Message>,
          { placement: "topEnd" }
        );

        setFormData({
          leave_type_id: "",
          start_date: "",
          end_date: "",
          reason: "",
        });
      } else {
        toaster.push(
          <Message type="success" closable duration={1500}>
            {responseData.message || "Something went wrong."}
          </Message>,
          { placement: "topEnd" }
        );
        props.onSuccess?.();
      }
    } catch (error) {
      toaster.push(
        <Message type="error" closable duration={1500}>
          {error.message}
        </Message>,
        { placement: "topEnd" }
      );
    } finally {
      setTimeout(() => setIsSubmitting(false), 1500);
    }
  };

  return (
    <div className="form">
      <form method="POST" onSubmit={handleSubmit} className="request-form">
        <div className="request-form-column">
          <p className="leave-request-title">Let's make a leave request!</p>
          <div className="dates">
            <RangeCalendar
              startDate={formData.start_date}
              endDate={formData.end_date}
              onDateChange={({ start_date, end_date }) => {
                setFormData((prev) => ({
                  ...prev,
                  start_date,
                  end_date,
                }));
              }}
            />
          </div>
        </div>

        <div className="request-form-column-2">
          <div className="leave-type">
            <label className="leave-type-title">Leave Type</label>
            <select
              className="dropdown-menu"
              name="leave_type_id"
              value={formData.leave_type_id}
              onChange={handleChange}
            >
              <option
                key="default"
                disabled
                value=""
                style={{ display: "none" }}
              >
                Select Leave Type
              </option>

              {leaveTypeName.map((type) => {
                const typeName = type.name.toLowerCase();
                const isFloater = typeName.includes("floater");

                const normalizedStart = formData.start_date?.substring(0, 10);
                const normalizedEnd = formData.end_date?.substring(0, 10);

                const isValidFloaterDate =
                  normalizedStart === normalizedEnd &&
                  floaterDates.includes(normalizedStart);

                const shouldDisableFloater = isFloater && !isValidFloaterDate;

                return (
                  <option
                    key={type.id}
                    value={type.id}
                    className="dropdown-options"
                    disabled={shouldDisableFloater}
                  >
                    {type.name}
                    {shouldDisableFloater ? " (Unavailable)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="isHalfDay">
            <div className="leave-duration-title">Leave duration </div>
            <div className="dropdown-div">
              {formData.start_date &&
              formData.end_date &&
              formData.start_date === formData.end_date ? (
                // Single-day leave
                <select
                  className="dropdown-menu partial-days-menu single"
                  name="start_day_type"
                  value={formData.start_day_type}
                  onChange={handleChange}
                >
                  {formData.start_day_type === "" && (
                    <option disabled value="" hidden>
                      Day type
                    </option>
                  )}
                  <option value={0}>Full day</option>
                  <option value={1}>First half</option>
                  <option value={2}>Second half</option>
                </select>
              ) : (
                <>
                  <select
                    className="dropdown-menu partial-days-menu"
                    name="start_day_type"
                    value={formData.start_day_type}
                    onChange={handleChange}
                  >
                    {formData.start_day_type === "" && (
                      <option disabled value="" hidden>
                        Start day type
                      </option>
                    )}
                    <option value={0}>Full day</option>
                    <option value={1}  disabled={formData.start_date !== formData.end_date}>First half</option>
                    <option value={2}>Second half</option>
                  </select>

                  <select
                    className="dropdown-menu partial-days-menu"
                    name="end_day_type"
                    value={formData.end_day_type}
                    onChange={handleChange}
                  >
                    {formData.end_day_type === "" && (
                      <option disabled value="" hidden>
                        End day type
                      </option>
                    )}
                    <option value={0}>Full day</option>
                    <option value={1}>First half</option>
                    <option value={2}  disabled={formData.start_date !== formData.end_date}>Second half</option>
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="reason">
            <p className="reason-title">Reason</p>
            <textarea
              className="reason-textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Type here..."
            ></textarea>
          </div>

          <div className="submit-button-div">
            <Button
              type="submit"
              appearance="primary"
              color="green"
              disabled={isSubmitting || !isFormValid()}
              className="submit-btn"
            >
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: "8px" }} />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Request_form;
