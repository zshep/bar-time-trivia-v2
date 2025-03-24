import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home'; 
import Signup from '../pages/signup';  
import DashboardPage from '../pages/Dashboard/DashboardPage';  
import NotFound from '../pages/NotFound';  
import Headbanner from './headbanner';
import Footer from './footer';
import CreateTriviaGame from '../pages/Dashboard/CreateGamePage';
import CreateTriviaSession from '../pages/Dashboard/CreateTriviaSession';
import JoinTriviaSession from '../pages/Dashboard/JoinTriviaSession';
import DashboardInfo from '../pages/Dashboard/Dashboardinfo';
import ViewGamePage from '../pages/Dashboard/ViewGamePage';
import EditGame from './Trivia/EditGame';
import EditRound from './Trivia/EditRound';
import CreateQuestionPage from '../pages/Dashboard/CreateQuestionPage';



function AppRouter() {
  return (
    <Router>
      
      <Headbanner />
        <div className="flex-1 flex-grow w-full justify-center p-1 ">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardPage />} > 
            
            <Route path='/dashboard' element={<DashboardInfo />} />
            <Route path="create-game" element={<CreateTriviaGame />} />
            <Route path="viewgamePage" element={<ViewGamePage/>} />
            <Route path="edit-game" element={<EditGame/>} />
            <Route path="edit-round" element={<EditRound/>}/>
            <Route path="questionpage" element={<CreateQuestionPage/>} />


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
