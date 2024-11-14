import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import login from './components/login';
import jedi from "./public/images/jedi.small.jpg";

const socket = io("http://localhost:3001");

function App() {



  return (
    <container className="flex-col align-top h-full border w-full">
      
      <div className='flex-row w-full'>
        <img className ="rounded-full" src = {jedi}/>
        <div>
          <p>log in goes here</p>
        </div>
      </div>
    </container>
  )
}

export default App

