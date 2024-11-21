import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import login from './components/login';
import jedi from "./public/images/jedi.small.jpg";

const socket = io("http://localhost:3001");

function App() {



  return (
    <div className="flex flex-row align-top h-full w-full">  
          <div className='w-1/2 content-center self-center justify-items-center'>
          <img className ="rounded-full" src = {jedi}/>
          </div>
        <div className='w-1/2 content-center self-center justify-items-center'>
          <p>log in goes here</p>
        </div>
      
    </div>
  )
}

export default App

