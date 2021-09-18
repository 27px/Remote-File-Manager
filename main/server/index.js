// global
connections = {}; // ssh connections with key as user@host and value as connection object
socket = null;
isWin = process.platform == "win32";
settings = {}; // global settings
instance = null;

module.exports = (USE_PORT) => {
  const config = require("./config/config.json");
  const express = require("express");
  const app = express();
  const http = require("http");
  const ws = require("ws");
  const server = http.createServer(app);
  const path = require("path");
  const cors = require("cors");
  const chalk = require("chalk");

  const route = require("./routes/main");
  const handleOperations = require("./functions/handle_operations.js");

  const HOST = config.SERVER.HOST;
  const PORT = USE_PORT ?? config.SERVER.PORT;

  const wss = new ws.Server({
    server,
  });

  // const fileUpload=require('express-fileupload');

  // app.set("views","./views");
  // app.set("view engine","ejs");

  // security fixes
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.use(
    cors({
      origin: "*",
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // app.use(fileUpload());

  // app.use(session({
  //   secret:config.SESSION.SECRET,
  //   resave:false,
  //   saveUninitialized:false
  // }));

  wss.on("connection", (socket_object) => {
    socket = socket_object; // setting as global
    // send message
    // socket.send("hi");

    socket.on("message", (data) => {
      operation = JSON.parse(data);
      if (operation.type == "settings") {
        // send the server settings to client first
        socket.send(
          JSON.stringify({
            type: "settings",
            data: {
              isWin,
            },
          })
        );
        // then save settings client aleady sent
        let client_settings = operation.data;
        for (setting in client_settings) {
          settings[setting] = client_settings[setting];
        }
        return;
      }
      // if not settings it will be operations like delete, rename etc
      handleOperations(operation); // asynchronously send result to client via ws
    });

    socket.on("close", () => {
      // console.log(chalk.red("one user disconnected"));
    });
  });

  // app.use("/static",express.static(path.join(__dirname,"static")));
  app.use("/favicon.ico", express.static(path.join(__dirname, "icon.ico")));

  app.use("/", express.static(path.join(__dirname, "dist")));
  
  app.use("/", route);

  instance = server.listen(PORT, () => {
    console.log(
      chalk.green.inverse(
        ` Started server ${HOST} on port ${instance.address().port} `
      )
    );
  });

  return instance.address().port; // send which port is used
};
