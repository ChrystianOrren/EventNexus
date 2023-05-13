import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Modal from 'react-modal';

Modal.setAppElement('#root');
//require("dotenv").config();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
