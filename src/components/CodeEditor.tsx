/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { ChevronRight, Save, List, ChevronDown, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import SaveCodeModal from "./SaveCodeModal";

interface CodeEditorProps {
	code: string;
	setCode: (code: string) => void;
	isCollapsed?: boolean;
	setIsCollapsed?: (collapsed: boolean) => void;
	className?: string;
	availableFiles?: string[];
	handleFileChange?: (filename: string) => void;
}

export default function CodeEditor({ 
	code, 
	setCode, 
	isCollapsed = false, 
	setIsCollapsed = () => {}, 
	className = "w-1/2",
	availableFiles = ["index.html"],
	handleFileChange = () => {}
}: CodeEditorProps) {
	const editorRef = useRef<any>(null);
	const router = useRouter();
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [currentFile, setCurrentFile] = useState(availableFiles[0] || "index.html");
	const [showFileDropdown, setShowFileDropdown] = useState(false);
	const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const settingsDropdownRef = useRef<HTMLDivElement>(null);

	// Update current file when availableFiles changes
	useEffect(() => {
		if (availableFiles.length > 0 && !availableFiles.includes(currentFile)) {
			setCurrentFile(availableFiles[0]);
			handleFileChange(availableFiles[0]);
		}
	}, [availableFiles, currentFile, handleFileChange]);

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

	// Close dropdown when clicking outside
	useEffect(() => {
		if (!showFileDropdown && !showSettingsDropdown) return;
		
		const handleClickOutside = (event: MouseEvent) => {
			if (showFileDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowFileDropdown(false);
			}
			if (showSettingsDropdown && settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
				setShowSettingsDropdown(false);
			}
		};
		
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showFileDropdown, showSettingsDropdown]);

	const handleSaveCode = () => {
		setIsSaveModalOpen(true);
	};

	const handleViewCodes = () => {
		router.push('/');
	};

	const handleFileSelect = (filename: string) => {
		setCurrentFile(filename);
		setShowFileDropdown(false);
		handleFileChange(filename);
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
		<>
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
						
						{/* File selector dropdown */}
						{availableFiles.length > 1 && (
							<div className="relative ml-3">
								<button
									onClick={() => setShowFileDropdown(!showFileDropdown)}
									className="bg-white border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded-md text-sm text-gray-700 transition-colors flex items-center"
								>
									{currentFile}
									<ChevronDown className="w-4 h-4 ml-1" />
								</button>
								
								{showFileDropdown && (
									<div 
										ref={dropdownRef}
										className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10 w-48"
									>
										{availableFiles.map(file => (
											<div 
												key={file} 
												className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${currentFile === file ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
												onClick={() => handleFileSelect(file)}
											>
												{file}
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
					<div className="flex gap-2">
						{/* Settings dropdown */}
						<div className="relative">
							<button
								onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
								className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md text-gray-700 transition-colors"
								title="Settings"
							>
								<Settings className="w-4 h-4" />
							</button>
							
							{showSettingsDropdown && (
								<div 
									ref={settingsDropdownRef}
									className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10 w-48"
								>
									<div 
										className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-700"
										onClick={() => {
											removeNewlines();
											setShowSettingsDropdown(false);
										}}
									>
										Remove Escape Sequences
									</div>
								</div>
							)}
						</div>
						
						<button
							onClick={handleSaveCode}
							className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm text-white transition-colors flex items-center"
							title="Save code to local storage"
						>
							<Save className="w-4 h-4 mr-1" />
							Save Code
						</button>
						
						<button
							onClick={handleViewCodes}
							className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-sm text-white transition-colors flex items-center"
							title="View saved codes"
						>
							<List className="w-4 h-4 mr-1" />
							View Codes
						</button>
					</div>
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
			
			<SaveCodeModal 
				isOpen={isSaveModalOpen} 
				onClose={() => setIsSaveModalOpen(false)}
				code={code}
				isMultiPage={availableFiles.length > 1}
			/>
		</>
	);
}
