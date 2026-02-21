# MedLens — AI Pipeline Documentation

## Overview

MedLens uses a three-stage AI pipeline to transform complex medical documents into plain-language summaries that patients can understand, act on, and trust.

## Architecture

```
Image/Text Input
       │
       ▼
┌──────────────┐
│  Stage 1:    │   Tesseract.js v5 (client-side)
│  OCR         │── Extracts text from photographed documents
│              │   Returns confidence score (0-100%)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Stage 2:    │   GPT-4o-mini via OpenAI API
│  Medical NLP │── Extracts medications, diagnoses, action items
│              │   Translates to plain language at 3 reading levels
│              │   Detects non-medical documents
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Stage 3:    │   OpenFDA Drug Interaction API
│  Drug Safety │── Cross-references extracted medication names
│              │   Flags potential drug interactions
└──────┬───────┘
       │
       ▼
  Structured JSON Output
  (summary, medications, diagnoses,
   action items, dates, warnings, disclaimer)
```

## Why AI Is Necessary at Each Stage

Each AI component solves a specific, essential problem:

- **OCR (Tesseract.js):** Enables accessibility — patients can photograph documents instead of typing. Without OCR, the tool is limited to digitally-generated text only, excluding the majority of real-world medical documents patients receive as printouts.

- **Medical NLP (GPT-4o-mini):** Enables comprehension — medical documents are written at a college reading level, but 36% of U.S. adults have limited health literacy. The LLM translates medical jargon ("PO BID", "acute exacerbation", "subcutaneous") into plain language. Without this, patients cannot understand their own care instructions.

- **Drug Interaction Check (OpenFDA):** Enables safety — patients prescribed multiple medications may face dangerous interactions their discharge papers don't explicitly flag. Without this automated check, patients must rely on catching these themselves or hope their pharmacist does.

## Reading Level Control

MedLens offers three reading levels, adjustable by the user:

| Level | Target | Description |
|-------|--------|-------------|
| Simple | 5th grade | Short sentences, no medical terms, most accessible |
| Standard | 8th grade | Some medical terms with definitions in parentheses |
| Detailed | 12th grade | Preserves clinical detail with explanations |

This allows a single document to serve patients with varying literacy levels, caregivers who need more detail, and community health workers who need clinical context.

## OCR Confidence Scoring

The pipeline returns a confidence score (0-100%) for image-based inputs:

- **80-100%:** High confidence — results are reliable
- **60-79%:** Medium confidence — user is prompted to verify information
- **Below 60%:** Low confidence — user is advised to retake the photo or type text directly

This transparency helps users understand when to trust the output and when to seek clarification.

## Ethical Safeguards

- **Disclaimer:** Every response includes a mandatory disclaimer that MedLens is informational only and not a substitute for professional medical advice.
- **Non-medical detection:** The pipeline identifies and rejects non-medical documents rather than producing misleading medical interpretations.
- **No data storage:** Documents are processed in real-time and not stored — protecting patient privacy.
- **Transparency:** OCR confidence scores are surfaced to the user, not hidden.

## Technical Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| OCR | Tesseract.js v5 | Runs client-side, no server needed, supports multiple languages |
| LLM | GPT-4o-mini (OpenAI) | Fast, cost-effective, strong structured output, reliable medical text handling |
| Drug Interactions | OpenFDA API | Free, public, authoritative FDA data source |
| Text-to-Speech | Web Speech API | Built into browsers, zero dependencies |

## Sample Output

Given a hospital discharge summary with 4 diagnoses and 5 medications, the pipeline produces:

- **5/5 medications** extracted with dosage, frequency, purpose, and warnings
- **4/4 diagnoses** with plain-language explanations
- **6 action items** including medication schedules, diet changes, and follow-up appointments
- **3 important dates** (admission, discharge, follow-up)
- **2 emergency warnings** translated into clear, actionable language
- **88% OCR confidence** on a photographed typed document

Medical abbreviations are automatically translated:
- "PO BID with meals" → "twice a day with meals"
- "subcutaneous nightly" → "injection under the skin every night"
- "EF 40%" → contextually understood in cardiac diagnosis

## Testing

The pipeline was validated against:
1. Simple discharge summary (1 diagnosis, 3 medications)
2. Complex discharge summary (4 diagnoses, 5 medications, procedures, multiple follow-ups)
3. Non-medical text (correctly rejected)
4. OCR path with photographed document (88% confidence, all data extracted)
5. Reading level comparison (output adapts appropriately across all 3 levels)