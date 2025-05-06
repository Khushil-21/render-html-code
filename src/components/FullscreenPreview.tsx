"use client";
import React, { useState, useEffect, useRef } from "react";
import { LucideX, LucideRefreshCw, LucideFileText, LucideChevronDown } from "lucide-react";

// Simple tooltip component
interface TooltipProps {
  title: string;
  placement?: "left" | "right" | "top" | "bottom";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ title, placement = "top", children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      {showTooltip && (
        <div className={`absolute ${
          placement === "left" ? "right-full mr-2" : 
          placement === "right" ? "left-full ml-2" : 
          placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
        } bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50`}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

// Device icon components
const MonitorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const TabletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

interface HtmlFile {
  filename: string;
  content: string;
}

interface JsonOutput {
  parsed_files?: {
    html?: HtmlFile[] | Record<string, string>;
  };
  html?: HtmlFile[] | Record<string, string>;
  content?: string;
}

interface FullscreenPreviewProps {
  output: JsonOutput | string;
  onClose: () => void;
  initialPage?: string;
}

// Extend Window interface to include custom navigation method
declare global {
  interface Window {
    navigateTo?: (page: string) => void;
  }
}

export default function FullscreenPreview({ output, onClose, initialPage = "index.html" }: FullscreenPreviewProps) {
	const [deviceType, setDeviceType] = useState("Desktop");
	const [controlsVisible, setControlsVisible] = useState(true);
	const [showFileDropdown, setShowFileDropdown] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [availableFiles, setAvailableFiles] = useState<string[]>([]);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Get device size class based on selected device type
	const getDeviceSize = () => {
		switch (deviceType) {
			case "tablet":
				return "w-[65%] mx-auto";
			case "mobile":
				return "w-[30%] mx-auto";
			default:
				return "w-full";
		}
	};

	// Extract available files from output
	useEffect(() => {
		if (!output) return;

		let files: string[] = [];
		if (typeof output === 'object') {
			if (output.parsed_files && output.parsed_files.html) {
				if (Array.isArray(output.parsed_files.html)) {
					files = output.parsed_files.html.map((file: HtmlFile) => file.filename);
				} else {
					files = Object.keys(output.parsed_files.html);
				}
			} else if (output.html) {
				if (Array.isArray(output.html)) {
					files = output.html.map((file: HtmlFile) => file.filename);
				} else {
					files = Object.keys(output.html);
				}
			}
		}
		
		if (files.length === 0 && typeof output === 'string') {
			// If output is just a single HTML content string, create a default index.html
			files = ["index.html"];
		}
		
		setAvailableFiles(files);
	}, [output]);

	// Handle navigation between pages in the preview
	const handleIframeNavigation = (event: MessageEvent) => {
		if (event.data && event.data.action === 'navigate' && event.data.page) {
			// Set the current page but don't show controls
			setCurrentPage(event.data.page);
			
			// Keep controls hidden for better user experience
			setControlsVisible(false);
		}
	};

	// Add event listener for iframe messages
	useEffect(() => {
		window.addEventListener('message', handleIframeNavigation);
		return () => {
			window.removeEventListener('message', handleIframeNavigation);
		};
	}, []);

	// Get the content for the current page
	const getCurrentPageContent = () => {
		if (!output) return null;

		// If output is a string, return it directly
		if (typeof output === 'string') {
			return output;
		}

		// Try to find the content in the output structure
		if (output.parsed_files && output.parsed_files.html) {
			if (Array.isArray(output.parsed_files.html)) {
				const pageFile = output.parsed_files.html.find(
					(file: HtmlFile) => file.filename === currentPage
				);
				return pageFile?.content;
			} else {
				return (output.parsed_files.html as Record<string, string>)[currentPage];
			}
		} else if (output.html) {
			if (Array.isArray(output.html)) {
				const pageFile = output.html.find(
					(file: HtmlFile) => file.filename === currentPage
				);
				return pageFile?.content;
			} else {
				return (output.html as Record<string, string>)[currentPage];
			}
		} else if (output.content) {
			return output.content;
		}

		return null;
	};

	// Render website content using blob URL approach
	const renderContent = () => {
		if (!iframeRef.current) return;
		
		const content = getCurrentPageContent();
		if (!content) return;
		
		try {
			// Create a blob URL from the content for better script execution
			const htmlBlob = new Blob([content], { type: 'text/html' });
			const blobUrl = URL.createObjectURL(htmlBlob);
			
			// Set the src attribute to the blob URL
			iframeRef.current.src = blobUrl;
			
			// Update the onload handler for the iframe
			iframeRef.current.onload = () => {
				URL.revokeObjectURL(blobUrl);
				
				// Hide controls when page loads
				setControlsVisible(false);
				
				// Add handlers to the newly loaded content
				try {
					const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
					if (iframeDoc) {
						// Add click handlers
						iframeDoc.addEventListener('click', handleIframeClick);
						iframeDoc.addEventListener('touchstart', handleIframeClick);
						
						// Add navigation handler
						iframeDoc.addEventListener('DOMContentLoaded', () => {
							// This code runs when the iframe content is fully loaded
						});
						
						// Set up navigation function on the window object
						if (iframeRef.current?.contentWindow) {
							iframeRef.current.contentWindow.navigateTo = (page: string) => {
								window.postMessage({ action: 'navigate', page: page }, '*');
							};
              
              // Add click event listener to all links
              const links = iframeDoc.querySelectorAll('a[href]');
              links.forEach(link => {
                link.addEventListener('click', (e) => {
                  const href = link.getAttribute('href');
                  if (href && !href.startsWith('http') && !href.startsWith('#') && 
                      availableFiles.includes(href)) {
                    e.preventDefault();
                    iframeRef.current?.contentWindow?.navigateTo?.(href);
                  }
                });
              });
						}
					}
				} catch (error) {
					console.log("Could not inject handlers to iframe content:", error);
				}
			};
		} catch (error) {
			console.error("Error rendering content in fullscreen preview:", error);
		}
	};

	// Re-render when page or device type changes
	useEffect(() => {
		if (iframeRef.current && output) {
			renderContent();
		}
	}, [output, deviceType, currentPage]);

	// Auto-hide controls after inactivity (simplified for side panel)
	const showControls = () => {
		setControlsVisible(true);
	};

	// Handle mouse movement to set up initial state only
	useEffect(() => {
		// Initial timeout to hide controls after load
		const initialTimeout = setTimeout(() => {
			if (!showFileDropdown) {
				setControlsVisible(false);
			}
		}, 5000);
		
		return () => {
			clearTimeout(initialTimeout);
		};
	}, []); // Empty dependency array to only run once

	// Monitor file dropdown state
	useEffect(() => {
		// If dropdown is open, make sure controls stay visible
		if (showFileDropdown) {
			setControlsVisible(true);
		}
	}, [showFileDropdown]);

	// Handle refresh button click
	const handleRefresh = () => {
		renderContent();
		
		// Add visual feedback for refresh
		const refreshBtn = document.querySelector(".refresh-btn");
		if (refreshBtn) {
			refreshBtn.classList.add("animate-spin");
			setTimeout(() => {
				refreshBtn.classList.remove("animate-spin");
				
				// Hide controls after refresh
				setControlsVisible(false);
			}, 500);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		if (!showFileDropdown) return;
		
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowFileDropdown(false);
			}
		};
		
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showFileDropdown]);

	// Add a handler to hide controls when iframe is clicked
	const handleIframeClick = () => {
		setControlsVisible(false);
		// Also close the file dropdown if it's open
		if (showFileDropdown) {
			setShowFileDropdown(false);
		}
	};

	// Add overlay to detect clicks on iframe
	const handleContainerClick = (e: React.MouseEvent) => {
		// If click is on the iframe or its child elements
		if (iframeRef.current && (e.target === iframeRef.current || iframeRef.current.contains(e.target as Node))) {
			setControlsVisible(false);
			// Also close the file dropdown if it's open
			if (showFileDropdown) {
				setShowFileDropdown(false);
			}
		}
	};

	// Set up iframe click handling
	useEffect(() => {
		if (!iframeRef.current) return;
		
		// Try to add click handler to the iframe content
		const handleLoad = () => {
			try {
				const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
				
				if (iframeDoc) {
					// Add click listener to the iframe document
					iframeDoc.addEventListener('click', handleIframeClick);
					iframeDoc.addEventListener('touchstart', handleIframeClick);
				}
			} catch (error) {
				console.log("Could not add click handler to iframe due to security restrictions:", error);
			}
		};
		
		// Fallback - listen for blur events on parent window
		// This happens when user clicks into the iframe
		const handleBlur = () => {
			if (document.activeElement === iframeRef.current) {
				setControlsVisible(false);
				// Also close the file dropdown if it's open
				if (showFileDropdown) {
					setShowFileDropdown(false);
				}
			}
		};
		
		// Add event listeners
		iframeRef.current.addEventListener('load', handleLoad);
		window.addEventListener('blur', handleBlur);
		
		// Clean up
		return () => {
			if (iframeRef.current) {
				iframeRef.current.removeEventListener('load', handleLoad);
			}
			window.removeEventListener('blur', handleBlur);
		};
	}, [iframeRef.current, showFileDropdown]);

	return (
		<div 
			ref={containerRef}
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
			onMouseMove={showControls}
			onClick={handleContainerClick}
		>
			{/* Settings controls - with visibility toggle */}
			<div 
				className={`fixed right-0 top-1/4 z-50 transition-all duration-300 transform ${
					controlsVisible ? 'translate-x-0' : 'translate-x-[calc(100%-8px)]'
				}`}
			>
				<div 
					className="flex flex-col items-center bg-white rounded-l-lg shadow-lg p-2 pr-0 hover:translate-x-0"
					onMouseEnter={() => setControlsVisible(true)}
					onMouseLeave={() => {
						if (!showFileDropdown) {
							setControlsVisible(false);
						}
					}}
				>
					{/* More subtle indicator tab */}
					<div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-[8px] bg-white/80 p-[2px] rounded-l-md cursor-pointer">
						<div className="w-1 h-8 flex items-center justify-center">
							<div className="w-[2px] h-5 bg-gray-400 rounded-full"></div>
						</div>
					</div>
					
					{/* Controls */}
					<div className="flex flex-col space-y-4 pl-4 pr-6 py-3">
						<Tooltip title="Desktop" placement="left">
							<div
								className={`cursor-pointer ${deviceType === "Desktop" ? "text-primary" : "text-gray-600"}`}
								onClick={() => setDeviceType("Desktop")}
							>
								<MonitorIcon />
							</div>
						</Tooltip>
						<Tooltip title="Tablet" placement="left">
							<div
								className={`cursor-pointer ${deviceType === "tablet" ? "text-primary" : "text-gray-600"}`}
								onClick={() => setDeviceType("tablet")}
							>
								<TabletIcon />
							</div>
						</Tooltip>
						<Tooltip title="Mobile" placement="left">
							<div
								className={`cursor-pointer ${deviceType === "mobile" ? "text-primary" : "text-gray-600"}`}
								onClick={() => setDeviceType("mobile")}
							>
								<PhoneIcon />
							</div>
						</Tooltip>
						<Tooltip title="Refresh" placement="left">
							<div
								className="cursor-pointer text-gray-600 hover:text-primary"
								onClick={handleRefresh}
							>
								<LucideRefreshCw className="w-5 h-5 refresh-btn transition-transform duration-500" />
							</div>
						</Tooltip>
						<Tooltip title="Close" placement="left">
							<div
								onClick={onClose}
								className="text-gray-600 cursor-pointer hover:text-gray-800"
							>
								<LucideX className="w-6 h-6" />
							</div>
						</Tooltip>
					</div>
				</div>
			</div>

			{/* File selector dropdown - with white background and X button */}
			{availableFiles.length > 0 && (
				<div 
					className={`fixed left-0 top-4 z-50 transition-all duration-300 transform ${
						controlsVisible || showFileDropdown ? 'translate-x-0' : 'translate-x-[calc(-100%+8px)]'
					}`}
					onMouseEnter={() => setControlsVisible(true)}
					onMouseLeave={() => {
						if (!showFileDropdown) {
							setControlsVisible(false);
						}
					}}
				>
					<div className="bg-white rounded-r-lg shadow-lg p-2 pl-4">
						{/* Indicator that always shows */}
						<div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[8px] bg-white/80 p-[2px] rounded-r-md cursor-pointer">
							<div className="w-1 h-8 flex items-center justify-center">
								<div className="w-[2px] h-5 bg-gray-400 rounded-full"></div>
							</div>
						</div>
						
						{/* File selector header with X button */}
						<div className="flex items-center justify-between mb-2">
							<div className="text-gray-600 text-xs font-medium">Current File</div>
							<div 
								onClick={onClose}
								className="text-gray-500 cursor-pointer hover:text-gray-800 p-1"
							>
								<LucideX className="w-4 h-4" />
							</div>
						</div>
						
						{/* File selector button */}
						<div 
							className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors min-w-[120px]"
							onClick={() => setShowFileDropdown(prev => !prev)}
						>
							<LucideFileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
							<span className="text-gray-700 truncate flex-grow">{currentPage}</span>
							<LucideChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
						</div>
						
						{/* Dropdown menu */}
						{showFileDropdown && (
							<div 
								ref={dropdownRef}
								className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
							>
								<div className="max-h-60 overflow-y-auto">
									{availableFiles.map(filename => (
										<div
											key={filename}
											className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${currentPage === filename ? 'bg-gray-100 text-primary' : 'text-gray-700'}`}
											onClick={() => {
												setCurrentPage(filename);
												setShowFileDropdown(false);
												
												// Hide controls after selection instead of showing them
												setTimeout(() => {
													setControlsVisible(false);
												}, 100); // Short delay to allow dropdown to close
											}}
										>
											<LucideFileText className={`w-4 h-4 ${currentPage === filename ? 'text-primary' : 'text-gray-500'}`} />
											<span className="truncate">{filename}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Content */}
			<div className="w-full h-full flex justify-center items-center bg-gray-300">
				<div
					className={`bg-white h-full transition-all duration-300 ${getDeviceSize()}`}
				>
					<iframe
						ref={iframeRef}
						title="Output Preview"
						className="w-full h-full bg-white"
						sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-presentation"
						allow="fullscreen; geolocation; microphone; camera; midi; encrypted-media; autoplay"
					/>
				</div>
			</div>
		</div>
	);
} 