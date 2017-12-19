var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(4000, '0.0.0.0', function(){
    console.log('listening for requests on port 4000,');
});

app.use(express.static('public'));

var users = [];
var rooms = ['room1', 'room2', 'room3'];

var io = socket(server);
io.sockets.on('connection', (socket) => {

    socket.join('room1');
    socket.room = 'room1';
    // console.log(socket.room);

	socket.on('disconnect', function(){
		console.log("USER DISCONNECTED: ", socket.username);
		users.splice(users.indexOf(socket.username), 1);
		io.sockets.in(socket.room).emit('adduser', users);
	});
	
    socket.on('adduser', function(username){
		if (username != "") {
			console.log("NEW USER: ", username);
			socket.username = username;
			users.push(username);
			console.log('add user event');
			// socket.emit('updaterooms', rooms, 'room1');
		}
		io.sockets.in(socket.room).emit('adduser', users);
    });

    socket.on('changeroom', function(newroom){
        console.log('Changing room to:' + newroom);
        socket.leave(socket.room);
        socket.join(newroom);
        socket.room = newroom;
        socket.emit('updaterooms', rooms, newroom);
    });

    socket.on('chat', function(data){
        io.sockets.in(socket.room).emit('updatechat', {
            message: data.message,
            username: socket.username
        });
        // io.sockets.emit('chat', data);
    });

    socket.on('typing', function(){
        io.sockets.in(socket.room).emit('typing', socket.username);
        // socket.broadcast.emit('typing', data);
    });

});