# API Contract (v1)

Base URL: `http://127.0.0.1:8000`

## POST `/api/pipeline/process`
Primary endpoint for frontend integration.

### Request
```json
{
  "documentId": "doc-001",
  "readingLevel": "grade6",
  "language": "en",
  "extracted": {
    "medications": ["warfarin", "ibuprofen"],
    "conditions": ["hypertension"],
    "instructions": ["take with food"]
  },
  "aiResult": {
    "entities": {
      "medications": [{"name": "Warfarin"}, {"drug": "Ibuprofen"}]
    }
  },
  "simplifiedSummary": "You are taking warfarin and ibuprofen.",
  "actionItems": [
    {"text": "Call your doctor if bleeding occurs", "priority": "high", "due": null}
  ]
}
```

### Medication Source Resolution
1. Use `extracted.medications` when present and non-empty.
2. If empty, backend extracts from `aiResult` using these paths:
- `aiResult.medications`
- `aiResult.entities.medications`
- `aiResult.extracted.medications`

Supported medication item formats:
- String: `"Aspirin"`
- Object: `{"name":"Aspirin"}`
- Object: `{"medication":"Aspirin"}`
- Object: `{"drug":"Aspirin"}`

### Response
```json
{
  "documentId": "doc-001",
  "readingLevel": "grade6",
  "language": "en",
  "simplifiedSummary": "You are taking warfarin and ibuprofen.",
  "actionItems": [
    {"text": "Call your doctor if bleeding occurs", "priority": "high", "due": null}
  ],
  "interactions": {
    "normalizedMedications": ["ibuprofen", "warfarin"],
    "interactions": [
      {
        "drugA": "warfarin",
        "drugB": "ibuprofen",
        "severity": "high",
        "warning": "Concurrent use may increase bleeding risk.",
        "evidence": "Known anticoagulant + NSAID risk pattern.",
        "source": "https://open.fda.gov/"
      }
    ],
    "disclaimer": "Educational only, not medical advice.",
    "status": "ok",
    "notes": []
  },
  "ttsText": "You are taking warfarin and ibuprofen.\\nAction items:\\n1. Call your doctor if bleeding occurs"
}
```

## POST `/api/interactions/check`
Quick medication interaction lookup.

### Request
```json
{ "medications": ["Warfarin", "Ibuprofen"] }
```

### Response
See `interactions` object above.

## POST `/api/pdf/export`
Generates summary PDF on server.

### Request
- `documentId`, `simplifiedSummary`, `actionItems[]`, `interactions[]`

### Response
```json
{ "documentId": "doc-001", "downloadPath": "/tmp/med-doc-pdfs/doc-001.pdf" }
```

## POST `/api/tts/text`
Returns text for frontend Web Speech playback.

### Request
```json
{
  "documentId": "doc-001",
  "summary": "Plain language summary",
  "actionItems": [{"text":"Follow up with PCP","priority":"medium","due":null}]
}
```

### Response
```json
{
  "documentId": "doc-001",
  "text": "Plain language summary\\nAction items:\\n1. Follow up with PCP"
}
```
