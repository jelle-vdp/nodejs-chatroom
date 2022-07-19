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

io.on('connection', (socket) => {
    counter++;
    console.log(`Someone connected, ${counter} people online now`);

    socket.on('sendToAll', (data) =>{
        io.emit("displayMessage", data[0], data[1], data[2]);
    });

    socket.on('sendToMe', (data) =>{
        socket.emit("displayMessage", data[0], data[1], data[2]);
    });
});


