// frontend/src/components/ResultsDashboard.js

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from './AuthProvider';
import {
  ArrowLeft, ChartLine, Users, MousePointerClick, Key, Clipboard, XCircle, CheckCircle, Loader2, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  "clicks": '#6366f1',    // primary-500
  "submissions": '#4ade80' // accent-400
};

function ResultsDashboard({ selectedCampaignId, onBack }) {
  const { db } = useFirebase();
  const { userId } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedSubmissionEmail, setSelectedSubmissionEmail] = useState(null);

  useEffect(() => {
    if (!db || !userId || !selectedCampaignId) {
      console.log("DB, User ID, or selectedCampaignId not available for ResultsDashboard.");
      setError("Please select a campaign to view results.");
      setLoading(false);
      return;
    }

    // __app_id is a global variable provided by the Canvas environment
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    const campaignDocRef = doc(db, `artifacts/${appId}/users/${userId}/campaigns`, selectedCampaignId);

    const unsubscribe = onSnapshot(campaignDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCampaign({ id: docSnap.id, ...docSnap.data() });
        setLoading(false);
      } else {
        setError("Campaign not found.");
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching campaign results:", err);
      setError("Failed to load campaign results.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [db, userId, selectedCampaignId]);

  const clickData = [
    { name: 'Clicks', count: campaign?.results?.clicks || 0, color: COLORS.clicks },
    { name: 'Submissions', count: campaign?.results?.submissions || 0, color: COLORS.submissions },
  ];

  const uniqueInteractionData = [
    { name: 'Unique Clicks', count: Object.keys(campaign?.results?.clickDetails || {}).length, color: COLORS.clicks },
    { name: 'Unique Submissions', count: Object.keys(campaign?.results?.submissionDetails || {}).length, color: COLORS.submissions },
  ];

  const handleCopyCredentials = (credentials) => {
    const credText = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    document.execCommand('copy', false, credText); // Using document.execCommand for iframe compatibility
    // In a real application, you'd use a non-alert notification (toast, modal)
    // alert("Credentials copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-16 h-16 animate-spin text-accent-400" />
        <p className="text-2xl text-primary-300 ml-4">Loading campaign results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger-500 text-lg mt-8 p-6 bg-primary-900 border border-danger-500 rounded-lg shadow-lg">
        Error: {error}
        <button onClick={onBack} className="btn-secondary mt-4 flex items-center mx-auto">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Campaigns
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center text-primary-300 text-lg mt-8 p-6 bg-primary-900 rounded-lg shadow-lg">
        No campaign selected or data available.
        <button onClick={onBack} className="btn-secondary mt-4 flex items-center mx-auto">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary-900 rounded-xl p-8 shadow-2xl border border-primary-700 animate-fade-in-slide-up">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-primary-700">
        <h2 className="text-4xl font-bold text-white flex items-center">
          <ChartLine className="w-9 h-9 mr-4 text-accent-300" /> Results for "{campaign.name}"
        </h2>
        <button onClick={onBack} className="btn-secondary flex items-center px-4 py-2 text-lg">
          <ArrowLeft className="w-6 h-6 mr-2" /> Back to Campaigns
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Key Metrics */}
        <div className="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-700">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Users className="w-6 h-6 mr-3 text-primary-300" /> Engagement Overview
          </h3>
          <ul className="space-y-3 text-primary-200 text-lg">
            <li className="flex justify-between items-center">
              <span>Total Targeted Emails:</span>
              <span className="font-semibold text-accent-300">{campaign.targetEmails?.length || 0}</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Total Clicks on Phishing Link:</span>
              <span className="font-semibold text-primary-300 flex items-center">
                <MousePointerClick className="w-5 h-5 mr-2 text-primary-400" />{campaign.results?.clicks || 0}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Total Credential Submissions:</span>
              <span className="font-semibold text-danger-300 flex items-center">
                <Key className="w-5 h-5 mr-2 text-danger-400" />{campaign.results?.submissions || 0}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Unique Clicks:</span>
              <span className="font-semibold text-primary-300 flex items-center">
                <MousePointerClick className="w-5 h-5 mr-2 text-primary-400" />{Object.keys(campaign.results?.clickDetails || {}).length}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span>Unique Submissions:</span>
              <span className="font-semibold text-danger-300 flex items-center">
                <Key className="w-5 h-5 mr-2 text-danger-400" />{Object.keys(campaign.results?.submissionDetails || {}).length}
              </span>
            </li>
          </ul>
        </div>

        {/* Interaction Chart */}
        <div className="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-700 flex flex-col items-center">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <ChartLine className="w-6 h-6 mr-3 text-primary-300" /> Interaction Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={clickData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3730a3" />
              <XAxis dataKey="name" stroke="#a5b4fc" tick={{ fill: '#a5b4fc' }} />
              <YAxis stroke="#a5b4fc" tick={{ fill: '#a5b4fc' }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                contentStyle={{ backgroundColor: '#312e81', border: 'none', borderRadius: '8px', padding: '10px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend iconSize={10} iconType="square" wrapperStyle={{ color: '#a5b4fc' }} />
              <Bar dataKey="count" animationDuration={1000} >
                <Bar dataKey="count" fill={COLORS.clicks} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
           <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={uniqueInteractionData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3730a3" />
              <XAxis dataKey="name" stroke="#a5b4fc" tick={{ fill: '#a5b4fc' }} />
              <YAxis stroke="#a5b4fc" tick={{ fill: '#a5b4fc' }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                contentStyle={{ backgroundColor: '#312e81', border: 'none', borderRadius: '8px', padding: '10px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" animationDuration={1000} >
                <Bar dataKey="count" fill={(data) => data.name === 'Unique Clicks' ? COLORS.clicks : COLORS.submissions} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submission Details */}
      <div className="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-700 mt-8">
        <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <Key className="w-6 h-6 mr-3 text-danger-400" /> Submitted Credentials
        </h3>
        {Object.keys(campaign.results?.submissionDetails || {}).length === 0 ? (
          <p className="text-primary-300 italic">No credentials have been submitted yet for this campaign.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(campaign.results.submissionDetails).map(([email, details]) => (
              <div key={email} className="bg-primary-700 p-4 rounded-md border border-primary-600 flex justify-between items-center">
                <div>
                  <p className="text-primary-100 font-medium text-lg">{email}</p>
                  <p className="text-primary-300 text-sm">Submitted at: {new Date(details.timestamp).toLocaleString()}</p>
                  <p className="text-primary-300 text-sm">Simulated IP: {details.ip}</p>
                  <p className="text-primary-300 text-sm">Username: <span className="font-mono text-accent-200">{details.credentials.username}</span></p>
                  <button
                    onClick={() => {
                      setSelectedSubmissionEmail(email);
                      setShowCredentialsModal(true);
                    }}
                    className="mt-2 btn-secondary px-3 py-1 text-sm flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View Password
                  </button>
                </div>
                <button
                  onClick={() => handleCopyCredentials(details.credentials)}
                  className="btn-primary px-3 py-1 text-sm flex items-center"
                >
                  <Clipboard className="w-4 h-4 mr-1" /> Copy All
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click Details */}
      <div className="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-700 mt-8">
        <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <MousePointerClick className="w-6 h-6 mr-3 text-primary-300" /> Click Details
        </h3>
        {Object.keys(campaign.results?.clickDetails || {}).length === 0 ? (
          <p className="text-primary-300 italic">No clicks recorded yet for this campaign.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(campaign.results.clickDetails).map(([email, details]) => (
              <div key={email} className="bg-primary-700 p-4 rounded-md border border-primary-600">
                <p className="text-primary-100 font-medium text-lg">{email}</p>
                <p className="text-primary-300 text-sm">Clicked at: {new Date(details.timestamp).toLocaleString()}</p>
                <p className="text-primary-300 text-sm">Simulated IP: {details.ip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals for password viewing */}
      {showCredentialsModal && selectedSubmissionEmail && campaign.results?.submissionDetails[selectedSubmissionEmail] && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-800 rounded-lg p-8 shadow-2xl border border-primary-600 w-full max-w-md animate-fade-in-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Credentials for {selectedSubmissionEmail}</h3>
              <button onClick={() => setShowCredentialsModal(false)} className="text-primary-300 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-primary-900 p-4 rounded-md border border-primary-700 space-y-3">
              <p className="text-primary-200">
                <span className="font-semibold">Username:</span> <span className="font-mono text-accent-200">{campaign.results.submissionDetails[selectedSubmissionEmail].credentials.username}</span>
              </p>
              <p className="text-primary-200">
                <span className="font-semibold">Password:</span> <span className="font-mono text-danger-200">{campaign.results.submissionDetails[selectedSubmissionEmail].credentials.password}</span>
              </p>
            </div>
            <button
              onClick={() => handleCopyCredentials(campaign.results.submissionDetails[selectedSubmissionEmail].credentials)}
              className="btn-primary w-full mt-6 flex items-center justify-center"
            >
              <Clipboard className="w-5 h-5 mr-2" /> Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDashboard;
