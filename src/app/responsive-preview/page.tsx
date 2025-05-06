"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Laptop, Smartphone, Tablet, RefreshCw, FileText, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCode } from '@/context/CodeContext';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function ResponsivePreview() {
  const router = useRouter();
  const { code } = useCode();
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [currentFile, setCurrentFile] = useState("index.html");
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({
    "index.html": code,
    "about.html": "<html><head><title>About Page</title></head><body><h1>About Us</h1><p>This is a sample about page.</p><a href='index.html'>Home</a></body></html>",
    "contact.html": "<html><head><title>Contact Page</title></head><body><h1>Contact Us</h1><p>Email: example@example.com</p><a href='index.html'>Home</a></body></html>"
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Update files when code changes
  useEffect(() => {
    setFiles(prev => ({
      ...prev,
      "index.html": code
    }));
  }, [code]);
  
  // Handle refresh
  const handleRefresh = () => {
    if (iframeRef.current) {
      const currentContent = files[currentFile];
      iframeRef.current.srcdoc = currentContent;
    }
  };
  
  // Navigation handling
  useEffect(() => {
    const handleNavigation = (e: MessageEvent) => {
      if (e.data && e.data.action === 'navigate' && e.data.page && files[e.data.page]) {
        setCurrentFile(e.data.page);
      }
    };
    
    window.addEventListener('message', handleNavigation);
    return () => window.removeEventListener('message', handleNavigation);
  }, [files]);

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="w-full bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Top controls */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()} 
                className="mr-4 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium text-gray-800">Responsive Preview</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* File selector */}
              <div className="relative">
                <button 
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors text-gray-700"
                  onClick={() => setShowFileDropdown(!showFileDropdown)}
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline">{currentFile}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showFileDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48">
                    {Object.keys(files).map(filename => (
                      <button
                        key={filename}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          currentFile === filename ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => {
                          setCurrentFile(filename);
                          setShowFileDropdown(false);
                        }}
                      >
                        {filename}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Refresh button */}
              <button 
                onClick={handleRefresh}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Refresh preview"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Device tabs */}
          <div className="flex bg-gray-100 rounded-lg shadow-sm overflow-hidden self-center">
            <button 
              onClick={() => setActiveDevice('desktop')}
              className={`flex items-center px-4 py-2 text-sm ${
                activeDevice === 'desktop' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <Laptop className="w-4 h-4 mr-1" />
              Desktop
            </button>
            <button 
              onClick={() => setActiveDevice('tablet')}
              className={`flex items-center px-4 py-2 text-sm ${
                activeDevice === 'tablet' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <Tablet className="w-4 h-4 mr-1" />
              Tablet
            </button>
            <button 
              onClick={() => setActiveDevice('mobile')}
              className={`flex items-center px-4 py-2 text-sm ${
                activeDevice === 'mobile' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Device mockups - using flex-grow to fill available space */}
      <div className="flex-grow flex items-center justify-center overflow-hidden p-4">
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
                ref={iframeRef}
                srcDoc={files[currentFile]}
                sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                className="w-full flex-grow border-none"
                title="Desktop Preview"
                onLoad={(e) => {
                  try {
                    // Add navigation helper to the iframe
                    const iframe = e.currentTarget;
                    if (iframe.contentWindow) {
                      iframe.contentWindow.navigateTo = (page: string) => {
                        if (files[page]) {
                          window.postMessage({ action: 'navigate', page }, '*');
                        }
                      };
                      
                      // Update links to use the navigation function
                      const iframeDoc = iframe.contentDocument;
                      if (iframeDoc) {
                        const links = iframeDoc.querySelectorAll('a[href]');
                        links.forEach(link => {
                          const href = link.getAttribute('href');
                          if (href && files[href]) {
                            link.addEventListener('click', (e) => {
                              e.preventDefault();
                              iframe.contentWindow?.navigateTo?.(href);
                            });
                          }
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Could not set up iframe navigation:", error);
                  }
                }}
              />
            </div>
          </div>
        )}
        
        {/* Tablet mockup */}
        {activeDevice === 'tablet' && (
          <div className="w-full max-w-2xl h-full flex flex-col gap-2">
            <div className="text-center text-sm text-gray-700 font-medium">Tablet (768px)</div>
            <div className="border-[12px] border-gray-800 rounded-xl shadow-lg bg-white relative flex-grow flex flex-col overflow-hidden">
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-16 h-1.5 bg-gray-700 rounded-full"></div>
              <iframe 
                ref={iframeRef}
                srcDoc={files[currentFile]}
                sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                className="w-full flex-grow border-none"
                title="Tablet Preview"
                style={{ width: '768px', maxWidth: '100%' }}
                onLoad={(e) => {
                  try {
                    // Add navigation helper to the iframe
                    const iframe = e.currentTarget;
                    if (iframe.contentWindow) {
                      iframe.contentWindow.navigateTo = (page: string) => {
                        if (files[page]) {
                          window.postMessage({ action: 'navigate', page }, '*');
                        }
                      };
                      
                      // Update links to use the navigation function
                      const iframeDoc = iframe.contentDocument;
                      if (iframeDoc) {
                        const links = iframeDoc.querySelectorAll('a[href]');
                        links.forEach(link => {
                          const href = link.getAttribute('href');
                          if (href && files[href]) {
                            link.addEventListener('click', (e) => {
                              e.preventDefault();
                              iframe.contentWindow?.navigateTo?.(href);
                            });
                          }
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Could not set up iframe navigation:", error);
                  }
                }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-800 rounded-sm"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile mockup */}
        {activeDevice === 'mobile' && (
          <div className="w-full max-w-sm h-full flex flex-col gap-2">
            <div className="text-center text-sm text-gray-700 font-medium">Mobile (375px)</div>
            <div className="border-[16px] border-gray-800 rounded-[36px] shadow-lg bg-white relative flex-grow flex flex-col overflow-hidden">
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-24 h-6 bg-gray-800 rounded-b-xl flex items-center justify-center">
                <div className="w-12 h-2 bg-gray-700 rounded-full"></div>
              </div>
              <iframe 
                ref={iframeRef}
                srcDoc={files[currentFile]}
                sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                className="w-full flex-grow border-none rounded-xl"
                title="Mobile Preview"
                style={{ width: '375px', maxWidth: '100%' }}
                onLoad={(e) => {
                  try {
                    // Add navigation helper to the iframe
                    const iframe = e.currentTarget;
                    if (iframe.contentWindow) {
                      iframe.contentWindow.navigateTo = (page: string) => {
                        if (files[page]) {
                          window.postMessage({ action: 'navigate', page }, '*');
                        }
                      };
                      
                      // Update links to use the navigation function
                      const iframeDoc = iframe.contentDocument;
                      if (iframeDoc) {
                        const links = iframeDoc.querySelectorAll('a[href]');
                        links.forEach(link => {
                          const href = link.getAttribute('href');
                          if (href && files[href]) {
                            link.addEventListener('click', (e) => {
                              e.preventDefault();
                              iframe.contentWindow?.navigateTo?.(href);
                            });
                          }
                        });
                      }
                    }
                  } catch (error) {
                    console.error("Could not set up iframe navigation:", error);
                  }
                }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-10 h-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 