require('dotenv').config();
const hapi = require('@hapi/hapi');
const { user } = require('./plugins/user');
const { leave } = require('./plugins/leave');
require("./cron_job/cron");

async function serverInit() {
    const server = hapi.server({
        port: 1110,
        host: 'localhost', 
        routes: {
            cors: {
                origin: ["http://localhost:5173"],
                credentials: true
            }
        }
    });
    
    await server.register(user);
    await server.register(leave);
    await server.start();

    console.log('Server started at:', server.info.uri);
}

serverInit();
