import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Syllabus from './pages/Syllabus';
import Progress from './pages/Progress';
import MockExam from './pages/MockExam';
import Forum from './pages/Forum';
import Profile from './pages/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Syllabus />} />
      <Route path="/syllabus" element={<Syllabus />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/mock-exam" element={<MockExam />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<h2>Page Not Found</h2>} />
    </Routes>
  );
};

export default AppRoutes;
