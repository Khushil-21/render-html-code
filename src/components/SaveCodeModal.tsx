import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SaveCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  isMultiPage?: boolean;
}

export default function SaveCodeModal({ isOpen, onClose, code, isMultiPage = false }: SaveCodeModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name for your code');
      return;
    }

    try {
      // Generate a simple slug from the name
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50);

      // Get existing codes from localStorage
      const savedCodesJson = localStorage.getItem('savedCodes') || '{}';
      const savedCodes = JSON.parse(savedCodesJson);

      // Add new code with timestamp
      savedCodes[slug] = {
        name: name.trim(),
        code: code,
        createdAt: new Date().toISOString(),
        isMultiPage: isMultiPage
      };

      // Save back to localStorage
      localStorage.setItem('savedCodes', JSON.stringify(savedCodes));

      // Navigate to the saved code
      onClose();
      router.push(`/renderer/${slug}`);
    } catch (error) {
      console.error('Error saving code:', error);
      setError('Failed to save code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Save Your Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <span className="text-blue-600 font-medium mr-2">Type:</span> 
              {isMultiPage ? "Multi-page HTML" : "Single-page HTML"}
            </div>
            
            <div>
              <label htmlFor="code-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="code-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Enter a name for your code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 