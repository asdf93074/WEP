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
		c.push(<div className="message"><p className="userNames">{props.data[i].username}: </p>{props.data[i].message}<p class="messageTime">Time: {props.data[i].time}</p></div>);
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
	// constructor(props) {
	// 	super(props);
	// }
	
	render() {
		console.log(this.props.newtab);
		var i = ["Profile", "Message", "Ignore"];
		var iFunctions = [];
		iFunctions[0] = this.props.selectuser;

		iFunctions[1] = this.props.newtab;
		
		iFunctions[2] = function(){
			console.log("Ignore");
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
		
		this.state = {
			name: this.props.tabName,
			tabs: this.props.tabs
		};
	}
	
	render(){
		let tabs = this.state.tabs;
		let tabarr = [];
		
		for (let i = 0; i < tabs.length; i++){
			tabarr.push(<p id={tabs[i].value}>{tabs[i].value}</p>);
		}
		
		return (
			<div id="TabBarList">
				{tabarr}
			</div>
		)
	}
}

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
			tabs: props.tabs,
			activeTabHandler: props.activeTabHandler
					 };
	}
	
	render() {
		let t = this.state.tabs;
		let tA = [];
		for (let i = 0; i < t.length; i++) {
			tA.push(<ChatTab activeTabHandler={this.state.activeTabHandler} value={t[i].value} target={t[i].value + "Data"} />)
		}
		return tA
	}
}				   

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
		<span class="ButtonsBar-ToolTip" title="Log Out"><div onClick={this.ButtonsBarButtonClick} class="ButtonsBarButton" id="ButtonsBarLogOut"><FontAwesome.FaClose size={30}/>
		</div></span>
		<span class="ButtonsBar-ToolTip" title="View Profile"><div onClick={this.ButtonsBarProfileClick} class="ButtonsBarButton" id="ButtonsBarProfile"><FontAwesome.FaUser size={30}/>
		</div></span>
		</div>
		<div id="ButtonsBarSecond">
		<span class="ButtonsBar-ToolTip" title="Rooms"><div onClick={this.ButtonsBarRoomsClick} class="ButtonsBarButton" id="ButtonsBarRooms"><FontAwesome.FaColumns size={30}/>
		</div></span>
		<span class="ButtonsBar-ToolTip" title="Settings"><div onClick={this.ButtonsBarSettingsClick} class="ButtonsBarButton" id="ButtonsBarSettings"><FontAwesome.FaCog size={30}/>
		</div></span>
		</div>
		</div>);
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
	render() {
		return (<div id="RoomsModal">
			<h1>Rooms</h1>
		</div>)
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			defaultChat: "Default",
			tabs: [{value: "Default", messages: []}],
			activeTab: 0,
			currentMatches: [{matchID: "shahmir vs pasha123", startTime: new Date().toLocaleTimeString()}]
		}

		this.sendMessage = this.sendMessage.bind(this);
		this.updatechat = this.updatechat.bind(this);
		this.connect = this.connect.bind(this);
		this.adduser = this.adduser.bind(this);
		this.newTab = this.newTab.bind(this);
		this.selectUserProfile = this.selectUserProfile.bind(this);
		this.columnContainerContextMenu = this.columnContainerContextMenu.bind(this);
	}
	
	componentDidMount(){
		console.log('mounted');
		socket.on('connect', this.connect);
		socket.on('adduser', this.adduser);
		socket.on('updatechat', this.updatechat);
		socket.on('roomslist', this.roomslist);
	}

	adduser(users){
		console.log(users);
		this.state.users = users;
		console.log(this.state.users);

		this.forceUpdate();
	}
	
	roomslist(rooms){
		console.log(rooms);
		
	}

	connect(){
		var name = prompt("Enter username");
		socket.emit('adduser', name);
		this.state.tabs[this.state.activeTab].username = name;
	}

	updatechat(data){
		console.log("User: " + data.username);
		console.log("Message: " + data.message);
		
		const data_new = {
			username: data.username,
			message: data.message,
			time: new Date().toLocaleTimeString()
		}

		this.state.tabs[this.state.activeTab].messages.push(data_new);
		this.forceUpdate();
	}

	sendMessage = (e)=>{
		if (e.keyCode == 13) {
			var data = document.getElementById('chatBox').value;
			
			socket.emit('chat', {message: data});
			document.getElementById('chatBox').value = '';
		}
	}
	
	columnContainerContextMenu(e) {
		e.persist();
		console.log(e.target.id);
		if (e.target.classList.value != "rightClickMenu" && e.target.classList.value != "rightClickMenuItem") {
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}
	}
	
	newTab(e){
		console.log("ASDASDFASDF");
		// console.log(e);
		
		let l = this.state.tabs.length;
		this.state.tabs.push({value: "Default" + l, messages: [], username: 'faust'+l});
		document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		this.activeTabHandler(l);
		this.forceUpdate();
	}

	selectUserProfile(){
		console.log("changing to block");
		let modal = document.getElementById("userModal");
		modal.style.display = "block";
		document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
	}
	
	activeTabHandler = (e) => {
		this.state.activeTab = e;
		console.log(this.state.tabs);
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
	}
	
	render() {
		return (
			<div onClick={this.columnContainerContextMenu} className="columnContainer">
				<div id="overlay" onClick={this.overlayClick}></div>
				<div id="leftColumnButton" onClick={this.leftColumnButtonClick}>
					<FontAwesome.FaBars size="28" color="white" />
				</div>
				<SettingsModal />
				<RoomsModal />
				<ProfileModal />
				<div id="leftColumn">
					<OnlinePlayers users={this.state.users.length} />
					<PlayersList users={this.state.users} />
					<RightClickMenu newtab={this.newTab} selectuser={this.selectUserProfile}/>
					<ButtonsBar />
				</div>
				<div id="middleColumn">
					<div id="tabBar">
						<TabName tabName={this.state.tabs[this.state.activeTab].value} tabs={this.state.tabs}/>
					{/*<ChatTabRenderer tabs={this.state.tabs} activeTabHandler={this.activeTabHandler}/>*/}
					</div>
					<ChatWindowsRenderer tabs={this.state.tabs} />
					<input type="text" id="chatBox" placeholder="Message" onKeyDown={this.sendMessage}></input>
						{/*
					<button onClick={this.newTab} type="button" id="chatButton">Send</button>
						*/}
				</div>
				<div id="rightColumn">
					<CurrentMatches matches={this.state.currentMatches}/>
					<OpenMatches matches={this.state.currentMatches}/>
				</div>
				<div id="rightColumnButton" onClick={this.rightColumnButtonClick}>
					<FontAwesome.FaBars size="28" color="white" />
				</div>
			</div>
		);
	}
}

export {App};
