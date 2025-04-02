"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, ExternalLink, Plus } from 'lucide-react';

interface SavedCode {
  name: string;
  code: string;
  createdAt: string;
}

interface SavedCodesMap {
  [slug: string]: SavedCode;
}

export default function HomePage() {
  const [savedCodes, setSavedCodes] = useState<SavedCodesMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedCodesJson = localStorage.getItem('savedCodes') || '{}';
      setSavedCodes(JSON.parse(savedCodesJson));
    } catch (error) {
      console.error('Error loading saved codes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const updatedCodes = { ...savedCodes };
        delete updatedCodes[slug];
        localStorage.setItem('savedCodes', JSON.stringify(updatedCodes));
        setSavedCodes(updatedCodes);
      } catch (error) {
        console.error('Error deleting code:', error);
        alert('Failed to delete code. Please try again.');
      }
    }
  };

  const handleView = (slug: string) => {
    router.push(`/renderer/${slug}`);
  };

  const handleCreateNew = () => {
    router.push('/renderer');
  };

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your HTML Snippets</h1>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New
          </button>
        </div>

        {Object.keys(savedCodes).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-700 mt-4">No saved snippets yet</h2>
            <p className="text-gray-500 mt-2">Create your first HTML snippet to get started</p>
            <button
              onClick={handleCreateNew}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Create New Snippet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(savedCodes).map(([slug, { name, createdAt }]) => (
              <div key={slug} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-between">
                  <button
                    onClick={() => handleDelete(slug, name)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(slug)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                      title="Edit snippet"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.open(`/renderer/${slug}`, '_blank')}
                      className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 