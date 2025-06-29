// frontend/src/components/EmailEditor.js

import React from 'react';
import { Mail, Eye } from 'lucide-react'; // Icons

function EmailEditor({ emailSubject, emailBody }) {
  // Replace the placeholder with a dummy link for preview
  const previewBody = emailBody.replace(/\[PHISHING_LINK_PLACEHOLDER\]/g, 'https://example.com/malicious-link');

  return (
    <div className="mt-8 p-6 bg-primary-700 rounded-lg border border-primary-600 shadow-md">
      <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Eye className="w-5 h-5 mr-3 text-primary-300" /> Email Preview
      </h4>
      <div className="bg-primary-900 p-4 rounded-md border border-primary-800">
        <p className="text-primary-200 text-sm mb-2">
          <span className="font-semibold">Subject:</span> {emailSubject || 'No Subject'}
        </p>
        <div className="text-primary-300 text-sm leading-relaxed whitespace-pre-wrap">
          {previewBody || 'Email body preview will appear here.'}
        </div>
      </div>
      <p className="text-primary-400 text-xs italic mt-3">
        (Note: The phishing link placeholder is replaced for preview only.)
      </p>
    </div>
  );
}

export default EmailEditor;
