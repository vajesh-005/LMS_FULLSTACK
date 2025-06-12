const leaveRoutes = require('../routes/leaveRoutes');

exports.leave = {
    name: 'leavePlugin',
    version: '1.0.0',
    register: async (server, option) => {
        server.route(leaveRoutes);
    }
}