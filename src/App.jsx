import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Auth from '../app/server/auth/authentication.jsx';

import Home from './pages/Home.jsx';

const socket = io("http://localhost:3001");

function App() {



  return (
    <div className='flex h-full'>  
          <Home></Home>
      
    </div>
  )
}

export default App

