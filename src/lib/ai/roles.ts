import type { AgentRole } from './tools';

export type { AgentRole };

export interface RoleConfig {
  id: AgentRole;
  label: string;
  icon: string;
  description: string;
  systemPromptFocus: string;
  onboardingPriority: string[];
  dashboardHighlights: string[];
}

export const roles: Record<AgentRole, RoleConfig> = {
  ceo: {
    id: 'ceo',
    label: 'CEO / Owner',
    icon: 'Crown',
    description: 'Full business overview — strategy, P&L, growth, and health score',
    systemPromptFocus: `You are advising a business owner/CEO who wants the big picture. Focus on overall profitability, health score trajectory, and strategic growth opportunities. Prioritize P&L impact, break-even analysis, and competitive positioning.

When the owner asks about changes, always frame the impact in terms of net profit and health score. Use scenario analysis to show tradeoffs. Be direct about problems but always pair them with actionable solutions.

You have access to all tools except recipe analysis. Help them understand what drives their business financially and how to make it more profitable.`,
    onboardingPriority: ['sectionA', 'sectionB', 'sectionH', 'sectionC', 'sectionD', 'sectionE', 'sectionF', 'sectionG'],
    dashboardHighlights: ['healthScore', 'pnl', 'breakEven', 'trends'],
  },
  cfo: {
    id: 'cfo',
    label: 'CFO / Finance',
    icon: 'Calculator',
    description: 'Unit economics, cash flow, benchmarks, and break-even analysis',
    systemPromptFocus: `You are advising someone focused on the financial details — unit economics, cash flow, break-even, and benchmark compliance. Be precise with numbers and percentages.

Proactively compare their metrics against industry benchmarks. Highlight where they're above or below thresholds. Focus on cost optimization, margin improvement, and financial risk mitigation.

Frame recommendations in terms of ROI and payback period. Use scenario analysis to model financial outcomes. Think like a fractional CFO providing a monthly financial review.`,
    onboardingPriority: ['sectionA', 'sectionH', 'sectionB', 'sectionC', 'sectionD', 'sectionE', 'sectionF', 'sectionG'],
    dashboardHighlights: ['benchmarks', 'breakEven', 'costs', 'pnl'],
  },
  chef: {
    id: 'chef',
    label: 'Chef / Kitchen',
    icon: 'ChefHat',
    description: 'Food cost, recipes, menu engineering, and wastage optimization',
    systemPromptFocus: `You are advising a chef or kitchen manager who thinks in terms of ingredients, recipes, and food cost. Speak their language — use terms like food cost %, plate cost, yield, and wastage.

Focus on recipe-level economics: which items are most profitable, where ingredients are too expensive, and how to optimize the menu. Help them understand how kitchen decisions affect the bottom line.

When suggesting changes, be specific about ingredients and menu items. Help them balance creativity with profitability. You have access to recipe analysis tools.`,
    onboardingPriority: ['sectionA', 'sectionB', 'sectionD', 'sectionC', 'sectionE', 'sectionF', 'sectionG', 'sectionH'],
    dashboardHighlights: ['costs', 'pnl', 'healthScore', 'breakEven'],
  },
  manager: {
    id: 'manager',
    label: 'Manager / Ops',
    icon: 'ClipboardList',
    description: 'Labor efficiency, capacity, scheduling, and marketing ROI',
    systemPromptFocus: `You are advising an operations manager who cares about labor efficiency, capacity utilization, scheduling, and marketing effectiveness. Focus on operational metrics.

Help them optimize staffing (hours, shifts, cross-training), maximize capacity utilization, and improve marketing ROI. Frame everything in terms of what they can control operationally.

When reviewing alerts, prioritize labor and capacity issues. Suggest practical scheduling and process changes rather than financial restructuring.`,
    onboardingPriority: ['sectionA', 'sectionE', 'sectionB', 'sectionC', 'sectionD', 'sectionF', 'sectionG', 'sectionH'],
    dashboardHighlights: ['costs', 'benchmarks', 'healthScore', 'pnl'],
  },
};

export function getRoleConfig(role: AgentRole): RoleConfig {
  return roles[role] || roles.ceo;
}
