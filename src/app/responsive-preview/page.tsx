"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCode } from '@/context/CodeContext';

export default function ResponsivePreview() {
  const router = useRouter();
  const { code } = useCode();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Editor
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Responsive Preview</h1>
        </div>

        {/* Device mockups */}
        <div className="flex flex-col items-center gap-12">
          {/* Desktop mockup */}
          <div className="w-full max-w-6xl">
            <div className="text-center mb-2 text-gray-700 font-medium">Desktop (1024px+)</div>
            <div className="border-8 border-gray-800 rounded-lg shadow-lg bg-white">
              <div className="w-full h-6 bg-gray-800 flex items-center">
                <div className="flex mx-2 space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <iframe 
                srcDoc={code}
                className="w-full h-[550px] border-none"
                title="Desktop Preview"
              />
            </div>
          </div>
          
          {/* Tablet mockup */}
          <div className="w-full max-w-3xl">
            <div className="text-center mb-2 text-gray-700 font-medium">Tablet (768px)</div>
            <div className="border-[12px] border-gray-800 rounded-xl shadow-lg bg-white relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-16 h-1 bg-gray-700 rounded-full"></div>
              <iframe 
                srcDoc={code}
                className="w-full h-[600px] border-none"
                title="Tablet Preview"
                style={{ width: '768px', maxWidth: '100%' }}
              />
      
            </div>
          </div>
          
          {/* Mobile mockup */}
          <div className="w-full max-w-sm">
            <div className="text-center mb-2 text-gray-700 font-medium">Mobile (375px)</div>
            <div className="border-[14px] border-gray-800 rounded-[32px] shadow-lg bg-white relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-6 bg-gray-800 rounded-b-xl"></div>
              <iframe 
                srcDoc={code}
                className="w-full h-[600px] border-none rounded-xl"
                title="Mobile Preview"
                style={{ width: '375px', maxWidth: '100%' }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-10 h-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 