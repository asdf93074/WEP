import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import openSocket from 'socket.io-client';
import * as FontAwesome from 'react-icons/lib/fa';

var q = "https://d30y9cdsu7xlg0.cloudfront.net/png/45447-200.png";
var sent = 0;

const socket = openSocket("http://localhost:3001");

// window.onbeforeunload = function() {
// 	socket.emit('disconnect');
// }

function Message(props) {
	var c = [];
	let currentRoom = document.getElementsByClassName("rightClickMenu")[0].currentRoom;
	for (let i = 0; i < props.data.length; i++) {
		if (props.data[i].type == 'notice') {
			c.push(<div className="messageNotice"><p className="notice">{props.data[i].message}</p></div>);
		} else if (props.data[i].type == 'challengeNotice'){
			c.push(<div className="messageNotice"><p className="notice">[PRIVATE] {props.data[i].message}
			<span onClick={()=>{socket.emit("challengeAccept", props.data[i].opp, currentRoom)}}><p className="noticeOptions" id="noticeOptionAccept">Accept</p></span>
			/<span onClick={()=>{socket.emit("challengeReject", props.data[i].opp, currentRoom)}}><p className="noticeOptions" id="noticeOptionDecline">Decline</p></span></p></div>);
		} else if (props.data[i].type == 'challengeNoticeReject'){
			c.push(<div className="messageNotice"><p className="notice">[PRIVATE] {props.data[i].message}</p></div>);
		} else {
			c.push(<div className="message"><p className="userNames">{props.data[i].username}: </p>{props.data[i].message}<p class="messageTime">Time: {props.data[i].time}</p></div>);			

		}
	}
	return c;
}

function OnlinePlayers(props) {
	return <p id="playersListHead"><FontAwesome.FaUser /> Online - {props.users}</p>;
}

class RightClickMenuItems extends Component {
	constructor(props) {
		super(props);
		this.state = {items: props.items, itemsFunc: props.itemsFunc}
	}
	
	render() {
		var ret = [];
		for (let i = 0; i < this.state.items.length; i++) {
			ret.push(<p className="rightClickMenuItem" onClick={this.state.itemsFunc[i]}>{this.state.items[i]}</p>);
		}
		return ret;
	}
}

class RightClickMenu extends Component {
	constructor(props) {
		super(props);
		this.profileClickHandler = this.profileClickHandler.bind(this);
	}

	profileClickHandler(){
		this.props.getUserDetails(document.getElementsByClassName("rightClickMenu")[0].currentTarget);
		document.getElementById("overlay").style.zIndex = 100;
		document.getElementById("OtherUserModal").style.zIndex = 101;
		document.getElementById("OtherUserModal").style.display = "block";
		document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";	}
	
	render() {
		var i = ["Profile", "Message", "Ignore", "Challenge"];
		var iFunctions = [];
		iFunctions[0] = this.profileClickHandler;

		iFunctions[1] = ()=>{
			this.props.messageUser(document.getElementsByClassName("rightClickMenu")[0].currentTarget);
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}
		
		iFunctions[2] = function(){
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}

		iFunctions[3] = function(){
			socket.emit("challenge", document.getElementsByClassName("rightClickMenu")[0].currentTarget, document.getElementsByClassName("rightClickMenu")[0].currentRoom);
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}
		return <div className="rightClickMenu"><RightClickMenuItems items={i} itemsFunc={iFunctions}/></div>;
	}
}

class PlayersList extends Component {
	// constructor(props) {
	// 	super(props);
	// 	this.state = {users: props.users};
	// }
	
