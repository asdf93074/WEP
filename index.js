var express = require('express');
var socket = require('socket.io');
var bodyParser = require('body-parser');
var session = require('express-session');
var pg = require('pg');
var rs = require('randomstring');
var router = express.Router();

var connect = "pg://postgres:postgres@localhost:5432/reactapp";

var app = express();
var sess = {
    secret: 'keyboard cat',
    cookie: {'maxAge': 360000}
    };
    
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }

app.use(session(sess));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: function(req) {
       return req.headers['content-type'] === '*/*; charset=UTF-8'
}}));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
// var router = express.Router();

var server = app.listen(3001, '0.0.0.0', function(){
    console.log('listening for requests on port 3001,');
});

// app.use('/', router);

var client = new pg.Client(connect);
client.connect();

app.use(express.static(__dirname));

app.get('/login', function(req, res){
    res.sendFile(__dirname + '/loginpage.html'); 
});

app.get('/signup', function(req, res){
    res.sendFile(__dirname + '/signUpPage.html');
});

app.post('/signuprequest', function(req, res){
    if(!(/^[A-Za-z0-9\_.]+[@]+[A-Za-z0-9]+[.]+[A-Za-z0-9]/.test(req.body.email))){
        res.redirect('/signup');
    }
    else if(!(req.body.password.length<6 || req.body.password.length>24)){
        res.redirect('/signup')
    }
    else if(!(/[a-z]/.test(req.body.password)   &&   /[A-Z]/.test(req.body.password)   &&  /[0-9]/.test(req.body.password))){
        res.redirect('/signup');
    } else{
        client.query(
            "INSERT INTO usertable (email, username, password, steamid) VALUES ($1, $2, $3, $4)",
            [req.body.email, req.body.username, req.body.password, Math.floor(Math.random()*1000)]
        );
        res.redirect('/login');    
    }
});

app.get('/api/user', (req, res) => {
    if (req.session.u != undefined) {
      res.json(req.session);
    } else {
      res.json({u: undefined});
    }
  });

app.post('/loginrequest', function(req, res1){
    // client.query(
    //     "SELECT * FROM usertable where username like '" + req.body.username + "' and password like '" + req.body.password + "'", (err, res) => {
    //         if (err){
    //             console.log(err);
    //         }
    //         else{
    //             if (res.rows.length == 0){
    //                 res1.redirect('/login');
    //             }
    //             else{
    //                 res1.redirect('/');
    //             }
    //         }
    //     }
    // )
    req.session.u = req.body.username;
    req.session.save();
    res1.redirect('http://localhost:3000');
});

var users = [];
var rooms = [{roomName: 'room1', numberOfPlayers: 0}, {roomName: 'room2', numberOfPlayers: 0}, {roomName: 'room3', numberOfPlayers: 0}];
var roomsToUsers = {'room1': [], 'room2': [], 'room3': []};
var usersToSocket = {};
var userInfo = {};
var openMatches = [];
var currentMatches = [];
var pendingMatches = {};
var retusers = [];

function insertDetails(matchid, chal, opp, chalteam, oppteam, winner, avgscra, avgscrb){
    client.query(
        "INSERT INTO match(id, challenger, opponent, averagescorea, averagescoreb, challengerteam, opponentteam, winner) values($1, $2, $3, $4, $5, $6, $7, $8)",
        [matchid, chal, opp, avgscra, avgscrb, chalteam, oppteam, winner]
    );
}

function getUsers(){
    client.query("SELECT * FROM usertable", (err, res) => {
        if (err){
            console.log("Error connecting");
        }
        else{
            for (var i = 0; i < res.rows.length; i++){
                retusers.push(res.rows[i].Username);
            }
            users = users.concat(retusers);
            // console.log(users);
        }
    });    
}

getUsers();

var challengeErrorMessgages = {
    20: "This challenge has expired",
	0: "No error",
	1: "That user is already in a challenge",
	2: "That user is already playing in a game",
	3: "That user is already playing in a game"
};

function userIsFree(u, callback, err) {
    console.log(userInfo, u);
    if (userInfo[u].status == 0) {
        callback();
    } else {
        err();
    } 
}

