const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const {generateMessage, generteLocationMessage} = require('./utils/message');
const{isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('disconnect', () =>{
        console.log('Disconnected from the user');
        var user = users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
        
    });

    socket.on('join', (params, callback) =>{
        if(!isRealString(params.name) || !isRealString(params.room)){
           return callback("Display name and room name are required")
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id,params.name,params.room);
        io.to(params.room).emit('updateUserList',users.getUserList(params.room));
        // socket.leave('room name') -to leave the room
        // io.emit() -> io.to('room name').emit() - send to everybody in the chat room
        //socket.broadcast.emit() -> socket.broadcast.to('room name').emit() - send to everybody in the room except the user
        //socket.emit() - emit to a specific user
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app.'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    });

    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        var user = users.getUser(socket.id);
        if(user && isRealString(message.text)){
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback('This is from the server');
      });

    socket.on('createLocationMessage' , (coords) => {
        var user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage', generteLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });
});

app.use(express.static(publicPath));

server.listen(port, () =>{
    console.log(`Server running on the port ${port}`);
})

