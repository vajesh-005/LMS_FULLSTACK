require("dotenv").config();
const hapi = require("@hapi/hapi");
const { user } = require("./plugins/user");
const { leave } = require("./plugins/leave");

require("./cron_job/cron");
async function serverInit() {
  const server = hapi.server({
    port: process.env.DB_PORT || 1110,
    host: "0.0.0.0",

    routes: {
      cors: {
        origin:process.env.ALLOWED_ORIGINS,
        credentials: true,
      },
    },
  });
  // await server.register(require("@hapi/inert"));
  await server.register(user);
  await server.register(leave);

  await server.start();

  console.log("Server started at:", server.info.uri);
}

serverInit();
