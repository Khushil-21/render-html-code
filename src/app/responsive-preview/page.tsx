"use client";

import React, { useState } from 'react';
import { ArrowLeft, Laptop, Smartphone, Tablet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCode } from '@/context/CodeContext';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function ResponsivePreview() {
  const router = useRouter();
  const { code } = useCode();
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 py-2 flex-shrink-0">
        {/* Navigation header */}
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        {/* Device tabs */}
        <div className="flex justify-center my-2">
          <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveDevice('desktop')}
              className={`flex items-center px-4 py-2 text-sm ${
                activeDevice === 'desktop' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              } transition-colors`}
            >
              <Laptop className="w-4 h-4 mr-1" />
              Desktop
            </button>
            <button 
              onClick={() => setActiveDevice('tablet')}
              className={`flex items-center px-6 py-3 ${
                activeDevice === 'tablet' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              } transition-colors`}
            >
              <Tablet className="w-5 h-5 mr-2" />
              Tablet
            </button>
            <button 
              onClick={() => setActiveDevice('mobile')}
              className={`flex items-center px-6 py-3 ${
                activeDevice === 'mobile' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              } transition-colors`}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Device mockups - using flex-grow to fill available space */}
      <div className="flex-grow flex items-center justify-center overflow-hidden px-4 pb-4">
        {/* Desktop mockup */}
        {activeDevice === 'desktop' && (
            <div className="w-full max-w-4xl h-full flex flex-col gap-2">
            <div className="text-center text-sm text-gray-700 font-medium">Desktop (1024px+)</div>
            <div className="border-4 border-gray-800 rounded-lg shadow-lg bg-white flex-grow flex flex-col overflow-hidden">
              <div className="w-full h-4 bg-gray-800 flex items-center flex-shrink-0">
                <div className="flex mx-2 space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              <iframe 
                srcDoc={code}
                sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                className="w-full flex-grow border-none"
                title="Desktop Preview"
              />
            </div>
          </div>
        )}
        
        {/* Tablet mockup */}
        {activeDevice === 'tablet' && (
          <div className="w-full max-w-2xl h-full flex flex-col gap-2">
            <div className="text-center text-sm text-gray-700 font-medium">Tablet (768px)</div>
            <div className="border-[8px] border-gray-800 rounded-xl shadow-lg bg-white relative flex-grow flex flex-col overflow-hidden">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-12 h-1 bg-gray-700 rounded-full"></div>
              <iframe 
                srcDoc={code}
                sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                className="w-full flex-grow border-none"
                title="Tablet Preview"
                style={{ width: '768px', maxWidth: '100%' }}
              />
              {/* <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-6 h-6 bg-gray-700 rounded-full"></div> */}
            </div>
          </div>
        )}
        
        {/* Mobile mockup */}
        {activeDevice === 'mobile' && (
          <div className="w-full max-w-sm h-full flex flex-col gap-2">
            <div className="text-center text-sm text-gray-700 font-medium">Mobile (375px)</div>
            <div className="border-[10px] border-gray-800 rounded-[32px] shadow-lg bg-white relative flex-grow flex flex-col overflow-hidden">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-7 bg-gray-800 rounded-b-xl"></div>
              <iframe 
                srcDoc={code}
                sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                className="w-full flex-grow border-none rounded-xl"
                title="Mobile Preview"
                style={{ width: '375px', maxWidth: '100%' }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-8 h-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 