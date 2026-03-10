import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import History from './components/History';
import SessionSettings from './components/SessionSettings';
import Session from './components/Session';

export default function App() {
  return (
    <Routes>
      <Route path="/main"     element={<Main />} />
      <Route path="/history"  element={<History />} />
      <Route path="/settings" element={<SessionSettings />} />
      <Route path="/session"  element={<Session />} />
    </Routes>
  );
}