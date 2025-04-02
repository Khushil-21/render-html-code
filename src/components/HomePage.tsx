"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, ExternalLink, Plus, Code, Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    try {
      const savedCodesJson = localStorage.getItem('savedCodes') || '{}';
      setSavedCodes(JSON.parse(savedCodesJson));
    } catch (error) {
      console.error('Error loading saved codes:', error);
    } finally {
      // Add a small delay to make the loading animation visible
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
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

  const filteredCodes = Object.entries(savedCodes).filter(
    ([_, { name }]) => name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <div className="flex flex-col animate-pulse">
            <div className="h-2 w-24 bg-blue-400 rounded mb-2"></div>
            <div className="h-2 w-16 bg-blue-300 rounded"></div>
          </div>
        </div>
        <p className="text-blue-600 font-medium mt-4 animate-pulse">Loading your snippets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute left-1/4 top-1/3 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
            HTML Code <span className="text-blue-200">Snippets</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mb-8 animate-fade-in animation-delay-200">
            Create, edit, and preview your HTML snippets with a beautiful live editor. Access your creations anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-400">
            <button
              onClick={handleCreateNew}
              className="group bg-white hover:bg-blue-50 text-blue-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create New Snippet
            </button>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Collection</h2>
          
          {Object.keys(savedCodes).length > 0 && (
            <div className="w-full md:w-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search snippets..."
                className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {Object.keys(savedCodes).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center transition-all duration-500 animate-scale-in hover:shadow-2xl border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-6 animate-float">
              <Code className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No saved snippets yet</h2>
            <p className="text-gray-500 mb-8">Create your first HTML snippet and see it here</p>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Start Creating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map(([slug, { name, createdAt }], index) => (
              <div 
                key={slug} 
                className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{name}</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Created on {new Date(createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <button
                    onClick={() => handleDelete(slug, name)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-all duration-200"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(slug)}
                      className="text-gray-400 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-all duration-200"
                      title="Edit snippet"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => window.open(`/renderer/${slug}`, '_blank')}
                      className="text-gray-400 hover:text-green-600 p-2 rounded-md hover:bg-green-50 transition-all duration-200"
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