import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
//import io from 'socket.io-client';
//const socket = io('http://localhost:8000');

function Message(props) {
	var c = [];
	for (let i = 0; i < props.data.length; i++) {
		c.push(<div className="message"><p className="userNames">{props.username}</p>{": " + props.data[i]}</div>);
	}
	return c;
}

function OnlinePlayers(props) {
	return <p id="playersListHead">Players List: {props.users} Online</p>;
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
	constructor(props) {
		super(props);
		this.state = {users: props.users};
	}
	
	rightClickHandler(e) {
		e.persist();
		e.preventDefault();
		document.getElementsByClassName("rightClickMenu")[0].style.visibility = "visible";
		if (e.clientX + document.getElementsByClassName("rightClickMenu")[0].style.width > window.innerWidth) {
			alert();
		}
		document.getElementsByClassName("rightClickMenu")[0].style.left = e.clientX - document.getElementsByClassName("rightClickMenu")[0].parentElement.offsetLeft + "px";
		document.getElementsByClassName("rightClickMenu")[0].style.top = e.clientY + "px";
	}
	
	render() {
		var c = [];

		for (let i = 0; i < this.state.users.length; i++) {
			c.push(<p onContextMenu={this.rightClickHandler} className="playersListUserNames">{this.state.users[i]}</p>);
		}
		return c;
	}
}			   

class ChatTab extends Component {
	constructor(props) {
		super(props);
		console.log(props.activeTabHandler);
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
							<Message data={this.state.tabs[i].messages} username={this.state.tabs[i].username}/>
						</div>)
		}
		return <div id="ChatWindows">{c}</div>;
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			users: ["asdf93074", "asdf1234", "asdf3456", "fdej893rj", "asdf93074", "asdf1234", "asdf3456", "fdej893rj", "asdf93074", "asdf1234", "asdf3456", "fdej893rj"
				   , "asdf93074", "asdf1234", "asdf3456", "fdej893rj", "asdf93074", "asdf1234", "asdf3456", "fdej893rj", "asdf93074", "asdf1234", "asdf3456", "fdej893rj"],
			defaultChat: "Default",
			tabs: [{value: "Default", messages: [], username: 'faust'}],
			activeTab: 0
		}
	}
	
	sendMessage = (e)=>{
		if (e.keyCode == 13) {
			var data = document.getElementById('chatBox').value;
			var currentMessages = [...this.state.tabs[this.state.activeTab].messages, data];
			this.state.tabs[this.state.activeTab].messages = currentMessages;
			document.getElementById('chatBox').value = '';
			this.forceUpdate();
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
		this.state.tabs.push({value: "Default" + l, messages: this.state.tabs[0].messages, username: 'faust'+l});
		this.activeTabHandler(l);
		this.forceUpdate();
	}
	
	activeTabHandler = (e) => {
		this.state.activeTab = e;
	}
	
	render() {
		return (
			<div onClick={this.columnContainerContextMenu} className="columnContainer">
				<div id="leftColumn"></div>
				<div id="middleColumn">
					<div id="tabBar">
						<ChatTabRenderer tabs={this.state.tabs} activeTabHandler={this.activeTabHandler}/>
					</div>
					<ChatWindowsRenderer tabs={this.state.tabs} />
					<input type="text" id="chatBox" placeholder="Message" onKeyDown={this.sendMessage}></input>
					<button onClick={this.newTab} type="button" id="chatButton">Send</button>
				</div>
				<div id="rightColumn">
					<OnlinePlayers users={this.state.users.length} />
					<PlayersList users={this.state.users} />
					<RightClickMenu />
				</div>
			</div>
		);
	}
}

export {App};
