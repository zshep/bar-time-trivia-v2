import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import login from './components/login.jsx';
import Auth from '../app/server/auth/authentication.jsx';
import jedi from "./public/images/jedi.small.jpg";

const socket = io("http://localhost:3001");

function App() {



  return (
    <div className="flex flex-row align-top h-full w-full">  
          <div className='w-1/2 content-center self-center justify-items-center'>
          <img className ="rounded-full" src = {jedi}/>
          </div>
        <div className='w-1/2 content-center self-center justify-items-center'>
          
          <Auth></Auth>
        </div>
      
    </div>
  )
}

export default App