	rightClickHandler(e) {
		e.persist();
		e.preventDefault();
		document.getElementsByClassName("rightClickMenu")[0].currentTarget = e.target.textContent;
		document.getElementsByClassName("rightClickMenu")[0].style.visibility = "visible";
		if (e.clientX + document.getElementsByClassName("rightClickMenu")[0].clientWidth - 1 > window.innerWidth) {
			document.getElementsByClassName("rightClickMenu")[0].style.left = "";
			document.getElementsByClassName("rightClickMenu")[0].style.right = "px";
		} else {
			document.getElementsByClassName("rightClickMenu")[0].style.right = "";
			document.getElementsByClassName("rightClickMenu")[0].style.left = e.clientX - document.getElementsByClassName("rightClickMenu")[0].parentElement.offsetLeft + "px";
			document.getElementsByClassName("rightClickMenu")[0].style.top = e.clientY + "px";
		}
	}
	
	render() {
		var c = [];

		for (let i = 0; i < this.props.users.length; i++) {
			c.push(<div onContextMenu={this.rightClickHandler} className="playersListUserNames">{/*<img src="https://d30y9cdsu7xlg0.cloudfront.net/png/45447-200.png"></img>*/}
			<p>{this.props.users[i]}</p></div>);
		}
		return (<div id="playersListUserNamesContainer">{c}</div>);
	}
}			   

class TabName extends Component {
	constructor(props){
		super(props);
	}
	
	activeTabHandler(e) {
		for (let j = 0; j < this.props.tabs.length; j++) {
			if (document.getElementById(this.props.tabs[j].value).unread != 1) {
				document.getElementById(this.props.tabs[j].value).style.backgroundColor = "";
			}
			document.getElementById(this.props.tabs[j].value+"Data").style.zIndex = "-90";
		}
		document.getElementById(e).style.backgroundColor = "black";
		document.getElementById(e+"Data").style.zIndex = 1;
		document.getElementById(e).unread = 0;
		this.props.activeTabHandler(e);
	}
	
	render(){
		let tabs = this.props.tabs;
		let tabarr = [];
		
		for (let i = 0; i < tabs.length; i++){
			tabarr.push(
				<span>
					<p onClick={this.activeTabHandler.bind(this, tabs[i].value)} id={tabs[i].value}>{tabs[i].value}</p>
					<span className="tabCloseButton" onClick={this.props.tabCloseHandler.bind(this, tabs[i].value)}><FontAwesome.FaClose size={15}/></span>
				</span>
			);
		}
		
		return (
			<div id="TabBarList">
				{tabarr}
			</div>
		)
	}
}

/*
class ChatTab extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value,
			target: props.target,
			activeTabHandler: props.activeTabHandler
		}
	}
	
	activeTab = (e)=>{
		var l = document.getElementsByClassName("ChatWindow");
		var tabs = document.getElementsByClassName("chatTab");
		for (let j = 0; j < tabs.length; j++) {
			tabs[j].style.backgroundColor = "darkslategray";
		}
		for (let i = 0; i < l.length; i++) {
			l[i].style.visibility = "hidden";
		}
		document.getElementById(this.state.value).style.backgroundColor = "lightgrey";
		document.getElementById(this.state.target).style.visibility = "visible";
		for (let j = 0; j < tabs.length; j++) {
			if (tabs[j].style.backgroundColor == "lightgrey") {
				this.state.activeTabHandler(j);
				break;
			}
		}
	}
	
	render() {
		return (
			<p onClick={this.activeTab} className="chatTab" id={this.state.value}>{this.state.value}</p>
		)
	}
}			   
				   
class ChatTabRenderer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTabHandler: props.activeTabHandler
					 };
	}
	
	render() {
		let t = this.props.tabs;
		let tA = [];
		for (let i = 0; i < t.length; i++) {
			tA.push(<TabName tabName={this.props.tabs[this.props.activeTab].value} tabs={this.props.tabs}/>)
		}
		return tA
	}
}				   
*/

class ChatWindowsRenderer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabs: props.tabs,
			playerSelect: props.playerSelect
		}
	}

	render() {
		var c = [];
		for (let i = 0; i < this.props.tabs.length; i++) {
			if (this.props.tabs[i].type != "draft") {
				c.push(<div className="ChatWindow" id={this.props.tabs[i].value+"Data"}>
				<Message data={this.props.tabs[i].messages} /*username={this.props.tabs[i].username}*//>
				</div>);
			} else if (this.props.tabs[i].type == "draft") {
				let cTeam = [<li>{this.props.tabs[i].challenger}</li>];
				let fTeam = [];
				let oTeam = [<li>{this.props.tabs[i].opponent}</li>];

				for (let j = 0; j < this.props.tabs[i].chalTeam.length; j++) {
					cTeam.push(<li>{this.props.tabs[i].chalTeam[j]}</li>);
				}
				for (let j = 0; j < this.props.tabs[i].freeTeam.length; j++) {
					fTeam.push(<li onDoubleClick={this.state.playerSelect.bind(this, this.props.tabs[i].freeTeam[j], this.props.tabs[i].value)}>{this.props.tabs[i].freeTeam[j]}</li>);
				}
				for (let j = 0; j < this.props.tabs[i].oppTeam.length; j++) {
					oTeam.push(<li>{this.props.tabs[i].oppTeam[j]}</li>);
				}

				c.push(<div className="ChatWindow" id={this.props.tabs[i].value+"Data"}>
						<div id="userColContainer">
							<div className="userCol" id={this.props.tabs[i].value+"ChallTeam"}>
								<p>{this.props.tabs[i].challenger}'s Team</p>
								<ul>
									{cTeam}
								</ul>
							</div>
							<div className="userCol" id={this.props.tabs[i].value+"FreeTeam"}>
								<p>Players</p>
								<ul>
									{fTeam}
								</ul>
							</div>
							<div className="userCol" id={this.props.tabs[i].value+"OppTeam"}>
								<p>{this.props.tabs[i].opponent}'s Team</p>
								<ul>
									{oTeam}
								</ul>
							</div>
						</div>
						<Message data={this.props.tabs[i].messages} /*username={this.props.tabs[i].username}*//>
						</div>);
			}
		}
		return <div id="ChatWindows">{c}</div>;
	}
}

