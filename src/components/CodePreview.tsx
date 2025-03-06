import React, { useState, useEffect } from "react";
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

	if (isCollapsed) {
		return (
			<div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
				<div 
					className="h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
					onClick={() => setIsCollapsed(false)}
				>
					<ChevronLeft className="w-6 h-6 text-gray-600" />
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
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
				<div className="h-[calc(100vh-6rem)] bg-white">
					<iframe
						id="previewFrame"
						sandbox="allow-forms allow-pointer-lock allow-popups allow-scripts allow-same-origin"
						title="preview"
						className="w-full h-full border-none"
					/>
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
