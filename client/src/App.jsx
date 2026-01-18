import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './features.css';

import PolicyExpert from './components/PolicyExpert';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/policy-expert" element={<PolicyExpert />} />
      </Routes>
    </Router>
  );
}

export default App;
