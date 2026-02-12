import { create } from 'zustand';
import {
  FormData,
  AllMetrics,
  Alert,
  CompoundInsight,
  ScenarioOverrides,
  defaultFormData,
} from '@/lib/engine/types';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { runRules } from '@/lib/engine/rules';
import { runCompoundRules } from '@/lib/engine/compound-rules';
import { calculateScenario } from '@/lib/engine/scenarios';

type AgentRole = 'ceo' | 'cfo' | 'chef' | 'manager';

interface BusinessPlanState {
  // Plan metadata
  planId: string | null;
  planName: string;
  role: AgentRole;
  isOnboarding: boolean;

  // Form data
  formData: FormData;

  // Calculated results
  metrics: AllMetrics;
  alerts: Alert[];
  insights: CompoundInsight[];

  // Scenario
  scenarioOverrides: ScenarioOverrides;
  scenarioMetrics: AllMetrics | null;
  scenarioAlerts: Alert[];

  // Dirty tracking
  isDirty: boolean;
  lastSavedAt: Date | null;

  // Actions
  setPlanId: (id: string) => void;
  setPlanName: (name: string) => void;
  setRole: (role: AgentRole) => void;
  setIsOnboarding: (v: boolean) => void;
  setFormData: (data: FormData) => void;
  updateSection: <K extends keyof FormData>(section: K, data: Partial<FormData[K]>) => void;
  recalculate: () => void;
  setScenarioOverrides: (overrides: ScenarioOverrides) => void;
  clearScenario: () => void;
  markSaved: () => void;
  loadPlan: (id: string, name: string, formData: FormData, role?: AgentRole, isOnboarding?: boolean) => void;
  reset: () => void;
}

function computeAll(formData: FormData) {
  const metrics = calculateMetrics(formData);
  const { score, breakdown } = calculateHealthScore(formData, metrics);
  metrics.healthScore = score;
  metrics.healthScoreBreakdown = breakdown;
  const alerts = runRules(formData, metrics);
  const insights = runCompoundRules(formData, metrics);
  return { metrics, alerts, insights };
}

const initialComputed = computeAll(defaultFormData);

export const useBusinessPlanStore = create<BusinessPlanState>((set, get) => ({
  planId: null,
  planName: 'Untitled Plan',
  role: 'ceo' as AgentRole,
  isOnboarding: false,
  formData: defaultFormData,
  metrics: initialComputed.metrics,
  alerts: initialComputed.alerts,
  insights: initialComputed.insights,
  scenarioOverrides: {},
  scenarioMetrics: null,
  scenarioAlerts: [],
  isDirty: false,
  lastSavedAt: null,

  setPlanId: (id) => set({ planId: id }),
  setPlanName: (name) => set({ planName: name, isDirty: true }),
  setRole: (role) => set({ role }),
  setIsOnboarding: (isOnboarding) => set({ isOnboarding }),

  setFormData: (data) => {
    const computed = computeAll(data);
    set({
      formData: data,
      ...computed,
      isDirty: true,
    });
  },

  updateSection: (section, data) => {
    const current = get().formData;
    const newFormData = {
      ...current,
      [section]: { ...current[section], ...data },
    };
    const computed = computeAll(newFormData);
    set({
      formData: newFormData,
      ...computed,
      isDirty: true,
    });
  },

  recalculate: () => {
    const computed = computeAll(get().formData);
    set(computed);
  },

  setScenarioOverrides: (overrides) => {
    const result = calculateScenario(get().formData, overrides);
    set({
      scenarioOverrides: overrides,
      scenarioMetrics: result.metrics,
      scenarioAlerts: result.alerts,
    });
  },

  clearScenario: () =>
    set({
      scenarioOverrides: {},
      scenarioMetrics: null,
      scenarioAlerts: [],
    }),

  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),

  loadPlan: (id, name, formData, role = 'ceo', isOnboarding = false) => {
    const computed = computeAll(formData);
    set({
      planId: id,
      planName: name,
      role,
      isOnboarding,
      formData,
      ...computed,
      isDirty: false,
      lastSavedAt: new Date(),
      scenarioOverrides: {},
      scenarioMetrics: null,
      scenarioAlerts: [],
    });
  },

  reset: () => {
    const computed = computeAll(defaultFormData);
    set({
      planId: null,
      planName: 'Untitled Plan',
      role: 'ceo' as AgentRole,
      isOnboarding: false,
      formData: defaultFormData,
      ...computed,
      isDirty: false,
      lastSavedAt: null,
      scenarioOverrides: {},
      scenarioMetrics: null,
      scenarioAlerts: [],
    });
  },
}));
