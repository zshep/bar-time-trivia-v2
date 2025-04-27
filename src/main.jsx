
import './index.css';
import { io } from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './components/AppRouter.jsx'; 

const socket = io('http://localhost:3001'); // backend server

socket.on('connect', () => {
    console.log('connected to socket server:', socket.id);
})

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
    <AppRouter />
 </React.StrictMode>
);
export default socket;
