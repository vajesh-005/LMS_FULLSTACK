require("dotenv").config();
const hapi = require("@hapi/hapi");
const { user } = require("./plugins/user");
const { leave } = require("./plugins/leave");
const path = require("path");

require("./cron_job/cron");

async function serverInit() {
  const server = hapi.server({
    port: process.env.PORT || 1110,
    host: "0.0.0.0",

    routes: {
      cors: {
        origin: [
            "http://localhost:5173",               
            "https://lms-fullstack-ebon.vercel.app" 
          ],
        credentials: true,
      },
    },
  });
  await server.register(require('@hapi/inert'));
  await server.register(user);
  await server.register(leave);

  // Serve static files from Frontend/dist
server.route({
  method: "GET",
  path: "/{param*}",
  handler: {
    directory: {
      path: path.join(__dirname, "..", "Frontend", "dist"),
      index: ["index.html"],
    },
  },
});


  await server.start();

  console.log("Server started at:", server.info.uri);
}

serverInit();
