"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CodeContextProps {
  code: string;
  setCode: (code: string) => void;
}

const CodeContext = createContext<CodeContextProps | undefined>(undefined);

export function CodeProvider({ children, initialCode = '' }: { children: ReactNode, initialCode?: string }) {
  const [code, setCode] = useState<string>(initialCode);

  return (
    <CodeContext.Provider value={{ code, setCode }}>
      {children}
    </CodeContext.Provider>
  );
}

export function useCode() {
  const context = useContext(CodeContext);
  if (context === undefined) {
    throw new Error('useCode must be used within a CodeProvider');
  }
  return context;
} 