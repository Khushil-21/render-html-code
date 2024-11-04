import React from "react";

interface CodePreviewProps {
  code: string;
}

export default function CodePreview({ code }: CodePreviewProps) {
  return (
    <div className="w-1/2 bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-700 px-4 py-2 text-white font-semibold">
        Preview
      </div>
      <div className="h-[calc(100vh-6rem)] bg-white">
        <iframe
          srcDoc={code}
          title="preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
