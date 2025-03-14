
import './index.css';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001'); // backend server
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './components/AppRouter.jsx'; 


ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
    <AppRouter />
 </React.StrictMode>
);
export default socket;
