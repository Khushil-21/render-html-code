"use client";

import MainPage from "@/components/MainPage";
import { CodeProvider } from "@/context/CodeContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RendererWithSlug() {
  const params = useParams();
  const [initialCode, setInitialCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const slug = params.slug as string;
      const savedCodesJson = localStorage.getItem('savedCodes') || '{}';
      const savedCodes = JSON.parse(savedCodesJson);
      
      if (savedCodes[slug]) {
        setInitialCode(savedCodes[slug].code);
      } else {
        console.error(`No code found for slug: ${slug}`);
        // Could redirect to 404 or main page here
      }
    } catch (error) {
      console.error('Error loading code from slug:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <CodeProvider initialCode={initialCode}>
      <MainPage />
    </CodeProvider>
  );
} 