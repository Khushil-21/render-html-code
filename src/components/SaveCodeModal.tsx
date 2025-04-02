import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SaveCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export default function SaveCodeModal({ isOpen, onClose, code }: SaveCodeModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name for your code');
      return;
    }

    try {
      // Get existing saved codes
      const savedCodesJson = localStorage.getItem('savedCodes') || '{}';
      const savedCodes = JSON.parse(savedCodesJson);
      
      // Create slug from name
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if name already exists
      if (savedCodes[slug] && !confirm('A code with this name already exists. Do you want to overwrite it?')) {
        return;
      }
      
      // Save the code
      savedCodes[slug] = {
        name,
        code,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
      
      setSuccess('Code saved successfully!');
      setError('');
      
      // Close after a short delay
      setTimeout(() => {
        onClose();
        setName('');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('Failed to save code. Please try again.');
      console.error('Error saving code:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Save Your Code</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="code-name" className="block text-sm font-medium text-gray-700 mb-1">
            Give your code a name
          </label>
          <input
            type="text"
            id="code-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Portfolio Page"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 