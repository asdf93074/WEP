import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import registerServiceWorker from './registerServiceWorker';

fetch('/api/user', {
    credentials: 'include'
})
.then(res => {
    res.json().then(user => {
        if (user.u != undefined) {
            ReactDOM.render(<App />, document.getElementById('root'));
        } else {
            window.location = "http://localhost:3001/login";
        }
    });
});

registerServiceWorker();