import React, { useState, useEffect } from "react";
import PreviewModal from "./PreviewModal";

interface CodePreviewProps {
	code: string;
}

export default function CodePreview({ code }: CodePreviewProps) {
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

	return (
		<>
			<div className="w-1/2 bg-gray-800 rounded-lg overflow-hidden">
				<div className="bg-gray-700 px-4 py-2 text-white font-semibold flex justify-between items-center">
					<span>Preview</span>
					<button
						onClick={() => setIsModalOpen(true)}
						className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
					>
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
