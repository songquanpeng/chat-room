const express = require("express");
const path = require("path");
const cors = require("cors");
const serveStatic = require("serve-static");
const uploadRouter = require("./routes/upload");
const roomRouter = require("./routes/room");
const app = express();
const server = require("http").createServer(app);
let io = require("socket.io")(server);
app.io = io;
let users = new Map();
let usernameSet = new Set();
app.use(cors());
app.use(serveStatic(path.join(__dirname, "public"), { maxAge: "600000" }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/upload", uploadRouter);
app.use("/", roomRouter);
app.use(function (req, res) {
  res.status(404);
  res.send({ error: "Not found" });
});

io.sockets.on("connection", function (socket) {
  socket.on("register", function (username) {
    username = username.trim();
    if (usernameSet.has(username)) {
      socket.emit("conflict username");
    } else {
      usernameSet.add(username);
      users.set(socket.id, {
        username,
      });
      socket.emit("register success");
      let data = {
        content: `${username} join the chat`,
        sender: "system",
        type: "TEXT",
      };
      io.sockets.emit("message", data);
    }
  });

  socket.on("message", function (data) {
    if (users.has(socket.id)) {
      if (!data) return;
      if (data.content === undefined) return;
      if (data.type === undefined) data.type = "TEXT";
      let username = users.get(socket.id).username;
      if (username === undefined || username === "") {
        username = "Anonymous";
      }
      data.sender = username;
      io.emit("message", data);
    } else {
      let data = {
        content: `login has expired`,
        sender: "system",
        type: "TEXT",
      };
      socket.emit("message", data);
    }
  });

  socket.on("disconnect", () => {
    if (users.has(socket.id)) {
      let username = users.get(socket.id).username;
      usernameSet.delete(username);
      users.delete(socket.id);
      let data = {
        content: `${username} left`,
        sender: "system",
        type: "TEXT",
      };
      io.sockets.emit("message", data);
    }
  });
});

server.listen(process.env.PORT || 3000);
