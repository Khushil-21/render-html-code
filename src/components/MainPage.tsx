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

	return (
		<div className="h-dvh w-dvw flex bg-gray-900 p-4">
			<div className="flex gap-4 w-full">
				<CodeEditor code={code} setCode={setCode} />
				<CodePreview code={code} />
			</div>
		</div>
	);
}
