import React from "react";

interface PreviewModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ code, isOpen, onClose }: PreviewModalProps) {
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
          srcDoc={code}
          title="preview-fullscreen"
          className="w-full h-full border-none"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
} 