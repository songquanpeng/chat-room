const express = require("express");
const path = require("path");
const cors = require("cors");
const serveStatic = require("serve-static");
const uploadRouter = require("./file");
const app = express();
const server = require("http").createServer(app);
let io = require("socket.io")(server);
let users = new Set();

app.use(cors());
app.use("/upload", uploadRouter);
app.use(serveStatic(path.join(__dirname, "public"), { maxAge: "600000" }));
app.use(function (req, res) {
  res.status(404);
  res.send({ error: "Not found" });
});

io.sockets.on("connection", function (socket) {
  socket.on("register", function (username) {
    username = username.trim();
    if (users.has(username)) {
      socket.emit("conflict username");
    } else {
      users.add(username);
      socket.username = username;
      socket.emit("register success");
      let data = {
        content: `user "${username}" has connected`,
        sender: "system",
        type: "TEXT",
      };
      io.sockets.emit("message", data);
    }
  });

  socket.on("message", function (data) {
    if (!data) return;
    if (data.content === undefined) return;
    if (data.type === undefined) data.type = "TEXT";
    let username = socket.username;
    if (username === undefined || username === "") {
      username = "Anonymous";
    }
    data.sender = username;
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      users.delete(socket.username);
      let data = {
        content: `${socket.username} dis connected`,
        sender: "system",
        type: "TEXT",
      };
      io.sockets.emit("message", data);
    }
  });
});

server.listen(process.env.PORT || 3000);
