// src/context/DocumentContext.jsx
// Shares document input and analysis results across all pages

import { createContext, useContext, useState } from 'react';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  // Input from LandingPage (file, image blob, or text string)
  const [documentInput, setDocumentInput] = useState(null);
  const [inputType, setInputType] = useState(null); // 'camera', 'upload', 'paste', 'demo'

  // Results from ProcessingPage (filled by useDocumentAnalysis hook)
  const [analysisResult, setAnalysisResult] = useState(null);
  const [drugInteractions, setDrugInteractions] = useState([]);

  const clearAll = () => {
    setDocumentInput(null);
    setInputType(null);
    setAnalysisResult(null);
    setDrugInteractions([]);
  };

  return (
    <DocumentContext.Provider value={{
      documentInput, setDocumentInput,
      inputType, setInputType,
      analysisResult, setAnalysisResult,
      drugInteractions, setDrugInteractions,
      clearAll,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocumentContext must be used within DocumentProvider');
  return ctx;
}