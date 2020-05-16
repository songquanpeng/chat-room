const express = require("express");
const path = require("path");
const cors = require("cors");
const serveStatic = require("serve-static");
const uploadRouter = require("./file");

let app = express();
app.use(cors());
app.use("/upload", uploadRouter);

let server = require("http").createServer(app);
let io = require("socket.io")(server);
let users = new Map();

io.sockets.on("connection", function (socket) {
  socket.on("connect", () => {});

  socket.on("register", function (username) {
    username = username.trim();
    if (users.has(username)) {
      socket.emit("conflict username");
    } else {
      socket.username = username;
      users.set(username, []);
      socket.emit("register success");
      io.sockets.emit("system", `${username} connected`);
    }
  });

  socket.on("message", function (message) {
    message = message.trim();
    if (message === "") return;
    let username = socket.username;
    if (username === undefined || username === "") {
      username = "Anonymous";
    }
    io.emit("message", message, username);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      users.delete(socket.username);
      io.sockets.emit("system", `${socket.username} dis connected`);
    }
  });
});

app.use(serveStatic(path.join(__dirname, "public"), { maxAge: "600000" }));

app.use(function (req, res) {
  res.status(404);
  res.send({ error: "Not found" });
});

server.listen(process.env.PORT || 3000);
