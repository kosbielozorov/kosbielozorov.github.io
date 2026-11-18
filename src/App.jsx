import './App.css';

import MainLayout from './components/MainLayout';
import NotFound from './components/NotFound';
import ResumeLayout from './components/ResumeLayout';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/my-resume" element={<ResumeLayout />} />
          {/* Old links to /index.html (common for static sites) lead home, not to "not found". */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
