
import './index.css';
import './App.css';
import { io } from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './components/AppRouter.jsx'; 

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
const socket = io(socketUrl, { transports: ["websocket"] });


socket.on('connect', () => {
    console.log('connected to socket server:', socket.id);
});

//debugging socketlistener
/*
socket.onAny((event, ...args) => {
  console.log("🔍 Received event:", event, args);
});
*/

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
    <AppRouter />
 </React.StrictMode>
);
export default socket;