class CurrentMatches extends Component {
	constructor(props) {
		super(props);
		this.state = {matches: props.matches, startTime: props.startTime}
	}
	
	render() {
		var arr = [];
		for (let i = 0; i < this.props.matches.length; i++) {
			arr.push(<li className="CurrentMatch">{this.props.matches[i].matchid}</li>)
		}
		return (
		<div className="CurrentMatches"><p id="CurrentMatchesHead">Current Matches - {this.props.matches.length}
		</p><div className="CurrentMatchesListContainer"><ul className="CurrentMatchesList">{arr}</ul></div></div>
		)
	}
}

class OpenMatches extends Component {
	constructor(props) {
		super(props);
		this.state = {matches: props.matches, startTime: props.startTime}
	}

	joinMatch(matchid) {
		this.props.joinMatch(matchid);
	}
	
	render() {
		var arr = [];
		for (let i = 0; i < this.props.matches.length; i++) {
			arr.push(<li className="OpenMatch" onDoubleClick={this.joinMatch.bind(this, this.props.matches[i].matchid)}>{this.props.matches[i].matchid} ({this.props.matches[i].freeTeam.length + this.props.matches[i].challengerTeam.length + this.props.matches[i].opponentTeam.length + 2}/10)</li>)
		}
		return (
		<div className="OpenMatches"><p id="OpenMatchesHead">Open Matches - {this.props.matches.length}
		</p><div className="OpenMatchesListContainer"><ul className="OpenMatchesList">{arr}</ul></div></div>
		)
	}
}

class ButtonsBar extends Component {
	constructor(props){
		super(props);
		this.ButtonsBarButtonClick = this.ButtonsBarButtonClick.bind(this);
	}

	ButtonsBarButtonClick(){
		document.getElementById("overlay").style.zIndex = 100;
	}

