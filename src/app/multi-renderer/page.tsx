"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, FileText, FileJson } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCode } from '@/context/CodeContext';
import JsonToCodeModal from '@/components/JsonToCodeModal';

export default function MultiRenderer() {
  const router = useRouter();
  const { code } = useCode();
  const [currentFile, setCurrentFile] = useState("index.html");
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Function to extract HTML files from parsed JSON
  const parseJsonToFiles = (jsonData: any) => {
    try {
      // Handle different formats of HTML files in the JSON
      if (jsonData.parsed_files && jsonData.parsed_files.html) {
        const htmlFiles: Record<string, string> = {};
        
        if (Array.isArray(jsonData.parsed_files.html)) {
          jsonData.parsed_files.html.forEach((file: any) => {
            if (file.filename && file.content) {
              htmlFiles[file.filename] = file.content;
            }
          });
        } else if (typeof jsonData.parsed_files.html === 'object') {
          Object.entries(jsonData.parsed_files.html).forEach(([filename, content]) => {
            htmlFiles[filename] = content as string;
          });
        }
        
        if (Object.keys(htmlFiles).length > 0) {
          setFiles(htmlFiles);
          setCurrentFile(Object.keys(htmlFiles)[0]);
          return true;
        }
      } else if (jsonData.html) {
        // Alternative structure
        const htmlFiles: Record<string, string> = {};
        
        if (Array.isArray(jsonData.html)) {
          jsonData.html.forEach((file: any) => {
            if (file.filename && file.content) {
              htmlFiles[file.filename] = file.content;
            }
          });
        } else if (typeof jsonData.html === 'object') {
          Object.entries(jsonData.html).forEach(([filename, content]) => {
            htmlFiles[filename] = content as string;
          });
        }
        
        if (Object.keys(htmlFiles).length > 0) {
          setFiles(htmlFiles);
          setCurrentFile(Object.keys(htmlFiles)[0]);
          return true;
        }
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    return false;
  };
  
  // Process input code on component mount and when code changes
  useEffect(() => {
    // Try to parse code as JSON first
    try {
      if (code.trim().startsWith('{')) {
        const jsonData = JSON.parse(code);
        if (parseJsonToFiles(jsonData)) {
          return; // Successfully parsed JSON, no need to continue
        }
      }
    } catch (e) {
      // Not valid JSON or couldn't extract HTML files
    }
    
    // If not JSON or couldn't extract multiple files, treat as single HTML file
    setFiles({
      "index.html": code
    });
    setCurrentFile("index.html");
  }, [code]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation handling between pages
  useEffect(() => {
    const handleNavigation = (e: MessageEvent) => {
      if (e.data && e.data.action === 'navigate' && e.data.page && files[e.data.page]) {
        setCurrentFile(e.data.page);
      }
    };
    
    window.addEventListener('message', handleNavigation);
    return () => window.removeEventListener('message', handleNavigation);
  }, [files]);

  // Render the current file in the iframe
  useEffect(() => {
    if (!iframeRef.current || !files[currentFile]) return;
    
    try {
      // Create a blob URL for better script execution
      const htmlBlob = new Blob([files[currentFile]], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(htmlBlob);
      
      // Set the iframe src
      iframeRef.current.src = blobUrl;
      
      // Clean up the blob URL after the iframe has loaded
      iframeRef.current.onload = () => {
        URL.revokeObjectURL(blobUrl);
        
        // Try to add navigation handler to the iframe content
        try {
          const iframeWindow = iframeRef.current?.contentWindow;
          if (iframeWindow) {
            // Set up navigation function on the window object
            iframeWindow.navigateTo = (page: string) => {
              window.postMessage({ action: 'navigate', page }, '*');
            };
            
            // Add listener to all links in the iframe
            const iframeDoc = iframeRef.current.contentDocument;
            if (iframeDoc) {
              iframeDoc.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const link = target.closest('a');
                if (link) {
                  const href = link.getAttribute('href');
                  if (href && files[href] && !href.startsWith('http') && !href.startsWith('#')) {
                    e.preventDefault();
                    iframeWindow.navigateTo?.(href);
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error("Could not set up iframe navigation:", error);
        }
      };
    } catch (error) {
      console.error("Error rendering content in iframe:", error);
    }
  }, [currentFile, files]);

  return (
    <div className="h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-4 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-800">Multi-file Preview</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* JSON to Code button */}
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-md transition-colors text-amber-800"
            >
              <FileJson className="w-4 h-4" />
              <span>JSON to Code</span>
            </button>
            
            {/* File selector - only show if multiple files */}
            {Object.keys(files).length > 1 && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors text-gray-700"
                  onClick={() => setShowFileDropdown(!showFileDropdown)}
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{currentFile}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showFileDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48 max-h-96 overflow-y-auto">
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
            )}
          </div>
        </div>
      </header>
      
      {/* Preview area */}
      <div className="flex-grow bg-gray-200 p-4">
        <div className="h-full bg-white mx-auto rounded-lg shadow-md overflow-hidden">
          <iframe
            ref={iframeRef}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            className="w-full h-full border-none"
            title="Multi-file Preview"
          />
        </div>
      </div>
      
      {/* JSON to Code Modal */}
      <JsonToCodeModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />
    </div>
  );
} 