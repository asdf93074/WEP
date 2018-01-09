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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
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
    else if(req.body.password.length<6 || req.body.password.length>24){
        res.redirect('/signup')
    }
    else if(!(/[a-z]/.test(req.body.password)   &&   /[A-Z]/.test(req.body.password)   &&  /[0-9]/.test(req.body.password))){
        res.redirect('/signup');
    } else{
        client.query(
            "INSERT INTO usertable (email, username, password, steamid) VALUES ($1, $2, $3, $4)",
            [req.body.email, req.body.username, req.body.password, req.body.steamid]
        );
        client.query(
            "INSERT INTO userextras (username, wins, loss, draws, totalscore) VALUES ($1, $2, $3, $4, $5)",
            [req.body.username, 0, 0, 0, 1000]
        )
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

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('http://localhost:3001/login');
    // console.log("Logout request");
})

app.post('/loginrequest', function(req, res1){
    client.query(
        "SELECT * FROM usertable where username like '" + req.body.username + "' and password like '" + req.body.password + "'", (err, res) => {
            if (err){
                console.log(err);
            }
            else{
                if (res.rows.length == 0){
                    res1.redirect('/login');
                }
                else{
                    req.session.u = req.body.username;
                    req.session.save();
                    res1.redirect('http://localhost:3000');
                }
            }
        }
    )
});

var users = [];
var rooms = [{roomName: 'room1', numberOfPlayers: 0}, {roomName: 'room2', numberOfPlayers: 0}, {roomName: 'room3', numberOfPlayers: 0}];
var roomsIndex = {'room1': 0, 'room2': 1, 'room3': 2};
var roomsToUsers = {'room1': [], 'room2': [], 'room3': []};
var roomsToOpenMatches = {'room1': [], 'room2': [], 'room3': []};
var openMatchesToRoom = {};
var roomsToCurrentMatches = {'room1': [], 'room2': [], 'room3': []};
var currentMatchesToRoom = {};
var usersToSocket = {};
var usersToSteamID = {};
var userInfo = {};
var openMatches = [];
var openMatchTurn = {};
var openMatchesIndex = {};
var openMatchesCounter = 0;
var currentMatches = [];
var currentMatchTurn = {};
var currentMatchesIndex = {};
var currentMatchesCounter = 0;
var currentMatches = [];
var pendingMatches = {};
var retusers = [];

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

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
                retusers.push(res.rows[i].username);
            }
            users = users.concat(retusers);
            // console.log(users);
        }
    });    
}

function getUserProfiles(){
    client.query("SELECT username, steamid FROM usertable", (err, res) => {
        if (err) {
            console.log("Error querying");
        }
        else {
            for (var i = 0; i < res.rows.length; i++){
                usersToSteamID[res.rows[i].username] = res.rows[i].steamid;
            }
        }
    });
}

getUsers();
getUserProfiles();

var challengeErrorMessgages = {
    20: "This challenge has expired",
	0: "No error",
	1: "That user is already in a challenge",
	2: "That user is already playing in a game",
	3: "That user is already playing in a game"
};

var challengeErrorMessgagesSelf = {
    20: "This challenge has expired",
	0: "No error",
	1: "You are already in a challenge",
	2: "You are already playing in a game",
	3: "You are already playing in a game"
};

function userIsFree(u, callback, err) {
    console.log(userInfo, u);
    if (userInfo[u].status == 0) {
        callback();
    } else {
        err();
    } 
}

function openMatchExists(match, callback, err) {
    for (let i = 0; i < openMatches.length; i++) {
        if (openMatches[i].matchid == match) {
            callback();
        }
    }

    err();
}

function emitToUsers(u, eventName, args) {
    let s = [];
    for (let i = 0; i < u.length; i++) {
        s.push(usersToSocket[u[i]]);
    }
    for (let j = 0; j < s.length; j++) {
        if (eventName == 'draftOpen') {
            s[j].join(args.matchData.matchid);
        }
        s[j].emit(eventName, args);
        console.log("SENT");
    }
}

