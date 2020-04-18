let express = require('express');
let path = require('path');
const serveStatic = require('serve-static');

let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let users = new Map();

io.sockets.on('connection', function (socket) {
    socket.on('connect', () => {

    });

    socket.on('register', function (username) {
        username = username.trim();
        if (users.has(username)) {
            socket.emit('conflict username');
        } else {
            socket.username = username;
            users.set(username, []);
            socket.emit('register success');
            io.sockets.emit('system', `${username} connected`);
        }
    });

    socket.on('message', function (message) {
        message = message.trim();
        if(message === "") return;
        let username = socket.username;
        if (username === undefined || username === "") {
            username = "Anonymous";
        }
        io.emit('message', message, username);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.sockets.emit('system', `${socket.username} connected`);
        }
    });
});


app.use(serveStatic(path.join(__dirname, 'public'), {maxAge: '600000'}));

server.listen(process.env.PORT || 3000);