	ButtonsBarLogoutClick = ()=>{
		this.ButtonsBarButtonClick();
		document.getElementById("LogoutModal").style.zIndex = 101;
		document.getElementById("LogoutModal").style.display = "block";
	}

	ButtonsBarProfileClick = ()=>{
		this.ButtonsBarButtonClick()
		this.props.getUserDetails()
		document.getElementById("ProfileModal").style.zIndex = 101;
		document.getElementById("ProfileModal").style.display = "block";
	}

	ButtonsBarRoomsClick = ()=>{
		this.ButtonsBarButtonClick()
		document.getElementById("RoomsModal").style.zIndex = 101;
		document.getElementById("RoomsModal").style.display = "block";
	}

	ButtonsBarSettingsClick = ()=>{
		this.ButtonsBarButtonClick()
		document.getElementById("SettingsModal").style.zIndex = 101;
		document.getElementById("SettingsModal").style.display = "block";
	}

	render() {
		return (<div id="ButtonsBar">
		<div id="ButtonsBarFirst">
		<span className="ButtonsBar-ToolTip" title="Log Out"><div onClick={this.ButtonsBarLogoutClick} className="ButtonsBarButton" id="ButtonsBarLogOut"><FontAwesome.FaClose size={30}/>
		</div></span>
		<span className="ButtonsBar-ToolTip" title="View Profile"><div onClick={this.ButtonsBarProfileClick} className="ButtonsBarButton" id="ButtonsBarProfile"><FontAwesome.FaUser size={30}/>
		</div></span>
		</div>
		<div id="ButtonsBarSecond">
		<span className="ButtonsBar-ToolTip" title="Rooms"><div onClick={this.ButtonsBarRoomsClick} className="ButtonsBarButton" id="ButtonsBarRooms"><FontAwesome.FaColumns size={30}/>
		</div></span>
		<span className="ButtonsBar-ToolTip" title="Settings"><div onClick={this.ButtonsBarSettingsClick} className="ButtonsBarButton" id="ButtonsBarSettings"><FontAwesome.FaCog size={30}/>
		</div></span>
		</div>
		</div>);
	}
}

class LogoutModal extends Component {	
	yesClickHandler(e){
		e.preventDefault();
		fetch('/logout', {
			credentials: 'include'
		}).then(() => 
			window.location.reload()
		)
	}

	noClickHandler(){
		document.getElementById("overlay").style.zIndex = -100;
		document.getElementById("LogoutModal").style.zIndex = -101;
		document.getElementById("LogoutModal").style.display = "none";
	}

	render () {
		return (
			<div id="LogoutModal">
				<h1>Are you sure?</h1>
				
				<div class="option" onClick={this.yesClickHandler}>
					<p>Yes</p>
				</div>
				
				<div class="option" onClick={this.noClickHandler}>
					<p>No</p>
				</div>
			</div>			
		)
	}
}

class OtherUserModal extends Component {
	render() {
		return (
			<div id="OtherUserModal">
				<h1>Other User Profile</h1>
			</div>
		)
	}
}

class SettingsModal extends Component {
	render() {
		return (<div id="SettingsModal">
			<h1>Settings</h1>
		</div>)
	}
}

class ProfileModal extends Component {
	constructor(props){
		super(props);
	}

	render() {
		return (<div id="ProfileModal">
			<h1>Profile</h1>

			<div>
				<p>Wins: {this.props.wins}</p>
				<p>Loss: {this.props.loss}</p>
				<p>Draws: {this.props.draws}</p>
				<p>Total Score: {this.props.totalscore}</p>
			</div>
		</div>)
	}
}

class RoomsModal extends Component {
    constructor(props) {
        super(props);
		this.state = {joinFunc: this.props.joinFunc};
    }
	
	joinButtonClickHandler(e, b){
		this.state.joinFunc(e);
	}
	
