import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import openSocket from 'socket.io-client';

var q = "https://d30y9cdsu7xlg0.cloudfront.net/png/45447-200.png";

const socket = openSocket("http://localhost:4000");

function Message(props) {
	var c = [];
	for (let i = 0; i < props.data.length; i++) {
		c.push(<div className="message"><p className="userNames">{props.data[i].username}: </p>{props.data[i].message}<p class="messageTime">Time: {props.data[i][1]}</p></div>);
	}
	return c;
}

function OnlinePlayers(props) {
	return <p id="playersListHead">Online - {props.users}</p>;
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
	}
	
	render() {
		var i = ["Profile", "Message", "Ignore"];
		var iFunctions = [];
		iFunctions[0] = function(){
			console.log("Profile");
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}
		iFunctions[1] = function(){
			console.log("Message");
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		}
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
		return (<div className="CurrentMatches"><p id="CurrentMatchesHead">Current Matches - {this.state.matches.length}</p><ul className="CurrentMatchesList">{arr}</ul></div>)
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
		return (<div className="OpenMatches"><p id="OpenMatchesHead">Open Matches - {this.state.matches.length}</p><ul className="OpenMatchesList">{arr}</ul></div>)
	}
}


class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			defaultChat: "Default",
			tabs: [{value: "Default", messages: [], username: 'faust'}],
			activeTab: 0,
			currentMatches: [{matchID: "asd", startTime: new Date().toLocaleTimeString()}]
		}

		this.sendMessage = this.sendMessage.bind(this);
		this.updatechat = this.updatechat.bind(this);
		this.connect = this.connect.bind(this);
		this.adduser = this.adduser.bind(this);
	}
	
	componentDidMount(){
		console.log('mounted');
		socket.on('connect', this.connect);
		socket.on('adduser', this.adduser);
		socket.on('updatechat', this.updatechat);
	}

	adduser(users){
		console.log(users);
		this.state.users = users;
		console.log(this.state.users);

		this.forceUpdate();
	}

	connect(){
		var name = prompt("Enter username");
		socket.emit('adduser', name);
		this.state.tabs[this.state.activeTab].username = name;
	}

	updatechat(data){
		console.log("User: " + data.username);
		console.log("Message: " + data.message);
		
		// var data_new = [data.message, new Date().toLocaleTimeString()];
		this.state.tabs[this.state.activeTab].messages.push(data)
		// var currentMessages = [...this.state.tabs[this.state.activeTab].messages, data_new];
		// this.state.tabs[this.state.activeTab].messages = currentMessages;
		this.forceUpdate();
	}

	sendMessage = (e)=>{
		if (e.keyCode == 13) {
			var data = document.getElementById('chatBox').value;
			// data = [data, new Date().toLocaleTimeString()];
			
			socket.emit('chat', {message: data});
			document.getElementById('chatBox').value = '';

			// var currentMessages = [...this.state.tabs[this.state.activeTab].messages, data];
			// this.state.tabs[this.state.activeTab].messages = currentMessages;
			// document.getElementById('chatBox').value = '';
			// this.forceUpdate();
		}
	}
	
	columnContainerContextMenu(e) {
		e.persist();
		if (e.target.classList.value != "rightClickMenu" && e.target.classList.value != "rightClickMenuItem") {
			document.getElementsByClassName("rightClickMenu")[0].style.visibility = "hidden";
		};
	}
	
	newTab = (e)=> {
		let l = this.state.tabs.length;
		this.state.tabs.push({value: "Default" + l, messages: [], username: 'faust'+l});
		this.activeTabHandler(l);
		this.forceUpdate();
	}
	
	activeTabHandler = (e) => {
		this.state.activeTab = e;
	}
	
	render() {
		return (
			<div onClick={this.columnContainerContextMenu} className="columnContainer">
				<div id="leftColumn">
					<OnlinePlayers users={this.state.users.length} />
					<PlayersList users={this.state.users} />
					<RightClickMenu />
				</div>
				<div id="middleColumn">
					<div id="tabBar">
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
			</div>
		);
	}
}

export {App};
