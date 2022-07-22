const express = require("express");
const http = require("http");

const app = express();
const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));
const server = http.createServer(app);

const port = process.env.PORT || 8080;

server.listen(8080, () => {
    console.log("server running on port " + port);
});

const io = require("socket.io")(server);

let username;
let onlineUsers = [];
let typingUsers = [];

io.on('connection', (socket) => {    
    
    socket.on('logIn', (username) => {
        if (onlineUsers.indexOf(username) === -1) {
            onlineUsers.push(username);
        }
        io.emit("displayUsers", onlineUsers);
        socket.username = username;
    });    
    
    socket.on('logOut', (username) => {
        while (onlineUsers.indexOf(username) > -1) {
            onlineUsers.splice(onlineUsers.indexOf(username), 1);
        }
        while (typingUsers.indexOf(username) > -1) {
            typingUsers.splice(typingUsers.indexOf(username), 1);
        }
        io.emit("displayUsers", onlineUsers);
        io.emit("displayTyping", typingUsers);
        socket.username = null;
    });

    socket.on('typing', (username) => {
        if (typingUsers.indexOf(username) === -1) {
            typingUsers.push(username);
        }
        io.emit("displayTyping", typingUsers);
    });

    socket.on('stoppedTyping', (username) => {
        while (typingUsers.indexOf(username) > -1) {
            typingUsers.splice(typingUsers.indexOf(username), 1);
        }
        io.emit("removeTyping", typingUsers);
    });

    socket.on('sendToAll', (data) => {
        while (typingUsers.indexOf(username) > -1) {
            typingUsers.splice(typingUsers.indexOf(username), 1);
        }
        io.emit("displayMessage", data[0], data[1], data[2]);
    });

    socket.on('sendToMe', (data) => {
        while (typingUsers.indexOf(data[1]) > -1) {
            typingUsers.splice(typingUsers.indexOf(data[1]), 1);
        }
        socket.emit("displayMessage", data[0], data[1], data[2]);
    });
    
    socket.on("disconnect", () => {
        console.log(`${socket.username} disconnected`);
        while (onlineUsers.indexOf(socket.username) > -1) {
            onlineUsers.splice(onlineUsers.indexOf(socket.username), 1);
        };
        while (typingUsers.indexOf(socket.username) > -1) {
            typingUsers.splice(typingUsers.indexOf(socket.username), 1);
        };
        socket.username = null;
        io.emit("displayUsers", onlineUsers);
        io.emit("displayTyping", typingUsers);
    });
});