function createOpenMatch(c, o) {
    let obj = {
        matchid: rs.generate(5),
        challenger: c,
        opponent: o,
        challengerTeam: [],
        opponentTeam: [],
        freeTeam: [],
        winner: null,
        avgTeamA: 0,
        avgTeamB: 0
    };

    openMatchesIndex[obj.matchid] = openMatchesCounter;
    openMatchesCounter++;
    openMatches.push(obj);

    return obj;
}

function removeOpenMatchFromRoom(room, id) {
    console.log(roomsToOpenMatches, id, room);
    for (let i = 0; i < roomsToOpenMatches[room].length; i++) {
        if (roomsToOpenMatches[room][i].matchid == id) {
            roomsToOpenMatches[room].splice(i, 1);
        }
    }
}

var io = socket(server);
io.sockets.on('connection', (socket) => {
    socket.join('room1');
    socket.room = 'room1';
	
    socket.emit('roomslist', rooms);

	socket.on('disconnect', function(){
        if (socket.username != undefined) {
            console.log("USER DISCONNECTED: ", socket.username);
            for (let i = 0; i < rooms.length; i++) {
                if (roomsToUsers[rooms[i].roomName].indexOf(socket.username) != -1) {
                    roomsToUsers[rooms[i].roomName].splice(roomsToUsers[rooms[i].roomName].indexOf(socket.username), 1);
                    rooms[i].numberOfPlayers--;
                    usersToSocket[socket.username] = undefined;
                    userInfo[socket.username].online = 0;
                    io.sockets.in(rooms[i].roomName).emit('updateUserList', roomsToUsers[rooms[i].roomName], rooms[i].roomName);
                    io.emit('roomslist', rooms);
                }
            }
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
        } else {
            userInfo[username].online = 1;
        }
    });

    socket.on('getProfile', function(user){
        console.log("server", user);
        var data = {};
        client.query(
            "SELECT wins, loss, draws, totalscore FROM userextras where username like '" + user + "'", (err, res) => {
                if (err) {
                    console.log("Error querying");
                }
                else{
                    data = {
                            wins: res.rows[0].wins,
                            loss: res.rows[0].loss,
                            draws: res.rows[0].draws,
                            totalscore: res.rows[0].totalscore
                        }
                    console.log("data", data);
                    socket.emit('userProfile', data);
                }
            }
        )
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
        rooms[roomsIndex[roomName]].numberOfPlayers++;
        io.emit('roomslist', rooms);
        socket.emit('openMatches', roomsToOpenMatches[roomName], roomName);
        socket.emit('currentMatches', roomsToCurrentMatches[roomName], roomName);
        roomsToUsers[roomName].push(socket.username);
        socket.emit('updatechat', {message: "Welcome to DoubleDamage, a Dota 2 league.", username: "DDBot", room: roomName, type: "notice"});
        io.sockets.in(socket.room).emit('updateUserList', roomsToUsers[roomName], roomName);
    });
    
    socket.on('roomLeave', function(roomName) {
        socket.leave(roomName);
        rooms[roomsIndex[roomName]].numberOfPlayers--;
        io.emit('roomslist', rooms);
        roomsToUsers[roomName].splice(roomsToUsers[roomName].indexOf(socket.username), 1);
        io.sockets.in(socket.room).emit('updateUserList', roomsToUsers[roomName], roomName);
    });

    socket.on('chat', function(data){
        console.log(data);
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

    socket.on('challenge', function(u, r){
        console.log("NEW CHALLENGE FROM ", socket.username, u);
        if (userInfo[u].status == 0) {
            let t = usersToSocket[u];
            console.log(socket.room);
            t.emit('updatechat', {
                message: socket.username + " has challenged you to a match.",
                username: "DDBot",
                room: r,
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
    });

    socket.on('challengeAccept', function(o, r){
        userIsFree(o,
        ()=>{
            if (pendingMatches[o+"vs"+socket.username] != undefined) {
                let temp = createOpenMatch(o, socket.username);
                roomsToOpenMatches[r].push(temp);
                openMatchesToRoom[temp.matchid] = r;
                io.sockets.in(r).emit('openMatches', roomsToOpenMatches[r], r);
                userInfo[o].status = 1;
                userInfo[socket.username].status = 1;
                pendingMatches[o+"vs"+socket.username] = undefined;
                io.sockets.in(r).emit('updatechat', {message: "["+temp.matchid+"] "+o+" has challenged " +  socket.username + ". Double-click on the right side to join the match."
                , username: "DDBot", room: r, type: "notice"});
            } else {
                socket.emit('challengeError', challengeErrorMessgages[20]);
            }
        },
        ()=>{
            socket.emit('challengeError', challengeErrorMessgages[userInfo[o].status])
        }
        )
    });

    socket.on('challengeReject', function(o, r){
        userIsFree(o,
        ()=>{
            if (pendingMatches[o+"vs"+socket.username] != undefined) {
                pendingMatches[o+"vs"+socket.username] = undefined;
                usersToSocket[o].emit('updatechat', {message: socket.username + " rejected your challenge.", type: 'challengeNoticeReject', room: r})
            } else {
                socket.emit('challengeError', challengeErrorMessgages[20]);
            }
        },
        ()=>{
            socket.emit('challengeError', challengeErrorMessgages[userInfo[o].status])
        }
        )
    });

    socket.on('joinMatch', function(match, roomName) {
        console.log(userInfo, socket.username, roomName);
        if (userInfo[socket.username].status == 0) {
            let oldCount = openMatches[openMatchesIndex[match]].freeTeam.length + 2;
            openMatches[openMatchesIndex[match]].freeTeam.push(socket.username);
            let newCount = openMatches[openMatchesIndex[match]].freeTeam.length + 2;
            io.sockets.in(roomName).emit('updatechat', {message: socket.username + " signed up for match " + match + ".", type: 'notice', room: roomName});
            io.sockets.in(roomName).emit('openMatches', roomsToOpenMatches[roomName], roomName);
            userInfo[socket.username].status = 1;
            if (newCount == 4 && oldCount == 3) {
                io.sockets.in(roomName).emit('updatechat', {message: 10 + " players have signed up for match " + match + ". The captains can start the game now.", type: 'notice', room: roomName});
                let chall = usersToSocket[openMatches[openMatchesIndex[match]].challenger];
                let opp = usersToSocket[openMatches[openMatchesIndex[match]].opponent];
                chall.emit('startButton', match, roomName);
            }
            socket.emit('leaveButton', match, roomName);
        } else {
            socket.emit('challengeError', challengeErrorMessgagesSelf[userInfo[socket.username].status]);
        }
    });

    socket.on('startGame', function(id, r) {
        if (openMatches[openMatchesIndex[id]].freeTeam.length >= 2) {
            console.log("GAME STARTED");
            io.sockets.in(r).emit('updatechat', {message: "Draft for match " + id + " has started.", type: 'notice', room: r});
            let u = openMatches[openMatchesIndex[id]].freeTeam;
            // u.push(openMatches[openMatchesIndex[id]].challenger);
            // u.push(openMatches[openMatchesIndex[id]].opponent);
            emitToUsers([...u, openMatches[openMatchesIndex[id]].challenger, openMatches[openMatchesIndex[id]].opponent], 'draftOpen', {i: id, roomName: r, type: 'draft', matchData: openMatches[openMatchesIndex[id]]});
            let t = getRandomInt(2);
            if (t == 0) {
                io.sockets.in(id).emit('updatechat', {message: openMatches[openMatchesIndex[id]].challenger + " has first pick. Double click on a player in the 'Players' list to pick them.", type: 'notice', room: id});
                openMatchTurn[id] = t;
            } else {
                io.sockets.in(id).emit('updatechat', {message: openMatches[openMatchesIndex[id]].opponent + " has first pick. Double click on a player in the 'Players' list to pick them.", type: 'notice', room: id});
                openMatchTurn[id] = t;
            }
            console.log("TURN", openMatchTurn);
        } else {
            socket.emit('startGameError', "Not enough players yet.");
        }
    });

    socket.on('playerSelect', function(player, id){
        let c = openMatches[openMatchesIndex[id]].challengerTeam.length + openMatches[openMatchesIndex[id]].opponentTeam.length;
        if (c != 4) {
            let i;
            let n;
            if (openMatches[openMatchesIndex[id]].challenger == socket.username) {
                n = openMatches[openMatchesIndex[id]].opponent;
                i = 0;
            } else if (openMatches[openMatchesIndex[id]].opponent == socket.username) {
                n = openMatches[openMatchesIndex[id]].challenger;
                i = 1;
            }

            console.log(i, openMatchTurn[id]);
            if (i == openMatchTurn[id]) {
                if (i == 0) {
                    openMatches[openMatchesIndex[id]].challengerTeam.push(player);
                } else {
                    openMatches[openMatchesIndex[id]].opponentTeam.push(player);
                }
                openMatches[openMatchesIndex[id]].freeTeam.splice(openMatches[openMatchesIndex[id]].freeTeam.indexOf(player), 1);
                io.sockets.in(id).emit('openMatches', roomsToOpenMatches[openMatchesToRoom[id]], openMatchesToRoom[id]);
                i++;
                i = i % 2;
                openMatchTurn[id] = i;
                c = openMatches[openMatchesIndex[id]].challengerTeam.length + openMatches[openMatchesIndex[id]].opponentTeam.length + 2;
                if (c < 4) {
                    io.sockets.in(id).emit('updatechat', {message: socket.username + " picked " + player + ". " + n + "'s turn to pick.", type: 'notice', room: id});
                } else if (c == 4) {
                    let temp = openMatches[openMatchesIndex[id]];
                    io.sockets.in(id).emit('updatechat', {message: socket.username + " picked " + player + ". Drafting is finished. Pick a result from the right side once the game has ended.", type: 'notice', room: id});
                    io.sockets.in(openMatchesToRoom[id]).emit('updatechat', {message: "Team " + temp.challenger
                    + ":" + temp.challengerTeam[0] + ", " + temp.challengerTeam[1] + ", " + temp.challengerTeam[2] + ", " + temp.challengerTeam[3] + " vs " + temp.opponent
                    + ":" + temp.opponentTeam[0] + ", " + temp.opponentTeam[1] + ", " + temp.opponentTeam[2] + ", " + temp.opponentTeam[3], type: 'notice', room: openMatchesToRoom[id]});
                    currentMatches.push(temp);
                    currentMatchesIndex[id] = currentMatchesCounter++;
                    currentMatchesToRoom[id] = openMatchesToRoom[id];
                    roomsToCurrentMatches[openMatchesToRoom[id]].push(temp);

                    openMatches.splice(currentMatchesIndex[id], 1);
                    removeOpenMatchFromRoom(openMatchesToRoom[id], id);
                    console.log("DONE", openMatches);
                    io.sockets.in(currentMatchesToRoom[id]).emit('openMatches', roomsToOpenMatches[currentMatchesToRoom[id]], openMatchesToRoom[id]);

                    openMatchesToRoom[id] = undefined;
                    openMatchesIndex[id] = undefined;
                    openMatchesCounter--;

                    console.log("SENDING CURRENT", currentMatches, roomsToCurrentMatches);
                    io.sockets.in(currentMatchesToRoom[id]).emit('currentMatches', roomsToCurrentMatches[currentMatchesToRoom[id]], currentMatchesToRoom[id]);
                }
            } else {
                socket.emit('challengeError', "It is not your turn yet.");
            }
        } else {
            socket.emit('challengeError', "Your team is full.");
        }
    });
});
