import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home'; 
import Signup from '../pages/signup';  
import Dashboard from '../pages/Dashboard';  
import NotFound from '../pages/NotFound';  
import Headbanner from './headbanner';
import Footer from './footer'; 

function AppRouter() {
  return (
    <Router>
      <Headbanner />
        <div className="flex h-full w-full justify-center">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />  {/* Wildcard for unmatched routes */}
      </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default AppRouter;
