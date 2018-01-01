var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(4000, '0.0.0.0', function(){
    console.log('listening for requests on port 4000,');
});

app.use(express.static('public'));

var users = [];
var rooms = [{roomName: 'room1', numberOfPlayers: 3}, {roomName: 'room2', numberOfPlayers: 5}, {roomName: 'room3', numberOfPlayers: 0}];
var roomsToUsers = {'room1': {}, 'room2': {}, 'room3': {}};
var usersToSocket = {};
var userInfo = {};
var openMatches = [];
var currentMatches = [];

var io = socket(server);
io.sockets.on('connection', (socket) => {

    socket.join('room1');
    socket.room = 'room1';
	
    socket.emit('roomslist', rooms);

	socket.on('disconnect', function(){
		console.log("USER DISCONNECTED: ", socket.username);
        users.splice(users.indexOf(socket.username), 1);
        
		io.sockets.in(socket.room).emit('adduser', users);
	});
	
    socket.on('adduser', function(username){
		if (username != "") {
			console.log("NEW USER: ", username);
            socket.username = username;
            usersToSocket[username] = socket;
            users.push(username);
            if (userInfo[username] == undefined) {
                var i = {};
                i.online = 1;
                i.status = 0;
                userInfo[username] = i;
                io.sockets.in(socket.room).emit('userInfoUpdate', username, i);
            }
			// socket.emit('updaterooms', rooms, 'room1');
		}
        io.sockets.in(socket.room).emit('adduser', users);
        socket.emit('userInfo', userInfo);
    });

    socket.on('changeroom', function(newroom){
        console.log('Changing room to:' + newroom);
        socket.leave(socket.room);
        socket.join(newroom);
        socket.room = newroom;
        socket.emit('updaterooms', rooms, newroom);
    });
	
	socket.on('roomJoin', function(roomName) {
        socket.join(roomName);
        socket.emit('updatechat', {message: "Welcome to DoubleDamage, a Dota 2 league.", username: "DDBot", room: roomName, type: "notice"});
        roomsToUsers[roomName][socket.username] = socket;
	});

    socket.on('chat', function(data){
        if (usersToSocket[data.room] == undefined) {
            io.sockets.in(data.room).emit('updatechat', {
                message: data.message,
                username: socket.username,
                room: data.room
            });
        } else {
            let m = data.message;
            let u = data.room;
    
            data.type = 'pm';
            data.username = socket.username;

            socket.emit('updatechat', data);

            let targetSocket = usersToSocket[u];
            data.room = data.username;
            console.log(data);
            console.log(socket.username, " SENDING TO ", targetSocket.username);
            targetSocket.emit('updatechat', data);
        }
        
        // io.sockets.emit('chat', data);
    });

    socket.on('typing', function(){
        io.sockets.in(socket.room).emit('typing', socket.username);
        // socket.broadcast.emit('typing', data);
    });

    socket.on('challenge', function(u){
        if (userInfo[u].status == 0) {
            let t = usersToSocket[u];

            t.emit("challengeRequest", socket.username);
        } else {
            socket.emit('challengeReply', 2);
        }
    })

});