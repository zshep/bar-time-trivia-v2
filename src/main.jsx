import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001'); // Connect to your backend server
import Headbanner from './components/headbanner.jsx';
import Footer from './components/footer.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Headbanner></Headbanner>
    <App />
    <Footer></Footer>
  </StrictMode>,
)
export default socket;
