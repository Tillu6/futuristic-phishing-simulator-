// frontend/src/components/CreateCampaign.js

import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import EmailEditor from './EmailEditor';
import { Mail, Target, Calendar, MessageSquare, Loader2, Wand, XCircle, Rocket } from 'lucide-react'; // Icons

function CreateCampaign({ onCampaignCreated, userId, db }) {
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [targetEmails, setTargetEmails] = useState(''); // Comma-separated
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [simulatedPageType, setSimulatedPageType] = useState('login'); // 'login', 'error', 'update'
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAIError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleGenerateEmail = async () => {
    setLoadingAI(true);
    setAIError(null);
    setEmailBody(''); // Clear previous AI content

    try {
      const prompt = `Generate a realistic phishing email with the following characteristics:\n- Subject: ${emailSubject || 'Urgent Account Action Required'}\n- Context: ${description || 'Generic phishing scenario'}\n- Tone: Urgent and official.\n- Call to action: Direct the user to a login page for verification or update.\n- Avoid any direct malicious links, just use a placeholder [PHISHING_LINK_PLACEHOLDER].\n- Keep it concise and convincing.`;

      // Call Flask backend for AI generation
      const response = await fetch('http://localhost:5000/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await response.json();

      if (response.ok && data.generated_text) {
        setEmailBody(data.generated_text);
      } else {
        setAIError(data.error || 'Failed to generate email content.');
      }
    } catch (err) {
      setAIError('Could not connect to AI service. Ensure backend is running.');
      console.error("AI Generation Error:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    if (!db || !userId) {
      setSaveError("Firestore DB or user ID not available. Cannot save campaign.");
      setSaving(false);
      return;
    }

    // Replace window.confirm with a custom modal if needed in a real app
    if (!window.confirm("Are you sure you want to launch this campaign?")) {
      setSaving(false);
      return;
    }


    const campaignData = {
      name: campaignName,
      description: description,
      targetEmails: targetEmails.split(',').map(email => email.trim()).filter(email => email !== ''),
      startDate: startDate,
      endDate: endDate,
      emailSubject: emailSubject,
      emailBody: emailBody,
      simulatedPageType: simulatedPageType,
      status: 'active', // Set to active on creation
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      results: {
        totalSent: 0,
        clicks: 0,
        submissions: 0,
        uniqueClicks: 0,
        uniqueSubmissions: 0,
        clickDetails: {}, // {email: {timestamp: time, ip: ip}}
        submissionDetails: {} // {email: {timestamp: time, ip: ip, credentials: {username: "", password: ""}}}
      }
    };

    try {
      const campaignRef = collection(db, `artifacts/${__app_id}/users/${userId}/campaigns`);
      await addDoc(campaignRef, campaignData);
      alert("Campaign created successfully!"); // Placeholder for a better UI notification
      onCampaignCreated(); // Navigate back to dashboard
    } catch (err) {
      console.error("Error creating campaign:", err);
      setSaveError("Failed to create campaign. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-primary-900 rounded-xl p-8 shadow-2xl border border-primary-700 animate-fade-in-slide-up">
      <h2 className="text-4xl font-bold text-white mb-8 flex items-center justify-center">
        <PlusSquare className="w-9 h-9 mr-4 text-accent-300" /> Create New Campaign
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Details */}
        <div className="bg-primary-800 p-6 rounded-lg border border-primary-700 shadow-inner">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Mail className="w-6 h-6 mr-3 text-primary-300" /> Campaign Details
          </h3>
          <div>
            <label htmlFor="campaignName" className="block text-primary-200 text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              id="campaignName"
              className="input-field"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Q3 Security Awareness Training"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-primary-200 text-sm font-medium mb-2 mt-4">Description</label>
            <textarea
              id="description"
              className="textarea-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the campaign's purpose."
            />
          </div>
          <div>
            <label htmlFor="targetEmails" className="block text-primary-200 text-sm font-medium mb-2 mt-4">Target Emails (comma-separated)</label>
            <textarea
              id="targetEmails"
              className="textarea-field"
              value={targetEmails}
              onChange={(e) => setTargetEmails(e.target.value)}
              placeholder="user1@example.com, user2@example.com, ..."
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="startDate" className="block text-primary-200 text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-primary-200 text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                id="endDate"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="bg-primary-800 p-6 rounded-lg border border-primary-700 shadow-inner">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-primary-300" /> Email Content
          </h3>
          <div>
            <label htmlFor="emailSubject" className="block text-primary-200 text-sm font-medium mb-2">Email Subject</label>
            <input
              type="text"
              id="emailSubject"
              className="input-field"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="e.g., Urgent: Your Account Requires Verification"
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="emailBody" className="block text-primary-200 text-sm font-medium mb-2">Email Body</label>
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={handleGenerateEmail}
                className="btn-accent flex items-center px-4 py-2 text-sm"
                disabled={loadingAI}
              >
                {loadingAI ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand className="w-4 h-4 mr-2" />}
                {loadingAI ? 'Generating...' : 'Generate with AI'}
              </button>
              {aiError && <span className="text-danger-500 text-sm flex items-center">{aiError}</span>}
            </div>
            <textarea
              id="emailBody"
              className="textarea-field"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Your phishing email content goes here. Use [PHISHING_LINK_PLACEHOLDER] for the link."
              required
            />
          </div>
          <div className="mt-4">
            <p className="text-primary-400 text-xs italic">
              Note: Use `[PHISHING_LINK_PLACEHOLDER]` in the email body. This will be automatically replaced with the actual phishing link during simulation.
            </p>
          </div>
          <EmailEditor emailSubject={emailSubject} emailBody={emailBody} />
        </div>

        {/* Simulated Landing Page */}
        <div className="bg-primary-800 p-6 rounded-lg border border-primary-700 shadow-inner">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-6 h-6 mr-3 text-primary-300" /> Simulated Landing Page
          </h3>
          <div>
            <label htmlFor="simulatedPageType" className="block text-primary-200 text-sm font-medium mb-2">Page Type</label>
            <select
              id="simulatedPageType"
              className="input-field"
              value={simulatedPageType}
              onChange={(e) => setSimulatedPageType(e.target.value)}
            >
              <option value="login">Generic Login Page</option>
              <option value="error">Error/Maintenance Page</option>
              <option value="update">Software Update Page</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        {saveError && (
          <div className="p-4 bg-danger-600 bg-opacity-30 border border-danger-500 rounded-lg text-danger-200 flex items-center space-x-3 shadow-lg">
            <XCircle className="w-6 h-6 text-danger-400" />
            <p className="font-medium">{saveError}</p>
          </div>
        )}
        <button
          type="submit"
          className="btn-primary w-full py-3 text-xl flex items-center justify-center"
          disabled={saving}
        >
          {saving ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Rocket className="w-6 h-6 mr-2" />}
          {saving ? 'Creating Campaign...' : 'Launch Campaign'}
        </button>
      </form>
    </div>
  );
}

export default CreateCampaign;
