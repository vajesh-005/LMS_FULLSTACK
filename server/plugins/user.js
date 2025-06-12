const userRoutes = require('../routes/userRoutes');

exports.user = {
    name: 'userPlugin',
    version: '1.0.0',
    register: async function (server, options) {
        server.route(userRoutes);
    }
}
