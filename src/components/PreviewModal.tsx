import React, { useEffect, useState } from "react";

interface PreviewModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ code, isOpen, onClose }: PreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  

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

      // Request fullscreen when modal opens
      const previewContainer = document.getElementById("previewContainer");
      if (previewContainer && !isFullscreen) {
        try {
          previewContainer.requestFullscreen()
            .then(() => setIsFullscreen(true))
            .catch(err => console.error("Error attempting to enable fullscreen:", err));
        } catch (err) {
          console.error("Error attempting to enable fullscreen:", err);
        }
      }
    }

    // Exit fullscreen when modal closes
    return () => {
      if (isFullscreen && document.fullscreenElement) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error("Error attempting to exit fullscreen:", err));
      }
    };
  }, [code, isOpen, isFullscreen]);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="previewContainer"
      className="fixed inset-0 bg-white z-50 flex flex-col"
   
    >

      <iframe
        id="liveFrame"
        sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
        title="preview"
        className="w-full h-full border-none"
      />
    </div>
  );
}
