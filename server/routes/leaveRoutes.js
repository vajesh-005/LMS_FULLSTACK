const leaveController = require('../controller/leaveController');
const { verifyToken } = require('../middleware/verification');

module.exports = [
  {
    method: 'POST',
    path: '/requestleave/{id}',
    handler: leaveController.requestLeaveById,  //requirred
    options: {
      pre: [{ method: verifyToken }]
    }
  },
  {
    method: 'PUT',
    path: '/cancelleave/{leaverequestid}',
    
    handler: leaveController.canceleavebyId,  //requirred
    options: {
      pre: [{ method: verifyToken }]
    }
  },
  {
    method: 'PUT',
    path: '/leaveapproved/{leaverequestid}',
    handler: leaveController.updateLeaveCount,
    options: {
      pre: [{ method: verifyToken }]
    }
  },

  {
    method: 'PUT',
    path: '/approve/{id}/{request_id}',
    handler : leaveController.updateStatusByrole,
    options: {
      pre: [{ method: verifyToken }]
    }
  },  
  {
    method: 'PUT',
    path: '/reject/{id}/{request_id}',
    handler: leaveController.rejectLeaveByRole,
    options: {
      pre: [{method:verifyToken}]
    }
  },
  // {
  //   method: 'PUT',
  //   path: '/directorapproved/{leaverequestid}',
  //   handler: leaveController.updateDirectorStatus,
  //   options: {
  //     pre: [{ method: verifyToken }]
  //   }
  // },
  // {
  //   method: 'PUT',
  //   path: '/hrapproved/{leaverequestid}',
  //   handler: leaveController.updateHrStatus,
  //   options: {
  //     pre: [{ method: verifyToken }]
  //   }
  // },
  // {
  //   method: 'PUT',
  //   path: '/statusapproval/{leaverequestid}',
  //   handler: leaveController.updateStatus,
  //   options: {
  //     pre: [{ method: verifyToken }]
  //   }
  // },

  {
    method: 'GET',
    path: '/totalleavesused/{userid}',
    handler: leaveController.getleavesUsed,//requirred
    options: {
      pre: [{ method: verifyToken }]
    }
  },
  {
    method: 'GET',
    path: '/leaveslist/{userid}',
    handler: leaveController.getLeavesList, //requirred
    options: {
      pre: [{ method: verifyToken }]
    }
  },

  {
    method: 'GET',
    path: '/leavename/{userid}',
    handler: leaveController.getName, //requirred
    options: {
      pre: [{ method: verifyToken }]
    }
  },
  {
    method : 'GET',
    path : '/calendar/events/{user_id}',
    handler : leaveController.getHolidays,
    options: {
      pre: [{ method: verifyToken }]
    }
  }
];
