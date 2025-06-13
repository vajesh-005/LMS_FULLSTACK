const userController = require("../controller/userController");
const authController = require("../controller/authController");
const { verifyToken } = require("../middleware/verification");
const validator = require('../validation/validator');

module.exports = [
  {
    method: "POST",
    path: "/login",
    options: {
      validate: {
        payload: validator.loginSchema,
        failAction: (request, h, err) => {
          return h.response({ message: err.details[0].message }).code(400).takeover();
        },
      },
    },
    handler: authController.loginUser,
  },
  {
    method: "POST",
    path: "/user",
    options: {
      validate: {
        payload: validator.addUserSchema,
        failAction: (request, h, err) => {
          return h
            .response({ message: err.details[0].message })
            .code(400)
            .takeover();
        },
      },
    },
    handler: authController.addUser,
  },
  {
    method: "GET",
    path: "/list/managers", 
    handler: userController.getManagerLists,
    options: {
      pre: [{ method: verifyToken }], 
    },
  }
  ,
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
    handler : userController.getFloaterHolidays,      //requirred
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
    path: "/latestleaverequest/{userid}",         //requirred
    handler: userController.getLatestRequests,
    options: {
      pre: [{ method: verifyToken }],
    },
  },
];
