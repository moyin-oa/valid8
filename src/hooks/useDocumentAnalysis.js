// useDocumentAnalysis.js
// React hook that wires together Person 2's AI pipeline + Person 3's drug interaction service
// Person 1: import this hook and call it from the results page

import { useState } from 'react';
import { analyzeMedicalDocument, extractMedicationNames } from '../services/medlens-ai.js';

// ============================================
// Person 3's drug interaction lookup
// Adjust this URL/function if Person 3 built it differently
// ============================================
async function checkDrugInteractions(medicationNames) {
  const interactions = [];

  for (const drugName of medicationNames) {
    try {
      const encoded = encodeURIComponent(drugName);
      const resp = await fetch(
        `https://api.fda.gov/drug/label.json?search=drug_interactions:"${encoded}"&limit=1`
      );

      if (!resp.ok) continue;

      const data = await resp.json();
      const interactionText = data?.results?.[0]?.drug_interactions?.[0];

      if (interactionText) {
        interactions.push({
          drug: drugName,
          details: interactionText.slice(0, 500) // truncate long FDA text
        });
      }
    } catch (err) {
      console.warn(`Could not check interactions for ${drugName}:`, err.message);
    }
  }

  return interactions;
}

// ============================================
// React Hook — call this from your component
// ============================================
export function useDocumentAnalysis() {
  const [result, setResult] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);

  async function analyzeDocument(input, language = 'English') {
    setLoading(true);
    setError(null);
    setResult(null);
    setInteractions([]);

    try {
      // Stage 1 & 2: OCR (if image) + LLM analysis
      setLoadingStage('Reading your document...');
      const analysis = await analyzeMedicalDocument(input, language);

      // Check for errors from the pipeline
      if (analysis.error) {
        setError(analysis.message);
        setLoading(false);
        return;
      }

      setResult(analysis);
      setLoadingStage('Checking medication safety...');

      // Stage 3: Drug interaction check
      const medNames = extractMedicationNames(analysis);
      if (medNames.length > 0) {
        const drugInteractions = await checkDrugInteractions(medNames);
        setInteractions(drugInteractions);
      }

      setLoadingStage('');
      setLoading(false);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Something went wrong analyzing your document. Please try again.');
      setLoading(false);
    }
  }

  // Re-analyze with different language without re-uploading
  // Reading level toggle is now client-side (all 3 levels returned in one call)
  async function reAnalyze(newLanguage) {
    if (!result?.rawText) return;
    await analyzeDocument(result.rawText, newLanguage);
  }

  return {
    analyzeDocument,  // call with file/text input
    reAnalyze,        // call when user changes reading level or language
    result,           // the full analysis JSON
    interactions,     // drug interaction warnings
    loading,          // boolean
    loadingStage,     // string for progress indicator
    error             // error message or null
  };
}
