import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Headbanner from './components/headbanner';

const socket = io("http://localhost:3001");

function App() {
 // const [messages, setMessages] = useState([]);
 // const [message, setMessage] = useState('');
  
  const [count, setCount] = useState(0);
/*
  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message", message);
    setMessage('');
  };
 */
  return (
    <>
    <Headbanner>

    </Headbanner>
  
      
      <h1>Hello there Sexy Shep</h1>
      
      <div className="card">
       
      </div>
      <p className="read-the-docs">
        Do more work Shep, do much more work
      </p>
    </>
  )
}

export default App

// an example of sucking socket
/* 
  <div className="App">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
*/