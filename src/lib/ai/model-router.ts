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

// Provider: Groq — free tier (30 RPM, 14,400 req/day)
// Uses Llama 3.3 70B — fast and capable
export function getModelId(model: ModelChoice): string {
  return model === 'smart' ? 'llama-3.3-70b-versatile' : 'llama-3.3-70b-versatile';
}
