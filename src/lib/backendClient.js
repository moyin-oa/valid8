import mockData from '../data/mock_contract.json';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function postJson(path, body) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} ${path}: ${text}`);
  }

  return response.json();
}

function createDocumentId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `doc-${Date.now()}`;
}

function mapActionItems(items) {
  return (items || []).map((item) => {
    if (typeof item === 'string') {
      return { text: item, priority: 'medium', due: null };
    }
    return {
      text: item?.text || '',
      priority: item?.priority || 'medium',
      due: item?.due || null,
    };
  }).filter((item) => item.text);
}

export function buildPipelinePayload(input = {}) {
  const documentId = input.documentId || createDocumentId();
  const readingLevel = input.readingLevel || 'grade6';
  const language = input.language || 'en';

  if (input.mode === 'demo') {
    return {
      documentId,
      readingLevel,
      language,
      extracted: {
        medications: (mockData.medications || []).map((m) => m.name),
        conditions: (mockData.diagnoses || []).map((d) => d.name),
        instructions: [],
      },
      simplifiedSummary: mockData.summary?.standard || 'Demo summary.',
      actionItems: (mockData.action_items || []).map((text) => ({ text, priority: 'medium', due: null })),
      aiResult: {
        medications: mockData.medications || [],
        diagnoses: mockData.diagnoses || [],
      },
    };
  }

  const rawText = (input.rawText || '').trim();
  const fallbackSummary = rawText || 'No text provided. Please upload a medical document or paste text.';

  return {
    documentId,
    readingLevel,
    language,
    extracted: {
      medications: input.medications || [],
      conditions: input.conditions || [],
      instructions: input.instructions || [],
    },
    simplifiedSummary: fallbackSummary,
    actionItems: mapActionItems(input.actionItems || []),
    aiResult: input.aiResult || {
      medications: input.medications || [],
      conditions: input.conditions || [],
      instructions: input.instructions || [],
    },
  };
}

function toTitleCase(value) {
  return String(value || '')
    .split(' ')
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(' ');
}

export function adaptPipelineToUi(result) {
  const warnings = (result?.interactions?.interactions || []).map(
    (w) => `${toTitleCase(w.drugA)} + ${toTitleCase(w.drugB)}: ${w.warning}`,
  );

  const medications = (result?.interactions?.normalizedMedications || []).map((name) => ({
    name: toTitleCase(name),
    dosage: '',
    frequency: '',
    purpose: '',
    warnings: '',
  }));

  const actionItems = (result?.actionItems || []).map((item) => item.text).filter(Boolean);
  const dates = (result?.actionItems || [])
    .filter((item) => item.due)
    .map((item) => ({ event: item.text, date: item.due }));

  const summary = result?.simplifiedSummary || 'No summary available.';

  return {
    documentId: result?.documentId,
    readingLevel: result?.readingLevel || 'standard',
    summary: {
      simple: summary,
      standard: summary,
      detailed: summary,
    },
    medications,
    diagnoses: [],
    action_items: actionItems,
    dates,
    warnings,
    ttsText: result?.ttsText || summary,
    _raw: result,
  };
}

export async function processPipeline(input) {
  const payload = buildPipelinePayload(input);
  const response = await postJson('/api/pipeline/process', payload);
  return adaptPipelineToUi(response);
}

export async function exportSummaryPdf(uiData) {
  const payload = {
    documentId: uiData.documentId || createDocumentId(),
    simplifiedSummary: uiData.summary?.standard || uiData.summary?.simple || '',
    actionItems: (uiData.action_items || []).map((text) => ({ text, priority: 'medium', due: null })),
    interactions: ((uiData._raw?.interactions?.interactions) || []).map((w) => ({
      drugA: w.drugA,
      drugB: w.drugB,
      severity: w.severity,
      warning: w.warning,
      evidence: w.evidence,
      source: w.source,
    })),
  };

  return postJson('/api/pdf/export', payload);
}

export async function generateTtsAudio(documentId, text) {
  return postJson('/api/tts/audio', { documentId, text });
}
