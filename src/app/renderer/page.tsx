"use client";

import { useEffect, useRef, useState } from "react";
import { useCode } from "@/context/CodeContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";

export default function RendererPage() {
  const { code, setCode } = useCode();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [inputCode, setInputCode] = useState(code);

  // Update input code when code context changes
  useEffect(() => {
    setInputCode(code);
  }, [code]);

  // Handle code update
  const handleRenderClick = () => {
    setCode(inputCode);
  };

  // Render HTML content in iframe
  useEffect(() => {
    if (!iframeRef.current || !code) return;
    
    try {
      // Create a blob URL for better script execution
      const htmlBlob = new Blob([code], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(htmlBlob);
      
      // Set the iframe src
      iframeRef.current.src = blobUrl;
      
      // Clean up the blob URL after the iframe has loaded
      iframeRef.current.onload = () => {
        URL.revokeObjectURL(blobUrl);
        
        // For multi-page sites, we should redirect to multi-renderer
        try {
          if (code.trim().startsWith('{')) {
            const jsonData = JSON.parse(code);
            if (
              (jsonData.parsed_files && jsonData.parsed_files.html) || 
              (jsonData.html && 
                (Array.isArray(jsonData.html) || typeof jsonData.html === 'object'))
            ) {
              // This is multi-page content - redirect to multi-renderer
              router.push('/multi-renderer');
            }
          }
        } catch (e) {
          // Not JSON or couldn't parse, continue with single-page rendering
        }
      };
    } catch (error) {
      console.error("Error rendering content in iframe:", error);
    }
  }, [code, router]);

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
            <h1 className="text-lg font-medium text-gray-800">HTML Preview</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRenderClick}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Render</span>
            </button>
            <button
              onClick={() => router.push('/multi-renderer')}
              className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md text-sm transition-colors"
            >
              Multi-page View
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Code input area */}
        <div className="w-1/2 h-full p-4 overflow-hidden flex flex-col">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Paste your HTML or JSON code here:
          </div>
          <textarea
            className="flex-1 w-full p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter HTML or paste JSON with HTML files..."
            spellCheck="false"
          />
        </div>
        
        {/* Preview area */}
        <div className="w-1/2 bg-gray-200 p-4 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-md overflow-hidden">
            <iframe
              ref={iframeRef}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              className="w-full h-full border-none"
              title="HTML Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 