	render() {
        var l = [];
        for (let i = 0; i < this.props.roomsList.length; i++) {
            l.push(<tr><td>{this.props.roomsList[i].roomName}</td><td>{this.props.roomsList[i].numberOfPlayers}</td>
			<td className="roomJoinButton" onClick={this.joinButtonClickHandler.bind(this, this.props.roomsList[i].roomName)}>{<FontAwesome.FaPlus size="30" />}</td></tr>);
        }
        
		return (
            <div id="RoomsModal">
                <h1>Rooms</h1>
                <div id="RoomsContainer">
                    <table id="RoomsTable">
						<tbody>
							<tr>
								<th>Room Name</th>
								<th>Players</th>
								<th>Join</th>
							</tr>
							{l}
						</tbody>
                    </table>
                </div>
            </div>
        )
	}
}

class Info extends Component {
	constructor(props) {
		super(props);
	}

	startGameButtonClick = (id, r)=>{
		this.props.startGame(id, r);
	}

	render() {
		let u = this.props.username;
		let i = this.props.info;
		let m = "";
		let s, b;
		let start = this.props.startButtonStatus;
		
		if (this.props.check == 1) {
			if (i[u].status == 0) {
				m = "not in any match.";
			} else if (i[u].status == 1) {
				m = "signed up for a match.";
			} else if (i[u].status == 1) {
				m = "playing in a match.";
			}
			s = <p>You are currently {m}</p>;
		} else {
			s = <p>You are currently </p>;
		}

		if (start != undefined) {
			b = <div id="StartGameButton" onClick={this.startGameButtonClick.bind(this, this.props.startButtonStatus.id, this.props.startButtonStatus.r)}>Start Game</div>;
		}

		return(<div id="info">{s}<br></br>{b}</div>);
	}
}

class Challenge extends Component {
	constructor(props){
		super(props);
		this.state = {p: ""};
	}

	componentDidMount() {
		socket.on("challengeError", (u)=>{
			this.setState({p: u});
			document.getElementById("overlay").style.zIndex = 100;
			document.getElementById("ChallengeModal").style.zIndex = 101;
			document.getElementById("ChallengeModal").style.display = "block";
		});

		socket.on("startGameError", (u)=>{
			this.setState({p: u});
			document.getElementById("overlay").style.zIndex = 100;
			document.getElementById("ChallengeModal").style.zIndex = 101;
			document.getElementById("ChallengeModal").style.display = "block";
		});
	}

	render() {
		return (<div id="ChallengeModal">
			<h3>{this.state.p}</h3>
		</div>)
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			infoCheck: 0,
			tabs: [],
			tabsNameList: [],
			activeTab: 0,
			currentMatches: [/*{matchID: "shahmir vs pasha123", startTime: new Date().toLocaleTimeString()}*/],
            openMatches: [/*{matchID: "shahmir vs pashaadsadasdadasdsad", numberofPlayers: 5}*/],
			roomsList: [],
			info: {}
		}

