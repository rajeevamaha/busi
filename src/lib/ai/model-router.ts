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

// Patterns that require tool calling (agent mode with Claude)
const TOOL_KEYWORDS = [
  'set', 'update', 'change', 'fill', 'enter', 'put', 'make it', 'adjust',
  'what if', 'what-if', 'scenario', 'if i',
  'analyze', 'optimize', 'suggest', 'recommend pricing',
  'show me benchmarks', 'industry standard', 'healthy range',
  'show me alerts', 'what\'s wrong', 'problems', 'issues', 'health check',
  'recipe cost', 'analyze recipes', 'menu engineering',
  'my rent', 'my revenue', 'my costs', 'my profit', 'my metrics',
  'how much', 'what is my', 'what are my',
];

export function shouldUseTools(messages: Array<{ role: string; content: string }>): boolean {
  // First 6 messages during onboarding → always use tools
  if (messages.length <= 6) return true;

  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMsg) return false;

  const lower = lastUserMsg.content.toLowerCase();
  return TOOL_KEYWORDS.some((kw) => lower.includes(kw));
}
