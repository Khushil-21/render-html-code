"use client";

import React, { useState } from "react";
import { X, ArrowRightCircle } from "lucide-react";
import { useCode } from "@/context/CodeContext";
import { useRouter } from "next/navigation";

interface JsonToCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JsonToCodeModal({ isOpen, onClose }: JsonToCodeModalProps) {
  const { setCode } = useCode();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setError(null);
      setProcessingStatus('processing');
      const jsonData = JSON.parse(jsonText);
      
      // Check if this contains multiple HTML files
      let isMultiPageContent = false;
      let htmlContent = "";
      let multiPageFiles: Record<string, string> = {};
      
      // Extract HTML content from parsed_files.html
      if (jsonData.parsed_files && jsonData.parsed_files.html) {
        if (Array.isArray(jsonData.parsed_files.html)) {
          // If there are multiple files, it's multi-page
          if (jsonData.parsed_files.html.length > 1) {
            isMultiPageContent = true;
            
            // Create a map of all HTML files
            jsonData.parsed_files.html.forEach((file: any) => {
              if (file.filename && file.content) {
                multiPageFiles[file.filename] = file.content;
              }
            });
            
            // Use index.html or first file for single-page preview
            const indexFile = jsonData.parsed_files.html.find((file: any) => file.filename === "index.html");
            htmlContent = indexFile ? indexFile.content : jsonData.parsed_files.html[0].content;
          } else if (jsonData.parsed_files.html.length === 1) {
            // Single HTML file
            htmlContent = jsonData.parsed_files.html[0].content;
          } else {
            throw new Error("No HTML content found in the JSON");
          }
        } else if (typeof jsonData.parsed_files.html === "object") {
          // Object format with filename keys
          const htmlFiles = Object.keys(jsonData.parsed_files.html);
          
          if (htmlFiles.length > 1) {
            isMultiPageContent = true;
            
            // Create a map of all HTML files
            htmlFiles.forEach(filename => {
              multiPageFiles[filename] = jsonData.parsed_files.html[filename];
            });
            
            // Use index.html or first file for single-page preview
            htmlContent = jsonData.parsed_files.html["index.html"] || 
                          jsonData.parsed_files.html[htmlFiles[0]];
          } else if (htmlFiles.length === 1) {
            htmlContent = jsonData.parsed_files.html[htmlFiles[0]];
          } else {
            throw new Error("No HTML content found in the JSON");
          }
        }
      } else if (jsonData.html) {
        // Alternative structure with "html" at root level
        if (Array.isArray(jsonData.html)) {
          if (jsonData.html.length > 1) {
            isMultiPageContent = true;
            
            jsonData.html.forEach((file: any) => {
              if (file.filename && file.content) {
                multiPageFiles[file.filename] = file.content;
              }
            });
            
            const indexFile = jsonData.html.find((file: any) => file.filename === "index.html");
            htmlContent = indexFile ? indexFile.content : jsonData.html[0].content;
          } else if (jsonData.html.length === 1) {
            htmlContent = jsonData.html[0].content;
          } else {
            throw new Error("No HTML content found in the JSON");
          }
        } else if (typeof jsonData.html === "object") {
          const htmlFiles = Object.keys(jsonData.html);
          
          if (htmlFiles.length > 1) {
            isMultiPageContent = true;
            
            htmlFiles.forEach(filename => {
              multiPageFiles[filename] = jsonData.html[filename];
            });
            
            htmlContent = jsonData.html["index.html"] || jsonData.html[htmlFiles[0]];
          } else if (htmlFiles.length === 1) {
            htmlContent = jsonData.html[htmlFiles[0]];
          } else {
            throw new Error("No HTML content found in the JSON");
          }
        }
      } else if (jsonData.content) {
        // Direct content field
        htmlContent = jsonData.content;
      } else {
        throw new Error("Invalid JSON format. Could not find HTML content");
      }
      
      if (!htmlContent) {
        throw new Error("No HTML content could be extracted");
      }
      
      // Set state for UI updates
      setIsMultiPage(isMultiPageContent);
      
      // Save to local storage with a temporary name
      const timestamp = new Date().getTime();
      const tempSlug = `json-import-${timestamp}`;
      const tempName = isMultiPageContent ? "Imported Multi-page HTML" : "Imported HTML";
      
      // Get existing codes
      const savedCodesJson = localStorage.getItem('savedCodes') || '{}';
      const savedCodes = JSON.parse(savedCodesJson);
      
      // Save the code - if multi-page, save the entire JSON structure
      savedCodes[tempSlug] = {
        name: tempName,
        code: isMultiPageContent ? jsonText : htmlContent,
        createdAt: new Date().toISOString(),
        isMultiPage: isMultiPageContent
      };
      
      // Save back to localStorage
      localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
      
      // Update the context for single-page view
      if (!isMultiPageContent) {
        setCode(htmlContent);
      }
      
      setProcessingStatus('success');
      
      // Short delay to show success state before redirecting
      setTimeout(() => {
        onClose();
        
        // Navigate to the appropriate viewer
        if (isMultiPageContent) {
          router.push(`/multi-renderer/${tempSlug}`);
        } else {
          router.push(`/renderer/${tempSlug}`);
        }
      }, 800);
      
    } catch (err) {
      setProcessingStatus('idle');
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">JSON to Code Converter</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="mb-4 text-gray-600">
            Paste your JSON content below. The system will extract HTML code from it and detect whether it contains multi-page content.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {processingStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
              <span className="mr-2">✓</span> 
              Successfully processed {isMultiPage ? 'multi-page' : 'single-page'} HTML content. Redirecting...
            </div>
          )}
          
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
            placeholder='{"parsed_files": {"html": [{"filename": "index.html", "content": "<!DOCTYPE html><html>...</html>"}]}}'
            disabled={processingStatus === 'processing' || processingStatus === 'success'}
          />
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={processingStatus === 'processing'}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={!jsonText.trim() || processingStatus === 'processing' || processingStatus === 'success'}
            >
              {processingStatus === 'processing' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : processingStatus === 'success' ? (
                <>
                  <span className="mr-2">✓</span>
                  Success
                </>
              ) : (
                <>
                  <ArrowRightCircle className="w-4 h-4 mr-2" />
                  Extract & View
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 