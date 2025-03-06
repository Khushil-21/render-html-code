import type { Metadata } from "next";
import "./globals.css";
import { CodeProvider } from "@/context/CodeContext";

export const metadata: Metadata = {
	title: "Render HTML",
	description: "Render your Html Code Here",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const initialHtmlCode = `<!DOCTYPE html>
<html>
<head>
	<title>My HTML</title>
</head>
<body>
	<h1>Hello World!</h1>
	<p>Start editing to see changes</p>
</body>
</html>`;

	return (
		<html lang="en">
			<body>
				<CodeProvider initialCode={initialHtmlCode}>
					{children}
				</CodeProvider>
			</body>
		</html>
	);
}
