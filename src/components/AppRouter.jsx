import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home'; 
import Signup from '../pages/signup';  
import Dashboard from '../pages/Dashboard/Dashboard';  
import NotFound from '../pages/NotFound';  
import Headbanner from './headbanner';
import Footer from './footer';

import CreateTriviaGame from '../pages/Dashboard/CreateTriviaGame';
import CreateTriviaSession from '../pages/Dashboard/CreateTriviaSession';
import JoinTriviaSession from '../pages/Dashboard/JoinTriviaSession';
import DashboardInfo from '../pages/Dashboard/Dashboardinfo';

function AppRouter() {
  return (
    <Router>
      
      <Headbanner />
        <div className="flex h-full w-full justify-center">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} > 
            
            <Route path='/dashboard' element={<DashboardInfo />} />
            <Route path="create-game" element={<CreateTriviaGame />} />
            <Route path="create-session" element={<CreateTriviaSession />} />
            <Route path="join-session" element={<JoinTriviaSession />} />      
        
          </Route>
       
       {/* Wildcard for unmatched routes */}
        <Route path="*" element={<NotFound />} />  
      </Routes>
      </div>
     
      <Footer />
    </Router>
  );
}

export default AppRouter;