		this.sendMessage = this.sendMessage.bind(this);
		this.updatechat = this.updatechat.bind(this);
		//this.connect = this.connect.bind(this);
		this.newTab = this.newTab.bind(this);
		this.tabClose = this.tabClose.bind(this);
		this.columnContainerContextMenu = this.columnContainerContextMenu.bind(this);
	}
	
	componentDidMount(){
		if (sent == 0) {
			fetch('/api/user', {
				credentials: 'include'
			})
			.then(res => {
				res.json().then(user => {
					this.setState({username: user.u}, ()=>{socket.emit('adduser', this.state.username)});
				});
			});
			sent = 1;
		}
		// socket.on('connect', this.connect);
		socket.on('updatechat', this.updatechat);
		socket.on('roomslist', this.roomslist);
		socket.on('userInfo', this.userInfo);
		socket.on('userInfoUpdate', this.userInfoUpdate);
		socket.on('updateUserList', this.updateUserList);
		socket.on('userProfile', this.updateUserProfile);
		socket.on('openMatches', this.updateOpenMatches);
		socket.on('currentMatches', this.updateCurrentMatches);
		socket.on('startButton', this.startButtonEvent);
		socket.on('draftOpen', this.startDraft);
	}

	startDraft = (args)=>{
		let id = args.i;
		let room = args.roomName;
		let t = args.type;
		let d = args.matchData;
		let cTeam = [d.challengerTeam];
		let oTeam = [d.opponentTeam];

		if (this.state.tabsNameList.indexOf(id) == -1 && t == 'draft') {
			this.state.tabs.push({value: id, messages: [], users: [], challenger: d.challenger, opponent: d.opponent, openMatches: [], currentMatches: [], type: 'draft', freeTeam: d.freeTeam, chalTeam: cTeam, oppTeam: oTeam});
			this.state.tabsNameList.push(id);
			this.setActiveTab(id);
			this.forceUpdate();
		}
	}

	startButtonEvent = (match, room)=>{
		this.setState({startButtonStatus: {id: match, r: room}});
	}

	updateCurrentMatches = (obj, r)=>{
		console.log("CURRENT", obj, r);
		for (let i = 0; i < obj.length; i++) {
			if (this.state.tabsNameList.indexOf(obj[i].matchid) != -1) {
				this.state.tabs[this.state.tabsNameList.indexOf(obj[i].matchid)].chalTeam = obj[i].challengerTeam;
				this.state.tabs[this.state.tabsNameList.indexOf(obj[i].matchid)].freeTeam = obj[i].freeTeam;
				this.state.tabs[this.state.tabsNameList.indexOf(obj[i].matchid)].oppTeam = obj[i].opponentTeam;
				this.forceUpdate();
			}
		}
		if (this.state.tabsNameList.indexOf(r) != -1) {
			this.state.tabs[this.state.tabsNameList.indexOf(r)].currentMatches = obj;
			if (this.state.activeTab == r) {
				this.setActiveTab(r);
			}
		}
	}

	updateUserProfile = (obj) => {
		console.log("userProfile", obj);
		this.state.wins = obj.wins;
		this.state.loss = obj.loss;
		this.state.draws = obj.draws;
		this.state.totalscore = obj.totalscore;
		this.forceUpdate();
	}

	getUserDetails = (u) => {
		socket.emit('getProfile', u);
	}
	
	updateOpenMatches = (obj, r)=>{
		console.log(obj, r);
		for (let i = 0; i < obj.length; i++) {
			if (this.state.tabsNameList.indexOf(obj[i].matchid) != -1) {
				this.state.tabs[this.state.tabsNameList.indexOf(obj[i].matchid)].chalTeam = obj[i].challengerTeam;
				this.state.tabs[this.state.tabsNameList.indexOf(obj[i].matchid)].freeTeam = obj[i].freeTeam;
				this.state.tabs[this.state.tabsNameList.indexOf(obj[i].matchid)].oppTeam = obj[i].opponentTeam;
				this.forceUpdate();
			}
		}
		if (this.state.tabsNameList.indexOf(r) != -1) {
			this.state.tabs[this.state.tabsNameList.indexOf(r)].openMatches = obj;
			if (this.state.activeTab == r) {
				this.setActiveTab(r);
			}
		}
	}

	userInfo = (u)=>{
		this.setState({info: u});
		this.setState({infoCheck: 1});
		this.forceUpdate();
	}

	userInfoUpdate = (u, i)=>{
		this.state.info.u = i;
		this.forceUpdate();
	}
	
	roomslist = (rooms)=>{
		this.setState({roomsList: rooms});
	}

	// connect(){
	// 	var name = prompt("Enter username");
	// 	this.state.username = name;
	// 	socket.emit('adduser', name);
	// }

	updatechat(data){
		console.log("MESSAGE", data);
		const data_new = {
			username: data.username,
			message: data.message,
			type: data.type,
			time: new Date().toLocaleTimeString(),
			opp: data.opp
		}
		
		if (this.state.tabsNameList.indexOf(data.room) != -1) {
			if (data.room != this.state.activeTab) {
				document.getElementById(data.room).style.backgroundColor = "#F1C40F";
				document.getElementById(data.room).unread = 1;
			}
			this.state.tabs[this.state.tabsNameList.indexOf(data.room)].messages.push(data_new);
			this.forceUpdate();
		} else if (data.type == 'pm') {
			this.newTabPM(data.username);
			if (data.room != this.state.activeTab) {
				document.getElementById(data.room).style.backgroundColor = "#F1C40F";
				document.getElementById(data.room).unread = 1;
			}
			this.state.tabs[this.state.tabsNameList.indexOf(data.room)].messages.push(data_new);
			this.forceUpdate();
		}
	}

	sendMessage = (e)=>{
		if (e.keyCode == 13) {
			var data = document.getElementById('chatBox').value;
			
			socket.emit('chat', {room: this.state.activeTab, message: data});
			document.getElementById('chatBox').value = '';
		}
	}
	
	columnContainerContextMenu(e) {
		e.persist();
		if (e.target.classList.value != "rightClickMenu" && e.target.classList.value != "rightClickMenuItem") {
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}
	}
	
	updateUserList = (list, room)=>{
		if (this.state.tabsNameList.indexOf(room) != -1) {
			this.state.tabs[this.state.tabsNameList.indexOf(room)].users = list;
			if (this.state.activeTab == room) {
				this.setActiveTab(room);	
			}
		}
	}
	
	newTab(e) {
		console.log(e);
		if (this.state.tabsNameList.indexOf(e) == -1) {
			socket.emit("roomJoin", e);
			this.state.tabs.push({value: e, messages: [], users: [], openMatches: [], currentMatches: []});
			this.state.tabsNameList.push(e);
			this.setActiveTab(e);
			this.forceUpdate();
		}
	}

	newTabPM(e) {
		if (this.state.tabsNameList.indexOf(e) == -1 ) {
			this.state.tabs.push({value: e, messages: [], users: [], currentMatches: []});
			this.state.tabsNameList.push(e);
			this.setActiveTab(e);
			this.forceUpdate();
		}
	}

	tabClose(e) {
		console.log(e);
		// console.log(this.state.tabsNameList.indexOf(e));
		if (this.state.tabsNameList.indexOf(e) != -1 ) {
			socket.emit("roomLeave", e);
			var index = this.state.tabsNameList.indexOf(e);
			this.state.tabs.splice(index, 1);
			this.state.tabsNameList.splice(index, 1);
			this.forceUpdate();
		}
	}
	
	setActiveTab = (e)=>{
		this.setState({activeTab: e}, function() {
			this.setState({users: this.state.tabs[this.state.tabsNameList.indexOf(this.state.activeTab)].users}, function(){
				this.setState({openMatches: this.state.tabs[this.state.tabsNameList.indexOf(this.state.activeTab)].openMatches}, function() {
					this.setState({currentMatches: this.state.tabs[this.state.tabsNameList.indexOf(this.state.activeTab)].currentMatches});
					document.getElementsByClassName("rightClickMenu")[0].currentRoom = e;
				});
			});
		});
	}
	
	leftColumnButtonClick() {
		if (document.getElementById("leftColumn").visibleState != 1) {
			document.getElementById("leftColumn").style.width = "35%";
			document.getElementById("leftColumn").visibleState = 1;
		} else {
			document.getElementById("leftColumn").style.width = "0%";
			document.getElementById("leftColumn").visibleState = 0;
		}
	}
	
	rightColumnButtonClick() {
		if (document.getElementById("rightColumn").visibleState != 1) {
			document.getElementById("rightColumn").style.width = "35%";
			document.getElementById("rightColumn").style.left = "65%";
			document.getElementById("rightColumn").style.display = "initial";
			document.getElementById("rightColumn").visibleState = 1;
		} else {
			document.getElementById("rightColumn").style.width = "0%";
			document.getElementById("rightColumn").style.left = "65%";
			document.getElementById("rightColumn").style.display = "none";
			document.getElementById("rightColumn").visibleState = 0;
		}
		
	}

	overlayClick(){
		document.getElementById("overlay").style.zIndex = -100;
		document.getElementById("LogoutModal").style.zIndex = -101;
		document.getElementById("LogoutModal").style.display = "none";
		document.getElementById("SettingsModal").style.zIndex = -101;
		document.getElementById("SettingsModal").style.display = "none";
		document.getElementById("ProfileModal").style.zIndex = -101;
		document.getElementById("ProfileModal").style.display = "none";
		document.getElementById("RoomsModal").style.zIndex = -101;
		document.getElementById("RoomsModal").style.display = "none";
		document.getElementById("OtherUserModal").style.zIndex = -101;
		document.getElementById("OtherUserModal").style.display = "none";
		document.getElementById("ChallengeModal").style.zIndex = -101;
		document.getElementById("ChallengeModal").style.display = "none";
	}
	
	messageUser = (e)=>{
		if (this.state.tabsNameList.indexOf(e) == -1) {
			this.state.tabs.push({value: e, messages: [], users: [e, this.state.username]});
			this.state.tabsNameList.push(e);
		}
		this.setActiveTab(e);
		this.forceUpdate();
	}

	startGame = (id, r)=>{
		socket.emit('startGame', id, r);
	}

	joinMatch = (match)=>{
		socket.emit('joinMatch', match, document.getElementsByClassName('rightClickMenu')[0].currentRoom);
	}

	playerSelect = (player, id)=>{
		socket.emit('playerSelect', player, id);
	}
	
	render() {
		return (
			<div onClick={this.columnContainerContextMenu} className="columnContainer">
				<div id="overlay" onClick={this.overlayClick}></div>
				<div id="leftColumnButton" onClick={this.leftColumnButtonClick}>
					<FontAwesome.FaBars size="28" color="white" />
				</div>
				<Challenge />
				<LogoutModal />
				<SettingsModal />
				<RoomsModal roomsList={this.state.roomsList} joinFunc={this.newTab}/>
				<ProfileModal wins={this.state.wins} loss={this.state.loss} draws={this.state.draws} totalscore={this.state.totalscore}/>
				<OtherUserModal />
				<div id="leftColumn">
					<OnlinePlayers users={this.state.users.length} />
					<PlayersList users={this.state.users} />
					<RightClickMenu newtab={this.newTab} messageUser={this.messageUser} getUserDetails={this.getUserDetails}/>
					<ButtonsBar getUserDetails={this.getUserDetails.bind(this, this.state.username)}/>
				</div>
				<div id="middleColumn">
					<div id="tabBar">
						<TabName tabs={this.state.tabs} activeTabHandler={this.setActiveTab} tabCloseHandler={this.tabClose}/>
						{/*<ChatTabRenderer tabs={this.state.tabs} activeTabHandler={this.activeTabHandler}/>*/}
					</div>
					<ChatWindowsRenderer playerSelect={this.playerSelect} tabs={this.state.tabs} matchesData={this.state.openMatches}/>
					<input type="text" id="chatBox" placeholder="Message" onKeyDown={this.sendMessage}></input>
						{/*
					<button onClick={this.newTab} type="button" id="chatButton">Send</button>
						*/}
				</div>
				<div id="rightColumn">
					<CurrentMatches matches={this.state.currentMatches} /><br></br>
					<OpenMatches matches={this.state.openMatches} joinMatch={this.joinMatch}/><br></br>
					<Info startButtonStatus={this.state.startButtonStatus} startGame={this.startGame} info={this.state.info} username={this.state.username} check={this.state.infoCheck}/>
				</div>
				<div id="rightColumnButton" onClick={this.rightColumnButtonClick}>
					<FontAwesome.FaBars size="28" color="white" />
				</div>
			</div>
		);
	}
}

export {App};