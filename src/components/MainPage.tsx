"use client";

import React, { useState } from "react";
import CodeEditor from "./CodeEditor";
import CodePreview from "./CodePreview";

export default function MainPage() {
	const [code, setCode] = useState<string>(`<!DOCTYPE html>
<html>
<head>
	<title>My HTML</title>
</head>
<body>
	<h1>Hello World!</h1>
	<p>Start editing to see changes</p>
</body>
</html>`);

	const [editorCollapsed, setEditorCollapsed] = useState(false);
	const [previewCollapsed, setPreviewCollapsed] = useState(false);

	return (
		<div className="h-dvh w-dvw flex bg-gray-50 p-4">
			<div className="flex gap-4 w-full">
				<CodeEditor 
					code={code} 
					setCode={setCode} 
					isCollapsed={editorCollapsed}
					setIsCollapsed={setEditorCollapsed}
					className={editorCollapsed ? "w-[50px]" : previewCollapsed ? "w-full" : "w-1/2"}
				/>
				<CodePreview 
					code={code} 
					isCollapsed={previewCollapsed}
					setIsCollapsed={setPreviewCollapsed}
					className={previewCollapsed ? "w-[50px]" : editorCollapsed ? "w-full" : "w-1/2"}
				/>
			</div>
		</div>
	);
}
