import React, { useState, useEffect, useRef } from "react";
import PreviewModal from "./PreviewModal";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface CodePreviewProps {
	code: string;
	isCollapsed?: boolean;
	setIsCollapsed?: (collapsed: boolean) => void;
	className?: string;
}

export default function CodePreview({ 
	code, 
	isCollapsed = false, 
	setIsCollapsed = () => {}, 
	className = "w-1/2" 
}: CodePreviewProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const animationContainerRef = useRef<HTMLDivElement>(null);
	const isEmptyHtml = !code.trim() || code.trim() === "<!DOCTYPE html><html><head><title>My HTML</title></head><body></body></html>";

	useEffect(() => {
		const iframe = document.getElementById("previewFrame") as HTMLIFrameElement;
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
	}, [code]);

	// Animation effect for empty state
	useEffect(() => {
		if (isEmptyHtml && animationContainerRef.current) {
			const container = animationContainerRef.current;
			const typeText = async (element: HTMLElement, text: string, speed: number) => {
				for (let i = 0; i < text.length; i++) {
					if (element) {
						element.textContent += text.charAt(i);
						await new Promise(resolve => setTimeout(resolve, speed));
					}
				}
			};

			const startCodeAnimation = async () => {
				// Clear any existing animation
				while (container.firstChild) {
					container.removeChild(container.firstChild);
				}

				// Create animation elements
				const codeBlock = document.createElement('div');
				codeBlock.className = 'font-mono bg-gray-800 text-white rounded-lg p-6 shadow-lg max-w-2xl w-full relative overflow-hidden';
				
				const cursor = document.createElement('span');
				cursor.className = 'inline-block w-2 h-5 bg-white ml-1 animate-pulse';
				
				const codeContent = document.createElement('span');
				codeContent.textContent = '';
				
				codeBlock.appendChild(codeContent);
				codeBlock.appendChild(cursor);
				container.appendChild(codeBlock);

				// Typing animation
				await typeText(codeContent, '<!DOCTYPE html>', 50);
				await new Promise(resolve => setTimeout(resolve, 200));
				await typeText(codeContent, '\n<html>', 50);
				await new Promise(resolve => setTimeout(resolve, 200));
				await typeText(codeContent, '\n  <head>', 50);
				await new Promise(resolve => setTimeout(resolve, 150));
				await typeText(codeContent, '\n    <title>Hello World</title>', 30);
				await new Promise(resolve => setTimeout(resolve, 150));
				await typeText(codeContent, '\n  </head>', 50);
				await new Promise(resolve => setTimeout(resolve, 200));
				await typeText(codeContent, '\n  <body>', 50);
				await new Promise(resolve => setTimeout(resolve, 300));
				await typeText(codeContent, '\n    <h1>Welcome!</h1>', 30);
				await new Promise(resolve => setTimeout(resolve, 200));
				await typeText(codeContent, '\n    <p>Write or paste HTML code to see it rendered here...</p>', 20);
				await new Promise(resolve => setTimeout(resolve, 300));
				await typeText(codeContent, '\n  </body>', 50);
				await new Promise(resolve => setTimeout(resolve, 150));
				await typeText(codeContent, '\n</html>', 50);
				
				// Add message after typing completes
				await new Promise(resolve => setTimeout(resolve, 500));
				const message = document.createElement('div');
				message.className = 'text-center mt-6 text-indigo-500 font-semibold animate-bounce';
				message.textContent = '✨ Start typing to see your HTML come to life! ✨';
				container.appendChild(message);
			};

			startCodeAnimation();
		}
	}, [isEmptyHtml]);

	if (isCollapsed) {
		return (
			<div className={`bg-indigo-50 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
				<div 
					className="h-full flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors"
					onClick={() => setIsCollapsed(false)}
				>
					<ChevronLeft className="w-6 h-6 text-gray-600" />
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={`bg-indigo-50 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
				<div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-indigo-800 font-semibold flex justify-between items-center">
					<div className="flex items-center">
						<button
							onClick={() => setIsCollapsed(true)}
							className="text-indigo-600 mr-2 hover:bg-indigo-100 p-1 rounded-md transition-colors"
							title="Collapse"
						>
							<ChevronRight className="w-5 h-5" />
						</button>
						<span>Preview</span>
					</div>
					<button
						onClick={() => setIsModalOpen(true)}
						className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md text-sm text-white transition-colors flex items-center"
					>
						<Maximize2 className="w-4 h-4 mr-1" />
						Fullscreen
					</button>
				</div>
				<div className="h-[calc(100vh-6rem)] bg-white relative">
					{isEmptyHtml ? (
						<div 
							ref={animationContainerRef}
							className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50"
						/>
					) : (
						<iframe
							id="previewFrame"
							sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
							title="preview"
							className="w-full h-full border-none"
						/>
					)}
				</div>
			</div>

			<PreviewModal
				code={code}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}
