const COMPLEX_KEYWORDS = [
  'what if', 'what-if', 'scenario', 'compare',
  'deep analysis', 'detailed analysis', 'explain in detail',
  'strategy', 'long-term', 'forecast', 'projection',
  'restructure', 'pivot', 'expansion',
];

export type ModelChoice = 'fast' | 'smart';

export function routeModel(userMessage: string): ModelChoice {
  const lower = userMessage.toLowerCase();
  const isComplex = COMPLEX_KEYWORDS.some((kw) => lower.includes(kw));
  return isComplex ? 'smart' : 'fast';
}

// Provider: google (Gemini) — free tier
// fast = Gemini 2.0 Flash (free, fast)
// smart = Gemini 2.0 Flash (same model, free)
export function getModelId(model: ModelChoice): string {
  return model === 'smart' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
}
