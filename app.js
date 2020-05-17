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

let rooms = new Map();
let userID2roomID = new Map();

function getRoom(roomID) {
  let room = rooms.get(roomID);
  if (!room) {
    room = {
      users: new Map(),
      usernameSet: new Set(),
    };
    rooms.set(roomID, room);
  }
  return room;
}

io.sockets.on("connection", function (socket) {
  socket.on("register", function (username, roomID = "/") {
    let room = getRoom(roomID);
    username = username.trim();
    if (room.usernameSet.has(username)) {
      socket.emit("conflict username");
    } else {
      room.usernameSet.add(username);
      let isFirstPerson = room.users.size === 0;
      room.users.set(socket.id, {
        username,
        isAdmin: isFirstPerson,
      });
      userID2roomID.set(socket.id, roomID);
      socket.join(roomID);
      socket.emit("register success");
      let data = {
        content: `${username} join the chat`,
        sender: "system",
        type: "TEXT",
      };
      io.to(roomID).emit("message", data);
    }
  });

  socket.on("message", function (data, roomID = "/") {
    let room = getRoom(roomID);
    if (room.users.has(socket.id)) {
      if (!data) return;
      if (data.content === undefined) return;
      if (data.type === undefined) data.type = "TEXT";
      let user = room.users.get(socket.id);
      let kickMessage = undefined;
      if (user.isAdmin) {
        if (data.content.startsWith("kick")) {
          let kickedUser = data.content.substring(4);
          kickedUser = kickedUser.trim();
          for (let [id, user] of room.users.entries()) {
            if (user.username === kickedUser) {
              room.users.delete(id);
              room.usernameSet.delete(user.username);
              kickMessage = {
                content: `${user.username} kicked out of chat room`,
                sender: "system",
                type: "TEXT",
              };
              break;
            }
          }
        }
      }
      if (user.username === undefined || user.username === "") {
        user.username = "Anonymous";
      }
      data.sender = user.username;
      io.to(roomID).emit("message", data);
      if (kickMessage) io.to(roomID).emit("message", kickMessage);
    } else {
      let data = {
        content: `login has expired, please refresh the page or click change username`,
        sender: "system",
        type: "TEXT",
      };
      socket.emit("message", data);
    }
  });

  socket.on("disconnect", () => {
    let roomID = userID2roomID.get(socket.id);
    if (roomID) {
      let room = getRoom(roomID);
      if (room.users.has(socket.id)) {
        userID2roomID.delete(socket.id);
        let username = room.users.get(socket.id).username;
        room.usernameSet.delete(username);
        room.users.delete(socket.id);
        let data = {
          content: `${username} left`,
          sender: "system",
          type: "TEXT",
        };
        io.to(roomID).emit("message", data);
      }
    }
  });
});

server.listen(process.env.PORT || 3000);
