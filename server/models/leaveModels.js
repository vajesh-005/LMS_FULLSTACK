const { db } = require("../configuration/db");
const moment = require("moment");
const status_approved = 200;
const status_pending = 100;

const countWorkingDays = (startDate, endDate) => {
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

async function checkOverlapping  (employee_id, start_date, end_date) {
  const query = `SELECT *
FROM leave_request
WHERE employee_id = ?
  AND (
    start_date <= ? AND end_date >= ?
  ) AND status != 350;
`;
  const [response] = await db.query(query, [employee_id, start_date, end_date]);
  if (response.length > 0)
    return {
      message:
        "The requested date is already submitted... Please choose another dates.",
      success: false,
    };
  else return { success: true };
};

function calculateLeaveDays(
  startDate,
  endDate,
  startDayType = 0,
  endDayType = 0
) {
  const workingDays = countWorkingDays(startDate, endDate);

  let leaveDays;

  if (workingDays === 1) {
    // Same-day leave
    if (startDayType === 1 && endDayType === 2) return 1;
    if (startDayType === 1 && endDayType === 1) return 0.5;
    if (startDayType === 2 && endDayType === 2) return 0.5;
    return 1; // Full day
  }

  // Multi-day leave
  leaveDays = workingDays;
  if (startDayType === 1 || startDayType === 2) leaveDays -= 0.5;
  if (endDayType === 1 || endDayType === 2) leaveDays -= 0.5;

  return leaveDays;
}

exports.putLeaveRequestForUser = async (
  userId,
  leave_type_id,
  start_date,
  end_date,
  reason,
  start_day_type,
  end_day_type
) => {
  const duplicateCheck = await checkOverlapping(
    userId,
    start_date,
    end_date
  );

  if (!duplicateCheck.success) {
    return duplicateCheck;
  }

  const checkQuery = `SELECT total_leave - leaves_taken as remaining_leaves FROM leave_balance WHERE employee_id = ? AND leave_type_id = ?`;
  const [checkResults] = await db.query(checkQuery, [userId, leave_type_id]);
  if (!checkResults || checkResults.length === 0) {
    return {
      message: "No remaining leave record found for this user and leave type",
    };
  }

  const { remaining_leaves } = checkResults[0];
  const leaveDays = calculateLeaveDays(
    start_date,
    end_date,
    start_day_type,
    end_day_type
  );

  const leaveTypeQuery = `SELECT name FROM leave_type WHERE id = ?`;
  const [leaveTypeResult] = await db.query(leaveTypeQuery, [leave_type_id]);
  if (!leaveTypeResult.length) return { message: "Unidentified leave type!" };

  const leaveTypeName = leaveTypeResult[0].name;

  if (!leaveTypeName) return { message: "Unidentified leave type!" };

  let approvalsNeeded = 1;

  if (leaveTypeName.trim() === "Sick Leave") {
    if (leaveDays <= 1 && remaining_leaves >= leaveDays) {
      approvalsNeeded = 0;
    } else if (remaining_leaves >= leaveDays) {
      approvalsNeeded = 0;
    } else {
      approvalsNeeded = 1;
    }
  } else {
    if (leaveDays > 5) approvalsNeeded = 3;
    else if (leaveDays > 1) approvalsNeeded = 2;
    else if (remaining_leaves >= leaveDays) approvalsNeeded = 1;
    else approvalsNeeded = 2;
  }

  if (approvalsNeeded === 0) {
    const insertQuery = `INSERT INTO leave_request(employee_id, leave_type_id, start_date, end_date, reason, status, requested_at, start_day_type, end_day_type)
                     VALUES (?, ?, ?, ?, ?, ${status_approved}, NOW(), ?, ?)`;
    const [result] = await db.query(insertQuery, [
      userId,
      leave_type_id,
      start_date,
      end_date,
      reason,
      start_day_type,
      end_day_type,
    ]);

    await exports.updateLeaveCount(result.insertId);
    return {
      message: "Auto-approved sick leave. Leave count updated.",
      request_id: result.insertId,
    };
  } else {
    // Insert leave request
    const insertQuery = `INSERT INTO leave_request(employee_id, leave_type_id, start_date, end_date, reason, status, requested_at, start_day_type, end_day_type)
    VALUES (?, ?, ?, ?, ?, ${status_pending}, NOW(), ?, ?)`;
    const [result] = await db.query(insertQuery, [
      userId,
      leave_type_id,
      start_date,
      end_date,
      reason,
      start_day_type,
      end_day_type,
    ]);

    const leaveRequestId = result.insertId;

    // Get approvers dynamically using manager hierarchy
    let approvers = [];
    let currentUser = userId;
    for (let i = 0; i < approvalsNeeded; i++) {
      const managerQuery = `SELECT manager_id FROM employee WHERE id = ?`;
      const [managerResult] = await db.query(managerQuery, [currentUser]);

      if (!managerResult.length) {
        return { message: "Manager not found for this user!" };
      }

      const manager_id = managerResult[0].manager_id;

      if (!manager_id) break;
      approvers.push(manager_id);
      currentUser = manager_id;
    }

    for (let i = 0; i < approvers.length; i++) {
      const approverId = approvers[i];
      const approvalOrder = i + 1;

      await db.query(
        `INSERT INTO approval_flow (leave_id, approver_id, approval_status, approval_order, is_visible)
         VALUES (?, ?, 100, ?, ?)`,
        [leaveRequestId, approverId, approvalOrder, approvalOrder === 1 ? 1 : 0] // Only first level is visible initially
      );
    }

    return {
      message: `Leave request submitted with ${approvalsNeeded} approver(s).`,
      request_id: leaveRequestId,
    };
  }
};

exports.updateLeaveCount = async (leaveRequestId) => {
  const dataQuery = `
    SELECT employee_id, leave_type_id, start_date, end_date, start_day_type, end_day_type
    FROM leave_request
    WHERE id = ?
  `;

  const [dataResult] = await db.query(dataQuery, [leaveRequestId]);

  if (!dataResult.length) {
    return { message: "Leave request not found!" };
  }

  const {
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    start_day_type,
    end_day_type,
  } = dataResult[0];

  const leaveDays = calculateLeaveDays(start_date, end_date, start_day_type, end_day_type);

  const updateCategoryCountQuery = `
    UPDATE leave_balance
    SET leaves_taken = leaves_taken + ?
    WHERE employee_id = ? AND leave_type_id = ?
  `;

  try {
    await db.query(updateCategoryCountQuery, [
      leaveDays,
      employee_id,
      leave_type_id,
    ]);

    return "Successfully updated! ";
  } catch (error) {
    console.log("Error occurred in model!", error.message);
    return {
      message: "Not able to update!",
    };
  }
};


exports.cancelLeaveRequest = async (leaveRequestId) => {
  const query = `
    UPDATE leave_request
    SET status = 350
    WHERE id = ?
  `;
  try {
    const [result] = await db.query(query, [leaveRequestId]);
    return result;
  } catch (error) {
    console.log("Error occurred in model!", error.message);
    return { message: "Failed to cancel" };
  }
};

exports.getLeaves = async (userId) => {
  const query = `
    SELECT SUM(COALESCE(leaves_used, 0)) AS total_leaves_used
    FROM remaining_leaves
    WHERE employee_id = ?;
  `;

  try {
    const [results] = await db.query(query, [userId]);
    return results;
  } catch (error) {
    console.log("Error occurred in model:", error.message);
    return [];
  }
};

exports.getLeavesLists = async (userId) => {
  const query = `
    SELECT 
      name,
      leaves_taken,
      total_leave - leaves_taken AS remaining_leaves,
      description
    FROM leave_balance 
    JOIN leave_type ON leave_type.id = leave_balance.leave_type_id 
    WHERE leave_balance.employee_id = ?`;

  try {
    const [result] = await db.query(query, [userId]);
    return result;
  } catch (error) {
    console.error("Error occurred in model:", error.message);
    throw error;
  }
};

exports.getNames = async (userId) => {
  const query = `
    SELECT lt.id, lt.name AS name 
    FROM leave_type lt 
    JOIN leave_policy lp ON lt.id = lp.leave_type_id
    JOIN employee u ON u.emp_type_id = lp.employee_type_id
    WHERE u.id = ?
  `;

  try {
    const [result] = await db.query(query, [userId]);
    return result;
  } catch (error) {
    console.log("Error occurred in model", error.message);
    return { message: "Failed to get names" };
  }
};

exports.update = async (userId, requestId) => {
  const updateQuery = `
    UPDATE approval_flow
    SET approval_status = 200, approved_at = NOW()
    WHERE leave_id = ? AND approver_id = ?`;

  const revealNextQuery = `
    UPDATE approval_flow
    SET is_visible = 1
    WHERE leave_id = ? AND approval_order = (
      SELECT MIN(approval_order)
      FROM (
        SELECT approval_order
        FROM approval_flow
        WHERE leave_id = ? AND approval_status = 100
      ) AS subquery
    )`;

  const checkAllApprovedQuery = `
    SELECT 
      COUNT(*) AS total_approvals,
      SUM(CASE WHEN approval_status = 100 THEN 1 ELSE 0 END) AS pending_approvals
    FROM approval_flow
    WHERE leave_id = ?`;

  const updateLeaveRequestStatusQuery = `
    UPDATE leave_request
    SET status = 200
    WHERE id = ?`;

  try {
    await db.query(updateQuery, [requestId, userId]);

    await db.query(revealNextQuery, [requestId, requestId]);

    const [checkResult] = await db.query(checkAllApprovedQuery, [requestId]);
    const { total_approvals, pending_approvals } = checkResult[0];

    if (pending_approvals == 0) {
      await db.query(updateLeaveRequestStatusQuery, [requestId]);
      await exports.updateLeaveCount(requestId);
    }

    return {
      message:
        total_approvals === 0 || pending_approvals === 0
          ? "Final approval done. Leave fully approved."
          : "Approval updated and next approver notified.",
    };
  } catch (error) {
    console.log("Error occurred in model!", error.message);
    return { message: "Internal server error" };
  }
};

exports.reject = async (userId, requestId, comment) => {
  const updateLeaveQuery = `
    UPDATE leave_request
    SET status = 300
    WHERE id = ?`;

  const updateApprovalQuery = `
    UPDATE approval_flow 
    SET approval_status = 300, comments = ?
    WHERE approver_id = ? AND leave_id = ?`;

  try {
    const [leaveResult] = await db.query(updateLeaveQuery, [requestId]);
    const [approvalResult] = await db.query(updateApprovalQuery, [
      comment,
      userId,
      requestId,
    ]);

    return {
      message: "Updated",
      affected: leaveResult.affectedRows + approvalResult.affectedRows,
    };
  } catch (error) {
    console.error("Error occurred in model!", error.message);
    throw error;
  }
};

exports.getApprovedLeaves = async (start, end, whereClause, params = []) => {
  const sql = `
    SELECT 
      CONCAT(e.name, ' (', lt.name, ')') AS name,
      lr.start_date,
      lr.end_date,
      lt.name AS type
    FROM leave_request lr
    JOIN employee e ON e.id = lr.employee_id
    JOIN leave_type lt ON lt.id = lr.leave_type_id
    WHERE lr.status = 200
      AND lr.start_date <= ?
      AND lr.end_date >= ?
      AND ${whereClause}
  `;
  const [rows] = await db.query(sql, [
    end.format("YYYY-MM-DD"),
    start.format("YYYY-MM-DD"),
    ...params,
  ]);
  return rows;
};

exports.getHolidays = async (start, end) => {
  const sql = `
    SELECT title AS name, date AS start_date, date AS end_date, type
    FROM holidays
    WHERE date BETWEEN ? AND ?
  `;
  const [rows] = await db.query(sql, [
    start.format("YYYY-MM-DD"),
    end.format("YYYY-MM-DD"),
  ]);
  return rows;
};

exports.generateWeekOffs = (start, end) => {
  const offs = [];
  let cursor = start.clone();
  while (cursor <= end) {
    const d = cursor.day();
    if (d === 0 || d === 6) {
      offs.push({
        name: "Week Off",
        start_date: cursor.format("YYYY-MM-DD"),
        end_date: cursor.format("YYYY-MM-DD"),
        type: "Week Off",
      });
    }
    cursor.add(1, "day");
  }
  return offs;
};
