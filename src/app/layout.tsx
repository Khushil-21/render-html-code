import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Render HTML",
	description: "Render your Html Code Here",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
