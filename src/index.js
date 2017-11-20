import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

//document.getElementById('chatBox').addEventListener("keypress", (e)=>{
//	if (e.keyCode == 13) {
//		var data = document.getElementById('chatBox').value;
//		
//		document.getElementById('chatBox').value = '';
//	}
//})

registerServiceWorker();