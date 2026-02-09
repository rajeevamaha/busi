const COMPLEX_KEYWORDS = [
  'what if', 'what-if', 'scenario', 'compare',
  'deep analysis', 'detailed analysis', 'explain in detail',
  'strategy', 'long-term', 'forecast', 'projection',
  'restructure', 'pivot', 'expansion',
];

export function routeModel(userMessage: string): 'haiku' | 'sonnet' {
  const lower = userMessage.toLowerCase();
  const isComplex = COMPLEX_KEYWORDS.some((kw) => lower.includes(kw));
  return isComplex ? 'sonnet' : 'haiku';
}

export function getModelId(model: 'haiku' | 'sonnet'): string {
  return model === 'sonnet' ? 'claude-sonnet-4-5-20250929' : 'claude-haiku-4-5-20251001';
}
