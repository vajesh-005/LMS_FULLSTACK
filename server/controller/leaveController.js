const leaveModel = require("../models/leaveModels");
const moment = require("moment");
const { db } = require('../configuration/db');
exports.requestLeaveById = async (request, h) => {
  try {
    const userId = request.params.id;
    const { leave_type_id, start_date, end_date, reason, start_day_type = 0, end_day_type = 0 } = request.payload;
    const user = await leaveModel.putLeaveRequestForUser(
      userId,
      leave_type_id,
      start_date,
      end_date,
      reason,
      start_day_type,
      end_day_type
    );
    if (!user) return h.response("User not found").code(404);
    else return h.response(user).code(200);
  } catch (error) {
    console.log("error occurred", error.message);
    return h.response("Internal server error ! ").code(500);
  }
};

exports.canceleavebyId = async (request, h) => {
  try {
    const leaveRequestId = request.params.leaverequestid;
    const user = await leaveModel.cancelLeaveRequest(leaveRequestId);

    if (!user || user.affectedRows === 0) {
      return h.response("Leave request not found!").code(404);
    }

    return h.response({ message: "Leave request cancelled successfully." }).code(200);
  } catch (error) {
    console.log("error occurred", error.message);
    return h.response("Internal server error").code(500);
  }
};


exports.updateManagerStatus = async (request, h) => {
  try {
    const leaveRequestId = request.params.leaverequestid;
    const user = await leaveModel.updateManagerStatus(leaveRequestId);
    if (!user) return h.response("user not found !").code(404);
    else return h.response(user[0]).code(200);
  } catch (error) {
    console.log("error , occured", error.message);
    return h.response("Internal server error").code(500);
  }
};




exports.getleavesUsed = async (request, h) => {
  try {
    const userId = request.params.userid;
    const result = await leaveModel.getLeaves(userId);

    if (!result || result.length === 0) {
      return h.response("User not found!").code(404);
    }

    return h.response(result[0]).code(200);
  } catch (error) {
    console.log("Error occurred in controller:", error.message);
    return h.response("Internal server error").code(500);
  }
};


exports.getLeavesList = async (request, h) => {
  const userId = request.params.userid;

  try {
    const result = await leaveModel.getLeavesLists(userId);
    return h.response(result).code(200);
  } catch (error) {
    console.error("Error occurred in controller:", error.message);
    return h.response("Internal server error").code(500);
  }
};


exports.getName = async (request, h) => {
  const userId = request.params.userid;

  try {
    const result = await leaveModel.getNames(userId);
    return h.response(result).code(200);
  } catch (error) {
    console.log("Error occurred in controller!", error.message);
    return h.response("Internal server error").code(500);
  }
};
exports.updateStatusByrole = async (request, h) => {
  const userId = request.params.id;
  const requestId = request.params.request_id;
  try {
    const user = await leaveModel.update(userId, requestId);
    if (!user) return h.response("Invalid role or update failed").code(400);
    return h.response(user).code(200);
  } catch (error) {
    console.log("Error occurred in controller !", error.message);
    return h.response("Internal server error ").code(500);
  }
};

exports.rejectLeaveByRole = async (request, h) => {
  const userId = request.params.id;
  const requestId = request.params.request_id;
  const { comment } = request.payload;

  try {
    const result = await leaveModel.reject(userId, requestId, comment);
    
    if (!result || result.affected === 0) {
      return h.response("Invalid role or request not found!").code(400);
    }

    return h.response({ message: "Leave request rejected successfully." }).code(200);
  } catch (error) {
    console.error("Error occurred in controller!", error.message);
    return h.response("Internal server error!").code(500);
  }
};




exports.getHolidays = async (request, h) => {
  const { user_id } = request.params;
  const { year, month } = request.query;

  if (!year || !month) {
    return h
      .response({ error: "Missing 'year' or 'month' query parameter" })
      .code(400);
  }

  const m = moment(`${year}-${String(month).padStart(2, "0")}-01`);
  const start = m.clone();
  const end = m.clone().endOf("month");

  try {
    const [[userRow]] = await db.query(
      "SELECT manager_id FROM employee WHERE id = ?",
      [user_id]
    );
    const managerId = userRow?.manager_id;

    const managerLeavesRows = managerId
  ? await leaveModel.getApprovedLeaves(
      start,
      end,
      "e.id = ?",
      [managerId]
    )
  : [];

    const selfLeavesRows = await leaveModel.getApprovedLeaves(
      start,
      end,
      "lr.employee_id = ?",
      [user_id]
    );

    const reportsLeavesRows = await leaveModel.getApprovedLeaves(
      start,
      end,
      "e.manager_id = ?",
      [user_id]
    );

    const peersLeavesRows = managerId
      ? await leaveModel.getApprovedLeaves(
          start,
          end,
          "e.manager_id = ? AND e.id != ?",
          [managerId, user_id]
        )
      : [];

    const holidays = await leaveModel.getHolidays(start, end);
    const weekOffs = leaveModel.generateWeekOffs(start, end);

    const selfLeaves = selfLeavesRows.map((e) => ({ ...e, category: "me" }));
    const reportsLeaves = reportsLeavesRows.map((e) => ({
      ...e,
      category: "reportee",
    }));
    const peersLeaves = peersLeavesRows.map((e) => ({
      ...e,
      category: "peer",
    }));
    const managerLeaves = managerLeavesRows.map((e) => ({
      ...e,
      category: "manager",
    }));
    

    const events = [
      ...holidays,
      ...weekOffs,
      ...selfLeaves,
      ...reportsLeaves,
      ...peersLeaves,
      ...managerLeaves,
    ];

    return h.response(events).code(200);
  } catch (err) {
    console.error("getHolidays error:", err.message);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};


// exports.updatebalance = async (request , h)=>{
//   const requestId = request.params.requestid;

//   try{
//     const response = await leaveModel.updateLeaveCount(requestId);
//     if(!response) return h.response({message : 'error in controller'}).code(404);
//     return response
//   }
//   catch(error){
//     console.log(error)
//     return h.response({messsage : "internal server error"}).code(500);
//   }
// }