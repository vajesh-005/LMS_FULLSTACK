const userModel = require("../models/userModels");

exports.getAllusers = async function (request, h) {
  const { userid, role } = request.params;

  try {
    const users = await userModel.fetchAllUsers(userid, role);

    if (!users || users.length === 0) {
      return h.response([]).code(200); // Return an empty array, not an object
    }

    return h.response(users).code(200);
  } catch (error) {
    console.error("Error in getAllusers:", error.message);
    return h.response({ message: "Internal Server Error" }).code(500);
  }
};


exports.getLeavesForUser = async function (request, h) {
  const id = request.params.id;

  if (!id || isNaN(id)) {
    return h.response({ error: "Invalid user ID" }).code(400);
  }

  try {
    const result = await userModel.fetchTotalLeavesForUser(id);

    if (!result || result.length === 0) {
      return h.response({ error: "User not found or no leave data" }).code(404);
    }

    return h.response(result[0]).code(200);
  } catch (error) {
    console.error("Error occurred in getLeavesForUser:", error.message);
    return h.response({ error: "Internal Server Error" }).code(500);
  }
};






exports.getRequest = async (request, h) => {
  const userId = request.params.userId;

  if (!userId || isNaN(userId)) {
    return h.response({ error: "Invalid user ID" }).code(400);
  }

  try {
    const requests = await userModel.getRequests(userId);

    if (!requests || requests.length === 0) {
      return h.response({ message: "No pending requests found" }).code(404);
    }

    return h.response(requests).code(200);
  } catch (error) {
    console.error("Error in getRequest:", error.message);
    return h.response({ error: "Internal server error" }).code(500);
  }
};



exports.getLatestRequests = async (request, h) => {
  const userId = request.params.userid;

  if (!userId || isNaN(userId)) {
    return h.response({ error: "Invalid user ID" }).code(400);
  }

  try {
    const requests = await userModel.getLatestRequests(userId);

    if (!requests || requests.length === 0) {
      return h.response({ message: "No leave requests found" });
    }

    return h.response(requests).code(200);
  } catch (error) {
    console.error("Error in getLatestRequests controller:", error.message);
    return h.response({ error: "Internal server error" }).code(500);
  }
};

exports.getInfo = async(request,h)=>{
  try{
    const userId = request.params.id;
    const user = await userModel.getUserInfo(userId);
    if(!user) return h.response("User not found !").code(404);
    else return h.response(user[0]);
  }
  catch(error){
    console.log('error occurred in controller !' , error.message);
    return h.response("Internal server error").code(500);
  }
}

exports.getManagerLists = async (request, h) => {
  try {
    const managers = await userModel.fetchEligibleManagers();
    return h.response(managers).code(200);
  } catch (error) {
    console.error("Error fetching manager list:", error);
    return h.response({ error: "Failed to fetch managers" }).code(500);
  }
};


exports.getEmployeeTypes = async (request, h) => {
  try {
    const types = await userModel.fetchEmployeeTypes();
    return h.response(types).code(200);
  } catch (error) {
    console.error("Error fetching employee types:", error);
    return h.response({ error: "Failed to fetch employee types" }).code(500);
  }
};  
exports.getFloaterHolidays = async (request, h) => {
  try {
    const floaters = await userModel.getFloaterHolidays();

    if (!floaters || floaters.length === 0) {
      return h.response({ message: "No floater holidays found" }).code(404);
    }

    return h.response(floaters).code(200);
  } catch (err) {
    console.error("Error fetching floater holidays:", err.message);
    return h.response({ error: "Failed to fetch floater holidays" }).code(500);
  }
};
