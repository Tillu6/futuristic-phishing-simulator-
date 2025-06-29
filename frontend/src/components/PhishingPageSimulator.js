// frontend/src/components/PhishingPageSimulator.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // For parsing URL params - will use URLSearchParams directly
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from './AuthProvider';
import { AlertTriangle, Lock, Download, XCircle, CheckCircle, Loader2 } from 'lucide-react'; // Icons

// Custom hook to parse URL query parameters
function useQuery() {
  return new URLSearchParams(window.location.search); // Use window.location directly
}

function PhishingPageSimulator({ campaignId: propCampaignId }) {
  const { db } = useFirebase();
  const { userId } = useAuth(); // User ID of the simulator (attacker)
  const query = useQuery();

  // Get campaignId and targetEmail from URL.
  // In a real scenario, `targetEmail` would likely be encoded or passed differently
  // to avoid direct exposure in the URL, or derived from a unique per-target link.
  const campaignIdFromUrl = query.get('campaignId');
  const targetEmailFromUrl = query.get('targetEmail') || 'simulated_target@example.com'; // Fallback for testing

  const currentCampaignId = propCampaignId || campaignIdFromUrl;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'failed'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // This component is designed to be a standalone "phishing page".
    // When accessed directly via URL, it won't have `db` from context unless re-initialized.
    // For simplicity, we assume `db` is available through FirebaseContext.
    // In a production environment, this phishing page would be hosted separately
    // and send data back to the backend API, not directly interact with Firestore.

    const fetchCampaignData = async () => {
      if (!db || !currentCampaignId || !userId) {
        console.log("DB, Campaign ID, or User ID missing for PhishingPageSimulator.");
        setLoading(false);
        return;
      }

      try {
        // __app_id is a global variable provided by the Canvas environment
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        const campaignDocRef = doc(db, `artifacts/${appId}/users/${userId}/campaigns`, currentCampaignId);
        const campaignSnap = await getDoc(campaignDocRef);

        if (campaignSnap.exists()) {
          setCampaign({ id: campaignSnap.id, ...campaignSnap.data() });
          // Record click
          await updateDoc(campaignDocRef, {
            'results.clicks': (campaignSnap.data().results.clicks || 0) + 1,
            // Track unique clicks: check if this target email has clicked before
            [`results.clickDetails.${targetEmailFromUrl}`]: {
              timestamp: new Date().toISOString(),
              // In a real scenario, you'd capture client IP from request, not frontend
              ip: 'simulated_ip',
            }
          });
          console.log("Click recorded for campaign:", currentCampaignId, "target:", targetEmailFromUrl);
        } else {
          console.error("No such campaign document!");
          // Use a custom modal or alert alternative for user feedback
          // alert("Simulated campaign not found!");
        }
      } catch (error) {
        console.error("Error fetching campaign or recording click:", error);
        // Use a custom modal or alert alternative for user feedback
        // alert("Error loading simulated page.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [db, currentCampaignId, userId, targetEmailFromUrl]);


  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!db || !currentCampaignId || !userId) {
      // Use a custom modal or alert alternative
      // alert("Error: Database or campaign ID not available.");
      setSubmissionStatus('failed');
      return;
    }

    if (username === '' || password === '') {
        // Use a custom modal or alert alternative
        // alert("Please enter both username and password.");
        setSubmissionStatus('failed');
        return;
    }

    try {
      // __app_id is a global variable provided by the Canvas environment
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      const campaignDocRef = doc(db, `artifacts/${appId}/users/${userId}/campaigns`, currentCampaignId);
      await updateDoc(campaignDocRef, {
        'results.submissions': (campaign.results.submissions || 0) + 1,
        // Store submission details
        [`results.submissionDetails.${targetEmailFromUrl}`]: {
            timestamp: new Date().toISOString(),
            // In a real scenario, capture client IP
            ip: 'simulated_ip',
            credentials: {
                username: username,
                password: password, // For simulation purposes, store it. In real tools, it's hashed/encrypted.
            }
        }
      });
      console.log("Credentials submitted for campaign:", currentCampaignId, "target:", targetEmailFromUrl);
      setSubmissionStatus('success');
      // Use a custom modal or alert alternative
      // alert("Thank you! Your information has been processed."); // this is the "phishing success" message
    } catch (error) {
      console.error("Error submitting credentials:", error);
      setSubmissionStatus('failed');
      // Use a custom modal or alert alternative
      // alert("An error occurred. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-primary-200">
        <Loader2 className="w-16 h-16 animate-spin text-accent-400" />
        <p className="text-2xl ml-4">Loading simulated page...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-danger-400 p-8">
        <XCircle className="w-24 h-24 mb-6" />
        <h1 className="text-5xl font-bold mb-4">404 - Campaign Not Found</h1>
        <p className="text-xl text-primary-300 text-center">
          The simulated phishing campaign you are trying to access does not exist or has expired.
        </p>
      </div>
    );
  }

  // Render different page types based on campaign.simulatedPageType
  const renderPhishingPage = () => {
    switch (campaign.simulatedPageType) {
      case 'login':
        return (
          <div className="bg-gradient-to-br from-primary-900 to-primary-800 p-8 md:p-12 rounded-xl shadow-2xl border border-primary-700 w-full max-w-md mx-auto animate-fade-in-slide-up">
            <div className="text-center mb-8">
              <Lock className="w-20 h-20 mx-auto text-accent-400 mb-4" />
              <h1 className="text-4xl font-bold text-white mb-2">Secure Login Required</h1>
              <p className="text-primary-300">Please log in to verify your account or access important updates.</p>
            </div>
            <form onSubmit={handleCredentialSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-primary-200 text-sm font-medium mb-2">Username / Email</label>
                <input
                  type="text"
                  id="username"
                  className="input-field"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-primary-200 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full py-3 text-lg flex items-center justify-center"
                disabled={submissionStatus === 'success'}
              >
                {submissionStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                {submissionStatus === 'success' ? 'Submitted!' : 'Log In'}
              </button>
            </form>
            {submissionStatus === 'success' && (
              <p className="mt-4 text-center text-accent-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Your account has been verified.
              </p>
            )}
            {submissionStatus === 'failed' && (
              <p className="mt-4 text-center text-danger-500 flex items-center justify-center">
                <XCircle className="w-5 h-5 mr-2" /> Submission failed. Please try again.
              </p>
            )}
            <p className="text-primary-400 text-xs italic text-center mt-6">
                This is a simulated page for a phishing awareness exercise. Do not enter real credentials.
            </p>
          </div>
        );
      case 'error':
        return (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md mx-auto animate-fade-in-slide-up text-center">
            <AlertTriangle className="w-24 h-24 mx-auto text-yellow-400 mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Service Unavailable</h1>
            <p className="text-primary-300 text-lg mb-6">
              We are currently experiencing technical difficulties. Please try again later.
            </p>
            <p className="text-primary-400 text-sm italic">
              Error Code: 503 - Service Maintenance.
            </p>
            <p className="text-primary-400 text-xs italic text-center mt-6">
                This is a simulated page for a phishing awareness exercise.
            </p>
          </div>
        );
      case 'update':
        return (
          <div className="bg-gradient-to-br from-primary-900 to-primary-800 p-8 md:p-12 rounded-xl shadow-2xl border border-primary-700 w-full max-w-md mx-auto animate-fade-in-slide-up text-center">
            <Download className="w-24 h-24 mx-auto text-accent-400 mb-6 animate-bounce" />
            <h1 className="text-5xl font-bold text-white mb-4">Software Update Required</h1>
            <p className="text-primary-300 text-lg mb-6">
              Your system requires an urgent security update. Please click the button below to install.
            </p>
            <button
              onClick={() => {
                // Simulate download/installation and record submission
                handleCredentialSubmit({ preventDefault: () => {} }); // Use dummy event
                // In a real scenario, this would trigger a fake download or redirect
                // alert("Simulating update download. Your action has been recorded.");
              }}
              className="btn-accent w-full py-3 text-lg flex items-center justify-center"
              disabled={submissionStatus === 'success'}
            >
              {submissionStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <Download className="w-5 h-5 mr-2" />}
              {submissionStatus === 'success' ? 'Update Simulated!' : 'Install Update Now'}
            </button>
            {submissionStatus === 'success' && (
              <p className="mt-4 text-center text-accent-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Update simulation complete.
              </p>
            )}
            {submissionStatus === 'failed' && (
              <p className="mt-4 text-center text-danger-500 flex items-center justify-center">
                <XCircle className="w-5 h-5 mr-2" /> Simulation failed.
              </p>
            )}
            <p className="text-primary-400 text-xs italic text-center mt-6">
                This is a simulated page for a phishing awareness exercise.
            </p>
          </div>
        );
      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-danger-400 p-8">
            <AlertTriangle className="w-24 h-24 mb-6" />
            <h1 className="text-5xl font-bold mb-4">Invalid Page Type</h1>
            <p className="text-xl text-primary-300 text-center">
              The simulated page type is not recognized.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {renderPhishingPage()}
    </div>
  );
}

export default PhishingPageSimulator;
