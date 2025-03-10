/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { ChevronRight } from "lucide-react";

interface CodeEditorProps {
	code: string;
	setCode: (code: string) => void;
	isCollapsed?: boolean;
	setIsCollapsed?: (collapsed: boolean) => void;
	className?: string;
}

export default function CodeEditor({ 
	code, 
	setCode, 
	isCollapsed = false, 
	setIsCollapsed = () => {}, 
	className = "w-1/2" 
}: CodeEditorProps) {
	const editorRef = useRef<any>(null);

	const removeNewlines = () => {
		setCode(
			code
				.replace(/\\n/g, "\n") // Convert \n string literals to actual newlines
				.replace(/\\"/g, '"') // Convert \" to "
				.replace(/\\'/g, "'")
		); // Convert \' to '
	};

	// Handle editor mounting and setup paste event listener
	const handleEditorDidMount: OnMount = (editor) => {
		editorRef.current = editor;
		
		// Add paste event listener to the editor's DOM node
		const editorDomNode = editor.getDomNode();
		if (editorDomNode) {
			editorDomNode.addEventListener('paste', () => {
				// Use setTimeout to let the paste complete first before processing
				setTimeout(() => {
					removeNewlines();
				}, 10);
			});
		}
	};

	if (isCollapsed) {
		return (
			<div className={`bg-blue-50 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
				<div 
					className="h-full flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors flex-col p-2"
					onClick={() => setIsCollapsed(false)}
				>
					<ChevronRight className="w-5 h-5 text-blue-600 mb-2" />
					<span className="text-blue-800 font-medium text-xs whitespace-nowrap transform rotate-90">Editor</span>
				</div>
			</div>
		);
	}

	return (
		<div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
			<div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-blue-800 font-semibold flex justify-between items-center">
				<div className="flex items-center">
					<button
						onClick={() => setIsCollapsed(true)}
						className="text-blue-600 mr-2 hover:bg-blue-100 p-1 rounded-md transition-colors"
						title="Collapse"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
					<span>HTML Editor</span>
				</div>
				<button
					onClick={removeNewlines}
					className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm text-white transition-colors"
					title="Remove escape sequences like \n to actual newlines"
				>
					Remove Newlines
				</button>
			</div>
			<Editor
				height="calc(100vh - 6rem)"
				defaultLanguage="html"
				value={code}
				onChange={(value) => setCode(value || "")}
				theme="vs-light"
				options={{
					minimap: { enabled: false },
					fontSize: 16,
					wordWrap: "on",
					lineNumbers: "on",
					automaticLayout: true,
				}}
				onMount={handleEditorDidMount}
			/>
		</div>
	);
}
