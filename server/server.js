const express = require("express");
const http = require("http");

const app = express();
const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));
const server = http.createServer(app);

server.listen(8080, () => {
    console.log("server running on port 8080");
});

const io = require("socket.io")(server);

let counter = 0;

let onlineUsers = [];

let chatBoxOpen = false;

io.on('connection', (socket) => {
    counter++;
    console.log(`Someone connected, ${counter} people online now`);    
    
    socket.on('logIn', (username) => {
        if (onlineUsers.indexOf(username) === -1) {
            onlineUsers.push(username);
        }
        io.emit("displayUsers", onlineUsers);
        socket.username = username;
        chatBoxOpen = true;
        console.log(`${socket.username} logged in`);
    });    
    
    socket.on('logOut', (username) => {
        while (onlineUsers.indexOf(username) > -1) {
            onlineUsers.splice(onlineUsers.indexOf(username), 1);
        }
        io.emit("displayUsers", onlineUsers);
        console.log(`${username} logged out`);
        socket.username = null;
    });

    socket.on('sendToAll', (data) => {
        io.emit("displayMessage", data[0], data[1], data[2]);
    });

    socket.on('sendToMe', (data) => {
        socket.emit("displayMessage", data[0], data[1], data[2]);
    });
    
    socket.on("disconnect", (reason) => {
        console.log(`${socket.username} disconnected`);
        while (onlineUsers.indexOf(socket.username) > -1) {
            onlineUsers.splice(onlineUsers.indexOf(socket.username), 1);
        };
        socket.username = null;
        io.emit("displayUsers", onlineUsers);
    
    });
});


