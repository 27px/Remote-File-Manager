module.exports=()=>{
  const config=require("./config/config.json");
  const express=require("express");
  const app=express();
  const http=require("http");
  const ws=require('ws');
  const server=http.createServer(app);

  const wss=new ws.Server({
    server
  });
  const path=require("path");

  // const fileUpload=require('express-fileupload');
  const chalk=require("chalk");

  const route=require("./routes/main");
  const cors=require("cors");
  const HOST=config.SERVER.HOST;
  const PORT=process.env.PORT || config.SERVER.PORT;


  // app.set("views","./views");
  // app.set("view engine","ejs");

  app.use(cors({
    origin:"*"
  }));

  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  // app.use(fileUpload());

  // app.use(session({
  //   secret:config.SESSION.SECRET,
  //   resave:false,
  //   saveUninitialized:false
  // }));

  wss.on("connection",socket=>{
    // connected
    // console.log(chalk.yellow("one user Connected"));

    // send message
    // socket.send("hi");

    // received message
    socket.on("message",msg=>{
      // console.log(chalk.green.inverse(msg));
    });

    // closing connection
    socket.on("close",()=>{
      // console.log(chalk.red("one user disconnected"));
    });
  });


  // app.use("/static",express.static(path.join(__dirname,"static")));
  app.use("/favicon.ico",express.static(path.join(__dirname,"icon.ico")));

  app.use("/",route);

  server.listen(PORT,()=>{
    console.log(chalk.green.inverse(` Started server ${HOST} on port ${PORT} `));
  });

}
