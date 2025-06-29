// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import CampaignDashboard from './components/CampaignDashboard';
import CreateCampaign from './components/CreateCampaign';
import ResultsDashboard from './components/ResultsDashboard';
import PhishingPageSimulator from './components/PhishingPageSimulator';
import { useFirebase } from './contexts/FirebaseContext';
import { useAuth } from './components/AuthProvider'; // Ensure this path is correct
import {
  ShieldCheck, Rocket, PlusSquare, BarChart, Settings, Loader2,
  Bell, CheckCircle, XCircle
} from 'lucide-react'; // Icons

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'create', 'results', 'phishing-page'
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const { db, auth } = useFirebase(); // Access Firestore and Auth instances
  const { userId, isAuthReady } = useAuth(); // Access userId and auth readiness

  // State for backend status
  const [backendStatus, setBackendStatus] = useState('unknown'); // 'unknown', 'online', 'offline'

  // Function to check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.error("Failed to connect to backend:", error);
      setBackendStatus('offline');
    }
  };

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
    // Optionally, set up an interval to periodically check status
    const interval = setInterval(checkBackendStatus, 15000); // Check every 15 seconds
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  const handleNavigate = (page, campaignId = null) => {
    setCurrentPage(page);
    setSelectedCampaignId(campaignId);
  };

  if (!isAuthReady) {
    // AuthProvider will render a loading screen
    return null;
  }

  // Display user ID for multi-user context
  const displayUserId = userId || "Loading...";

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 font-inter">
      {/* Header */}
      <header className="bg-primary-900 border-b border-primary-700 p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <defs>
                <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>
                <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              {/* Shield base */}
              <path d="M50 0L10 25V75L50 100L90 75V25L50 0Z" fill="url(#logoGradient1)"/>
              {/* Eye / Target in center */}
              <circle cx="50" cy="50" r="20" fill="url(#logoGradient2)"/>
              <circle cx="50" cy="50" r="10" fill="#1e1b4b"/> {/* primary-950 */}
              {/* Small "phish" tail or arrow */}
              <path d="M65 40L75 35L70 50L65 40Z" fill="white" opacity="0.8"/>
            </svg>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-200 to-accent-300">
              PhishAI Sim
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200 ${
                currentPage === 'dashboard' ? 'bg-primary-700 text-accent-300 shadow-inner' : 'text-primary-200 hover:bg-primary-800'
              }`}
            >
              <Rocket className="w-5 h-5 mr-2" /> Campaigns
            </button>
            <button
              onClick={() => handleNavigate('create')}
              className={`flex items-center px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200 ${
                currentPage === 'create' ? 'bg-primary-700 text-accent-300 shadow-inner' : 'text-primary-200 hover:bg-primary-800'
              }`}
            >
              <PlusSquare className="w-5 h-5 mr-2" /> New Campaign
            </button>
            <button
              onClick={() => handleNavigate('results')}
              className={`flex items-center px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200 ${
                currentPage === 'results' ? 'bg-primary-700 text-accent-300 shadow-inner' : 'text-primary-200 hover:bg-primary-800'
              }`}
            >
              <BarChart className="w-5 h-5 mr-2" /> Results
            </button>
          </nav>

          {/* Backend Status Indicator in header */}
          <div className="flex items-center space-x-2 text-sm md:text-base">
            <span className="font-semibold text-primary-200">Backend:</span>
            {backendStatus === 'online' ? (
              <span className="text-accent-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Online
              </span>
            ) : backendStatus === 'offline' ? (
              <span className="text-red-400 flex items-center">
                <XCircle className="w-4 h-4 mr-1" /> Offline
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Checking...
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 w-full">
        {/* Display User ID (for debugging/multi-user context) */}
        <div className="text-right text-primary-300 text-sm mb-4">
          Session ID: <span className="font-mono text-primary-100">{displayUserId}</span>
        </div>

        {/* Conditional Page Rendering */}
        {currentPage === 'dashboard' && (
          <CampaignDashboard onSelectCampaign={handleNavigate} userId={userId} db={db} />
        )}
        {currentPage === 'create' && (
          <CreateCampaign onCampaignCreated={() => handleNavigate('dashboard')} userId={userId} db={db} />
        )}
        {currentPage === 'results' && (
          <ResultsDashboard selectedCampaignId={selectedCampaignId} onBack={() => handleNavigate('dashboard')} userId={userId} db={db} />
        )}
        {/* This will be the actual phishing page simulated in the browser */}
        {currentPage === 'phishing-page' && (
          <PhishingPageSimulator campaignId={selectedCampaignId} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-primary-900 border-t border-primary-700 p-4 text-center text-primary-300 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} PhishAI Sim. All rights reserved.</p>
        <p className="mt-1">Empowering security awareness with AI-driven simulations.</p>
      </footer>
    </div>
  );
}

export default App;
