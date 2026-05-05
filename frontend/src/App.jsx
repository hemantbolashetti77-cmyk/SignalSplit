import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportPage from './pages/ReportPage';

const Footer = () => (
  <footer style={{ 
    padding: 'var(--space-xl) 0', 
    borderTop: '1px solid var(--border-muted)',
    background: 'var(--bg-secondary)'
  }}>
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px' }}>
          SIGNALSPLIT
        </div>
        <div className="label-caps" style={{ fontSize: '10px' }}>
          © 2026 SIGNALSPLIT TECHNOLOGIES. ALL RIGHTS RESERVED. // PERFECTIONISTS
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          {['Twitter', 'GitHub', 'LinkedIn'].map(social => (
            <a key={social} href="#" className="label-caps" style={{ textDecoration: 'none', fontSize: '10px' }}>
              {social}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

const LandingPage = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Stats />
      <Features />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
