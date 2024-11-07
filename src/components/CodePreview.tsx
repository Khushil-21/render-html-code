import React, { useState, useMemo } from "react";
import PreviewModal from "./PreviewModal";

interface CodePreviewProps {
	code: string;
}

export default function CodePreview({ code }: CodePreviewProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Process the code to properly handle string literals
	const processedCode = useMemo(() => {
		return code
			.replace(/\\n/g, '\n')  // Convert \n string literals to actual newlines
			.replace(/\\"/g, '"')   // Convert \" to "
			.replace(/\\'/g, "'");  // Convert \' to '
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
						srcDoc={processedCode}
						title="preview"
						className="w-full h-full border-none"
					/>
				</div>
			</div>

			<PreviewModal
				code={processedCode}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
}
