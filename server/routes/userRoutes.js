const userController = require("../controller/userController");
const authController = require("../controller/authController");
const { verifyToken } = require("../middleware/verification");

module.exports = [
  {
    method: "POST",
    path: "/login",
    handler: authController.loginUser,  //requirred
  },
  {
    method: "POST",
    path: "/user",
    handler: authController.addUser,  //requirred
  },
  {
    method : "GET",
    path : "/list/managers",
    handler : userController.getManagerLists,
    // options: {
    //   pre: [{ method: verifyToken }],
    // },
  },
  {
    method: "GET",
    path: "/list/employee-types",
    handler: userController.getEmployeeTypes,
    options: {
      pre: [{ method: verifyToken }],
    },
  },  
  {
    method: "GET",
    path: "/mappedusers/{userid}/{role}",
    handler: userController.getAllusers,  //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method : 'GET',
    path : '/holidays/floater',
    handler : userController.getFloaterHolidays,
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "GET",
    path: "/users/{id}/leaves",
    handler: userController.getLeavesForUser, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  // {
  //   method: "GET",
  //   path: "/users/{id}/leaves/{leaveid}",
  //   handler: userController.getCategoryLeavesForUser,
  //   options: {
  //     pre: [{ method: verifyToken }],
  //   },
  // },
  // {
  //   method: "GET",
  //   path: "/user/{userid}/leavesused/{leavetypeid}",
  //   handler: userController.getLeavesCountTakenByUser,
  //   options: {
  //     pre: [{ method: verifyToken }],
  //   },
  // },
  {
    method: "GET",
    path: "/userswithrequest/{userId}",
    handler: userController.getRequest,  //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "GET",
    path: "/pendingleaverequest/{userid}",
    handler: userController.getPendingRequest, //usefull 
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "GET",
    path: "/latestleaverequest/{userid}",
    handler: userController.getLatestRequests,
    // options: {
    //   pre: [{ method: verifyToken }],
    // },
  },
];
