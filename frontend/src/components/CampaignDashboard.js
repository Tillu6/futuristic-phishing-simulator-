// frontend/src/components/CampaignDashboard.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Rocket, PlusCircle, Trash2, Play, Pause, ChartBar, ExternalLink, Calendar, Users, Target } from 'lucide-react'; // Icons

function CampaignDashboard({ onSelectCampaign, userId, db }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !userId) {
      console.log("Firestore DB or userId not available in CampaignDashboard.");
      return;
    }

    const campaignsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/campaigns`);
    // Order campaigns by creation date (or last modified) for better UI
    const q = query(campaignsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCampaigns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(fetchedCampaigns);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching campaigns:", err);
      setError("Failed to load campaigns.");
      setLoading(false);
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, [db, userId]); // Re-run effect if db or userId changes

  const handleDeleteCampaign = async (campaignId) => {
    if (!db || !userId) {
      alert("Firestore not initialized or user ID missing. Cannot delete."); // Replaced alert
      return;
    }
    if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) { // Replaced alert
      try {
        await deleteDoc(doc(db, `artifacts/${__app_id}/users/${userId}/campaigns`, campaignId));
        console.log("Campaign deleted:", campaignId);
      } catch (e) {
        console.error("Error deleting campaign:", e);
        alert("Failed to delete campaign."); // Replaced alert
      }
    }
  };

  const getCampaignStatus = (campaign) => {
    const now = new Date();
    const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

    if (campaign.status === 'completed') return 'Completed';
    if (campaign.status === 'paused') return 'Paused';
    if (campaign.status === 'active') {
      if (startDate && now < startDate) return 'Scheduled';
      if (endDate && now > endDate) return 'Expired (Active)'; // Mark as expired but was active
      return 'Active';
    }
    return 'Draft'; // Default for new campaigns
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-accent-400" />
        <p className="text-xl text-primary-300 ml-4">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger-500 text-lg mt-8 p-6 bg-primary-900 border border-danger-500 rounded-lg shadow-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-primary-900 rounded-xl p-8 shadow-2xl border border-primary-700 animate-fade-in-slide-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-white flex items-center">
          <Rocket className="w-9 h-9 mr-4 text-accent-300" /> Your Campaigns
        </h2>
        <button
          onClick={() => onSelectCampaign('create')}
          className="btn-accent flex items-center px-6 py-3 text-lg"
        >
          <PlusCircle className="w-6 h-6 mr-2" /> Create New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center p-12 bg-primary-800 rounded-lg border border-primary-700 shadow-inner">
          <p className="text-2xl font-medium text-primary-300 mb-4">No phishing campaigns created yet.</p>
          <p className="text-lg text-primary-400">Click "Create New Campaign" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-primary-800 rounded-lg p-6 shadow-xl border border-primary-700 hover:border-accent-500 transition-all duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{campaign.name}</h3>
                <p className="text-primary-300 text-sm mb-4 line-clamp-2">{campaign.description || 'No description provided.'}</p>

                <div className="text-primary-400 text-sm space-y-1 mb-4">
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-accent-400" /> Start: {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-danger-400" /> End: {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-primary-400" /> Targets: {campaign.targetEmails?.length || 0}</p>
                  <p className="flex items-center"><Target className="w-4 h-4 mr-2 text-primary-400" /> Simulated Page: {campaign.simulatedPageType || 'N/A'}</p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4
                  ${getCampaignStatus(campaign) === 'Active' ? 'bg-green-600 text-white' :
                  getCampaignStatus(campaign) === 'Scheduled' ? 'bg-blue-600 text-white' :
                  getCampaignStatus(campaign) === 'Completed' ? 'bg-gray-600 text-white' :
                  getCampaignStatus(campaign) === 'Paused' ? 'bg-yellow-600 text-white' :
                  'bg-gray-500 text-white'}`}>
                  Status: {getCampaignStatus(campaign)}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4 border-t border-primary-700 pt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectCampaign('results', campaign.id); }}
                  className="btn-secondary flex items-center px-3 py-1 text-sm hover:bg-primary-600"
                >
                  <ChartBar className="w-4 h-4 mr-1" /> Results
                </button>
                {/* Simulated phishing page URL for the user to copy/distribute */}
                {campaign.status === 'active' && (
                   <button
                   onClick={(e) => {
                     e.stopPropagation();
                     const phishingLink = `${window.location.origin}/phishing-page?campaignId=${campaign.id}&userId=${userId}`;
                     navigator.clipboard.writeText(phishingLink)
                       .then(() => alert("Phishing link copied to clipboard! Share this with your targets to simulate.")) // Replaced alert
                       .catch(err => console.error("Failed to copy link:", err));
                   }}
                   className="btn-accent flex items-center px-3 py-1 text-sm hover:bg-accent-600"
                 >
                   <ExternalLink className="w-4 h-4 mr-1" /> Copy Link
                 </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign.id); }}
                  className="bg-danger-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-danger-600 transition-colors duration-200 flex items-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CampaignDashboard;
