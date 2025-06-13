const leaveController = require("../controller/leaveController");
const { verifyToken } = require("../middleware/verification");
const validator = require("../validation/validator");

module.exports = [
  {
    method: "POST",
    path: "/requestleave/{id}",
    handler: leaveController.requestLeaveById,
    options: {
      pre: [{ method: verifyToken }],
      validate: {
        params: validator.leaveRequestSchema.params,
        payload: validator.leaveRequestSchema.payload,
        failAction: (request, h, err) => {
          const message = err.details[0].message;
          return h.response({ error: message }).code(400).takeover();
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/cancelleave/{leaverequestid}",

    handler: leaveController.canceleavebyId, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "PUT",
    path: "/reject/{id}/{request_id}",
    handler: leaveController.rejectLeaveByRole, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },

  {
    method: "GET",
    path: "/totalleavesused/{userid}",
    handler: leaveController.getleavesUsed, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "GET",
    path: "/leaveslist/{userid}",
    handler: leaveController.getLeavesList, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },

  {
    method: "GET",
    path: "/leavename/{userid}",
    handler: leaveController.getName, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "GET",
    path: "/calendar/events/{user_id}",
    handler: leaveController.getHolidays, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
];
