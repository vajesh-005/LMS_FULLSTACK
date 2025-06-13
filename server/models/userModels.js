const { db } = require("../configuration/db");
const bcrypt = require("bcrypt");

exports.fetchAllUsers = async (userId, role) => {
  let condition = "";
  let values = [];

  if (role === "HR" || role === "DIRECTOR") {
    condition = "WHERE u.id != ?";
    values = [userId];
  } else {
    condition = "WHERE mgr.id = ?";
    values = [userId];
  }

  const query = `
    SELECT 
      u.id AS employee_id,
      u.name AS employee_name,
      et.name AS role,
      u.email,
      u.created_at AS date_of_joining,
      u.contact_number,
      mgr.name AS manager
    FROM employee u
    JOIN employee mgr ON u.manager_id = mgr.id
    JOIN employee_type et ON et.id = u.emp_type_id
    ${condition}
    ORDER BY u.name;
  `;

  try {
    const [results] = await db.query(query, values);
    return results;
  } catch (error) {
    console.error("Error in fetchAllUsers:", error.message);
    throw error; // Let controller handle the response
  }
};


exports.fetchTotalLeavesForUser = async (id) => {
  const query = `
    SELECT 
      employee_id,
      SUM(total_leave) AS total_leaves_allocated,
      SUM(leaves_taken) AS total_leaves_used,
      SUM(total_leave) - SUM(leaves_taken) AS remaining_leaves
    FROM leave_balance
    WHERE employee_id = ?
  `;

  try {
    const [results] = await db.query(query, [id]);
    return results;
  } catch (error) {
    console.error("Error in fetchTotalLeavesForUser:", error.message);
    throw error;
  }
};






exports.getRequests = async (userId) => {
  const query = `
    SELECT 
      af.leave_id AS id,
      u.name AS employee_name,
      et.name AS employee_role,
      u.email AS employee_email,
      lt.name AS leave_type,
      lr.start_date,
      lr.end_date,
      lr.reason,
      DATEDIFF(lr.end_date, lr.start_date) + 1 AS date_diff
    FROM approval_flow af
    JOIN leave_request lr ON lr.id = af.leave_id
    JOIN employee u ON lr.employee_id = u.id
    JOIN leave_type lt ON lr.leave_type_id = lt.id
    JOIN employee_type et ON u.emp_type_id = et.id
    WHERE af.approver_id = ?
      AND af.is_visible = 1 
      AND af.approval_status = 100
  `;

  try {
    const [result] = await db.query(query, [userId]);
    return result;
  } catch (error) {
    console.error("Error in getRequests model:", error.message);
    throw error;
  }
};




exports.getLatestRequests = async (userId) => {
  const query = `
    SELECT
      lr.id,
      DATE(lr.start_date) AS start_date,
      DATE(lr.end_date) AS end_date,
      lr.status,
      lr.reason,
      lt.name AS leave_type,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'name', u.name,
          'role', et.name,
          'status', af.approval_status,
          'approved_at', af.approved_at,
          'approval_order', af.approval_order,
          'comment', af.comments
        )
      ) AS approvals
    FROM leave_request lr
    JOIN leave_type lt ON lr.leave_type_id = lt.id
    LEFT JOIN approval_flow af ON af.leave_id = lr.id
    LEFT JOIN employee u ON u.id = af.approver_id
    LEFT JOIN employee_type et ON et.id = u.emp_type_id
    WHERE lr.employee_id = ?
    GROUP BY lr.id, lr.start_date, lr.end_date, lr.status, lt.name, lr.reason
    ORDER BY lr.id DESC;
  `;

  try {
    const [results] = await db.query(query, [userId]);
    return results;
  } catch (error) {
    console.error("Error in getLatestRequests model:", error.message);
    return null;
  }
};

exports.getUserWithEmail = async (email) => {
  const query = `SELECT employee.id, employee.name, employee.email, employee.password, employee_type.name AS role 
FROM employee 
JOIN employee_type ON employee_type.id = employee.emp_type_id 
WHERE employee.email = ?
`;

  try {
    const [results] = await db.query(query, [email]);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error in getUserWithEmail:", error.message);
    throw error;
  }
};

exports.createUser = async (
  name,
  email,
  hashed,
  emp_type_id,
  managerId,
  contact_number
) => {
  const addQuery = `
    INSERT INTO employee (name, email, password, emp_type_id, manager_id, contact_number)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [addResult] = await db.query(addQuery, [
      name,
      email,
      hashed,
      emp_type_id,
      managerId,
      contact_number,
    ]);

    const employeeId = addResult.insertId;
        const policyQuery = `
          SELECT leave_type_id, accrual_per_month
          FROM leave_policy
          WHERE employee_type_id = ?
        `;
        const [leavePolicies] = await db.query(policyQuery, [emp_type_id]);

    const currentYear = new Date().getFullYear();

    const leaveBalanceRows = leavePolicies.map((policy) => [
      employeeId,
      policy.leave_type_id,
      currentYear,
      policy.accrual_per_month,
      0,
    ]);

    console.log(leaveBalanceRows);

    if (leaveBalanceRows.length > 0) {
      const leaveBalanceQuery = `
        INSERT INTO leave_balance (employee_id, leave_type_id, year, total_leave, leaves_taken)
        VALUES ?
      `;
      await db.query(leaveBalanceQuery, [leaveBalanceRows]);
    }

    return { employeeId };
  } catch (error) {
    console.log("Error occurred in model", error.message);
    throw error;
  }
};

exports.getUserInfo = async (userId) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  try {
    const result = await db.query(query, [userId]);
    return result;
  } catch (error) {
    console.log("error occurred in model ", error.message);
    return null;
  }
};

exports.fetchEligibleManagers = async () => {
  const query = `
    SELECT 
      e.id AS value,
      e.name,
      et.name AS role
    FROM employee e
    JOIN employee_type et ON e.emp_type_id = et.id
    WHERE e.emp_type_id NOT IN (1, 6, 7)
  `;

  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error occurred in fetchEligibleManagers:", error);
    throw error;
  }
};

exports.fetchEmployeeTypes = async () => {
  const query = `
    SELECT id AS value, name AS label 
    FROM employee_type
  `;
  const [rows] = await db.query(query);
  return rows;
};

exports.getFloaterHolidays = async () => {
  const query = `
    SELECT 
      id, 
      title, 
      DATE_FORMAT(date, '%Y-%m-%d') AS date
    FROM holidays
    WHERE type = 'floater'
  `;

  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Database error in getFloaterHolidays:", error.message);
    throw error; // Let controller handle the error response
  }
};