function createOpenMatch(c, o) {
    let obj = {
        matchid: rs.generate(5),
        challenger: c,
        opponent: o,
        challengerTeam: [],
        opponentTeam: [],
        winner: null,
        avgTeamA: 0,
        avgTeamB: 0
    };

    openMatches.push(obj);

    return obj;
}

var io = socket(server);
io.sockets.on('connection', (socket) => {
    socket.join('room1');
    socket.room = 'room1';
	
    socket.emit('roomslist', rooms);

	socket.on('disconnect', function(){
		console.log("USER DISCONNECTED: ", socket.username);
        
        for (let i = 0; i < rooms.length; i++) {
            roomsToUsers[rooms[i].roomName].splice(roomsToUsers[rooms[i].roomName].indexOf(socket.username), 1);
            io.sockets.in(rooms[i].roomName).emit('updateUserList', roomsToUsers[rooms[i].roomName], rooms[i].roomName);
        }
	});
	
    socket.on('adduser', function(username){
        console.log("NEW USER: ", username);
        socket.username = username;
        usersToSocket[username] = socket;
        if (userInfo[username] == undefined) {
            var i = {};
            i.online = 1;
            i.status = 0;
            userInfo[username] = i;
            io.sockets.in(socket.room).emit('userInfoUpdate', username, i);
        }
    });

    // socket.on('changeroom', function(newroom){
    //     console.log('Changing room to:' + newroom);
    //     socket.leave(socket.room);
    //     socket.join(newroom);
    //     socket.room = newroom;
    //     socket.emit('updaterooms', rooms, newroom);
    // });
	
	socket.on('roomJoin', function(roomName) {
        socket.join(roomName);
		console.log(socket.username," JOINED ",socket.room);
        roomsToUsers[roomName].push(socket.username);
        socket.emit('updatechat', {message: "Welcome to DoubleDamage, a Dota 2 league.", username: "DDBot", room: roomName, type: "notice"});
        console.log(socket.room);
		io.sockets.in(socket.room).emit('updateUserList', roomsToUsers[roomName], roomName);
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
            data.users = [socket.username, u];

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
        console.log("NEW CHALLENGE FROM ", socket.username, u);
        if (userInfo[u].status == 0) {
            let t = usersToSocket[u];
            console.log(socket.room);
            t.emit('updatechat', {
                message: socket.username + " has challenged you to a match.",
                username: "DDBot",
                room: socket.room,
                type: "challengeNotice",
                opp: socket.username
            });
            pendingMatches[socket.username+"vs"+t.username] = {
                c: socket.username,
                o: t.username
            };
        } else {
            socket.emit('challengeError', challengeErrorMessgages[userInfo[u].status]);
        }
    })

    socket.on('challengeAccept', function(o){
        userIsFree(o,
        ()=>{
            if (pendingMatches[o+"vs"+socket.username] != undefined) {
                let temp = createOpenMatch(o, socket.username);
                io.sockets.in(socket.room).emit('openMatches', openMatches);
                pendingMatches[o+"vs"+socket.username] = undefined;
                io.sockets.in(socket.room).emit('updatechat', {message: "["+temp.matchid+"] "+o+" has challenged " +  socket.username + ". Double-click on the right side to join the match."
                , username: "DDBot", room: socket.room, type: "notice"});
            } else {
                socket.emit('challengeError', challengeErrorMessgages[20]);
            }
        },
        ()=>{
            socket.emit('challengeError', challengeErrorMessgages[userInfo[u].status])
        }
        )
    })

    socket.on('challengeReject', function(o){
        userIsFree(o,
        ()=>{
            if (pendingMatches[o+"vs"+socket.username] != undefined) {
                let temp = createOpenMatch(o, socket.username);
                io.sockets.in(socket.room).emit('openMatches', openMatches);
                pendingMatches[o+"vs"+socket.username] = undefined;
                io.sockets.in(socket.room).emit('updatechat', {message: "["+temp.matchid+"] "+o+" has challenged " +  socket.username + ". Double-click on the right side to join the match."
                , username: "DDBot", room: socket.room, type: "notice"});
            } else {
                socket.emit('challengeError', challengeErrorMessgages[20]);
            }
        },
        ()=>{
            socket.emit('challengeError', challengeErrorMessgages[userInfo[u].status])
        }
        )
    })
});
