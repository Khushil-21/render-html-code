"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, FileText, Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function MultiRendererSlug() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [currentFile, setCurrentFile] = useState<string>("index.html");
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('HTML Preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (!slug) return;
    
    try {
      // Get saved code from localStorage
      const savedCodesJson = localStorage.getItem('savedCodes');
      if (!savedCodesJson) {
        setError('No saved codes found');
        setIsLoading(false);
        return;
      }
      
      const savedCodes = JSON.parse(savedCodesJson);
      const savedCode = savedCodes[slug as string];
      
      if (!savedCode) {
        setError(`Code with slug "${slug}" not found`);
        setIsLoading(false);
        return;
      }
      
      setTitle(savedCode.name || 'HTML Preview');
      
      // Check if this is multi-page content
      if (savedCode.isMultiPage) {
        try {
          // Try to parse as JSON to extract multiple HTML files
          const parsedCode = JSON.parse(savedCode.code);
          
          if (parsedCode.parsed_files && parsedCode.parsed_files.html) {
            const htmlFiles: Record<string, string> = {};
            
            if (Array.isArray(parsedCode.parsed_files.html)) {
              parsedCode.parsed_files.html.forEach((file: any) => {
                if (file.filename && file.content) {
                  htmlFiles[file.filename] = file.content;
                }
              });
            } else if (typeof parsedCode.parsed_files.html === 'object') {
              Object.entries(parsedCode.parsed_files.html).forEach(([filename, content]) => {
                htmlFiles[filename] = content as string;
              });
            }
            
            if (Object.keys(htmlFiles).length > 0) {
              setFiles(htmlFiles);
              setCurrentFile(Object.keys(htmlFiles)[0]);
              setIsLoading(false);
              return;
            }
          } else if (parsedCode.html) {
            // Alternative structure
            const htmlFiles: Record<string, string> = {};
            
            if (Array.isArray(parsedCode.html)) {
              parsedCode.html.forEach((file: any) => {
                if (file.filename && file.content) {
                  htmlFiles[file.filename] = file.content;
                }
              });
            } else if (typeof parsedCode.html === 'object') {
              Object.entries(parsedCode.html).forEach(([filename, content]) => {
                htmlFiles[filename] = content as string;
              });
            }
            
            if (Object.keys(htmlFiles).length > 0) {
              setFiles(htmlFiles);
              setCurrentFile(Object.keys(htmlFiles)[0]);
              setIsLoading(false);
              return;
            }
          }
        } catch (parseError) {
          console.error("Error parsing multi-page content:", parseError);
        }
      }
      
      // Fallback: If not multi-page or JSON parsing failed, treat as single HTML file
      setFiles({
        "index.html": savedCode.code
      });
      setCurrentFile("index.html");
      setIsLoading(false);
      
    } catch (err) {
      console.error("Error loading saved code:", err);
      setError('Failed to load the saved code');
      setIsLoading(false);
    }
  }, [slug]);

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
        
        // Try to add navigation handler to the iframe
        try {
          const iframeWindow = iframeRef.current?.contentWindow;
          if (iframeWindow) {
            // Set up navigation function
            iframeWindow.navigateTo = (page: string) => {
              window.postMessage({ action: 'navigate', page }, '*');
            };
            
            // Update links to use the navigation function
            const iframeDoc = iframeRef.current.contentDocument;
            if (iframeDoc) {
              const links = iframeDoc.querySelectorAll('a[href]');
              links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && files[href]) {
                  link.addEventListener('click', (e) => {
                    e.preventDefault();
                    iframeWindow.navigateTo?.(href);
                  });
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

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 rounded-lg p-6 max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/" className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')} 
              className="mr-4 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-800">{title}</h1>
          </div>
          
          {/* File selector - only show if multiple files */}
          {Object.keys(files).length > 1 && (
            <div className="relative">
              <button 
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors text-gray-700"
                onClick={() => setShowFileDropdown(!showFileDropdown)}
              >
                <FileText className="w-4 h-4 text-gray-500" />
                <span>{currentFile}</span>
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
          )}
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
    </div>
  );
} 