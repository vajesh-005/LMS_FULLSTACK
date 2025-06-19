const leaveController = require("../controller/leaveController");
const { verifyToken } = require("../middleware/verification");
const validator = require("../validation/validator");

module.exports = [
  {
    method: "POST",
    path: "/request-leave/{id}",
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
    path: "/cancel-leave/{leaverequestid}",

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
// {
//   method : 'PATCH',
//   path : "/update-leave-count/{requestid}",
//   handler: leaveController.updatebalance
// },
  {
    method: "GET",
    path: "/total-leaves-used/{userid}",
    handler: leaveController.getleavesUsed, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },
  {
    method: "GET",
    path: "/leaves-list/{userid}",
    handler: leaveController.getLeavesList, //requirred
    options: {
      pre: [{ method: verifyToken }],
    },
  },

  {
    method: "GET",
    path: "/leave-name/{userid}",
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
