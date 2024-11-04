import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
}

export default function CodeEditor({ code, setCode }: CodeEditorProps) {
  return (
    <div className="w-1/2 bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-700 px-4 py-2 text-white font-semibold">
        HTML Editor
      </div>
      <Editor
        height="calc(100vh - 6rem)"
        defaultLanguage="html"
        value={code}
        onChange={(value) => setCode(value || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          wordWrap: "on",
          lineNumbers: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
