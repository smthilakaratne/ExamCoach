import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes';

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
