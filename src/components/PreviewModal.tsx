import React, { useEffect } from "react";

interface PreviewModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ code, isOpen, onClose }: PreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      const iframe = document.getElementById("liveFrame") as HTMLIFrameElement;
      if (iframe) {
        // Set srcdoc first to ensure same-origin
        iframe.srcdoc = code;
        
        // Wait for iframe to load before accessing document
        iframe.onload = () => {
          const iframeDoc = iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(code);
            iframeDoc.close();
          }
        };
      }
    }
  }, [code, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-lg overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
        <iframe
          id="liveFrame"
          sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
          title="preview"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
