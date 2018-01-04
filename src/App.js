import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import openSocket from 'socket.io-client';
import * as FontAwesome from 'react-icons/lib/fa';

var q = "https://d30y9cdsu7xlg0.cloudfront.net/png/45447-200.png";

const socket = openSocket("http://localhost:4000");

function Message(props) {
	var c = [];
	for (let i = 0; i < props.data.length; i++) {
		if (props.data[i].type == 'notice') {
			c.push(<div className="messageNotice"><p className="notice">{props.data[i].message}</p></div>);
		} else if (props.data[i].type == 'challengeNotice'){
			console.log(props.data[i]);
			c.push(<div className="messageNotice"><p className="notice">[PRIVATE] {props.data[i].message}
			<span onClick={()=>{socket.emit("challengeAccept", props.data[i].opp)}}><p className="noticeOptions" id="noticeOptionAccept">Accept</p></span>
			/<span onClick={()=>{socket.emit("challengeReject", props.data[i].opp)}}><p className="noticeOptions" id="noticeOptionDecline">Decline</p></span></p></div>);
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
			socket.emit("challenge", document.getElementsByClassName("rightClickMenu")[0].currentTarget);
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
			tabarr.push(<p onClick={this.activeTabHandler.bind(this, tabs[i].value)} id={tabs[i].value}>{tabs[i].value}</p>);
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
			tabs: props.tabs
		}
	}

	render() {
		var c = [];
		for (let i = 0; i < this.state.tabs.length; i++) {
			c.push(<div className="ChatWindow" id={this.state.tabs[i].value+"Data"}>
							<Message data={this.state.tabs[i].messages} /*username={this.state.tabs[i].username}*//>
						</div>)
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
		for (let i = 0; i < this.state.matches.length; i++) {
			arr.push(<li className="CurrentMatch">{this.state.matches[i].matchID}</li>)
		}
		return (
		<div className="CurrentMatches"><p id="CurrentMatchesHead">Current Matches - {this.state.matches.length}
		</p><div className="CurrentMatchesListContainer"><ul className="CurrentMatchesList">{arr}</ul></div></div>
		)
	}
}

class OpenMatches extends Component {
	constructor(props) {
		super(props);
		this.state = {matches: props.matches, startTime: props.startTime}
	}
	
	render() {
		var arr = [];
		for (let i = 0; i < this.state.matches.length; i++) {
			arr.push(<li className="OpenMatch">{this.state.matches[i].matchID}</li>)
		}
		return (
		<div className="OpenMatches"><p id="OpenMatchesHead">Open Matches - {this.state.matches.length}
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

	ButtonsBarProfileClick = ()=>{
		this.ButtonsBarButtonClick()
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
		<span className="ButtonsBar-ToolTip" title="Log Out"><div onClick={this.ButtonsBarButtonClick} className="ButtonsBarButton" id="ButtonsBarLogOut"><FontAwesome.FaClose size={30}/>
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
	render() {
		return (<div id="ProfileModal">
			<h1>Profile</h1>
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

	render() {
		let u = this.props.username;
		let i = this.props.info;
		let m = "";
		let s;
		
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

		return(<div id="info">{s}<br></br>
		<div id="StartGameButton">Start Game</div>
		</div>);
	}
}

class Challenge extends Component {
	constructor(props){
		super(props);
		this.state = {p: ""};
	}

	componentDidMount() {
		socket.on("challengeError", (u)=>{
			console.log(u);
			this.setState({p: u});
			document.getElementById("overlay").style.zIndex = 100;
			document.getElementById("ChallengeModal").style.zIndex = 101;
			document.getElementById("ChallengeModal").style.display = "block";
		})
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
		this.connect = this.connect.bind(this);
		this.newTab = this.newTab.bind(this);
		this.columnContainerContextMenu = this.columnContainerContextMenu.bind(this);
	}
	
	componentDidMount(){
		socket.on('connect', this.connect);
		socket.on('updatechat', this.updatechat);
		socket.on('roomslist', this.roomslist);
		socket.on('userInfo', this.userInfo);
		socket.on('userInfoUpdate', this.userInfoUpdate);
		socket.on('updateUserList', this.updateUserList);
		socket.on('openMatches', this.updateOpenMatches);
	}

	updateOpenMatches = (obj)=>{
		console.log(obj);
		this.setState({openMatches: obj});
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

	connect(){
		var name = prompt("Enter username");
		this.state.username = name;
		socket.emit('adduser', name);
	}

	updatechat(data){
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
		this.state.tabs[this.state.tabsNameList.indexOf(room)].users = list;
		if (this.state.activeTab == room) {
			this.setActiveTab(room);	
		}
	}
	
	newTab(e) {
		if (this.state.tabsNameList.indexOf(e) == -1) {
			socket.emit("roomJoin", e);
			this.state.tabs.push({value: e, messages: [], users: []});
			this.state.tabsNameList.push(e);
			this.setActiveTab(e);
			this.forceUpdate();
		}
	}

	newTabPM(e) {
		if (this.state.tabsNameList.indexOf(e) == -1 ) {
			this.state.tabs.push({value: e, messages: [], users: []});
			this.state.tabsNameList.push(e);
			this.setActiveTab(e);
			this.forceUpdate();
		}
	}
	
	setActiveTab = (e)=>{
		this.setState({activeTab: e}, function() {
			this.setState({users: this.state.tabs[this.state.tabsNameList.indexOf(this.state.activeTab)].users});
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

	startNewGame = ()=>{
		if (this.state.userInfo[this.state.username].status == 0) {
			socket.emit("newMatch");
		}
	}

	render() {
		return (
			<div onClick={this.columnContainerContextMenu} className="columnContainer">
				<div id="overlay" onClick={this.overlayClick}></div>
				<div id="leftColumnButton" onClick={this.leftColumnButtonClick}>
					<FontAwesome.FaBars size="28" color="white" />
				</div>
				<Challenge />
				<SettingsModal />
				<RoomsModal roomsList={this.state.roomsList} joinFunc={this.newTab}/>
				<ProfileModal />
				<OtherUserModal />
				<div id="leftColumn">
					<OnlinePlayers users={this.state.users.length} />
					<PlayersList users={this.state.users} />
					<RightClickMenu newtab={this.newTab} messageUser={this.messageUser}/>
					<ButtonsBar />
				</div>
				<div id="middleColumn">
					<div id="tabBar">
						<TabName tabs={this.state.tabs} activeTabHandler={this.setActiveTab} />
						{/*<ChatTabRenderer tabs={this.state.tabs} activeTabHandler={this.activeTabHandler}/>*/}
					</div>
					<ChatWindowsRenderer tabs={this.state.tabs} />
					<input type="text" id="chatBox" placeholder="Message" onKeyDown={this.sendMessage}></input>
						{/*
					<button onClick={this.newTab} type="button" id="chatButton">Send</button>
						*/}
				</div>
				<div id="rightColumn">
					<CurrentMatches matches={this.state.currentMatches} /><br></br>
					<OpenMatches matches={this.state.openMatches} /><br></br>
					<Info startNewGame={this.startNewGame} info={this.state.info} username={this.state.username} check={this.state.infoCheck}/>
				</div>
				<div id="rightColumnButton" onClick={this.rightColumnButtonClick}>
					<FontAwesome.FaBars size="28" color="white" />
				</div>
			</div>
		);
	}
}

export {App};
