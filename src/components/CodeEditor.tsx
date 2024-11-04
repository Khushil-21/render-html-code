import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
	code: string;
	setCode: (code: string) => void;
}

export default function CodeEditor({ code, setCode }: CodeEditorProps) {
	const removeNewlines = () => {
		const cleanCode = code.replaceAll(/[\r\\n]+/g, "");

		setCode(cleanCode);
	};

	return (
		<div className="w-1/2 bg-gray-800 rounded-lg overflow-hidden">
			<div className="bg-gray-700 px-4 py-2 text-white font-semibold flex justify-between items-center">
				<span>HTML Editor</span>
				<button
					onClick={removeNewlines}
					className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
				>
					Remove Newlines
				</button>
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
					formatOnPaste: true,
					formatOnType: true,
				}}
			/>
		</div>
	);
}
