import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RISK_PROFILES } from '@/lib/riskCalculations';

const DEFAULT_SANDBOX_STATE = {
  initialAmount: 100000, // ₹1,00,000
  monthlyContribution: 10000, // ₹10,000 / month
  years: 10, // 10 years
  annualReturn: 11.5, // 11.5% p.a.
  riskProfile: 'moderate', // 'conservative' | 'moderate' | 'aggressive'
  assetAllocation: {
    equity: 60,
    debt: 25,
    gold: 10,
    cash: 5,
  },
};

export const useSandboxStore = create()(
  persist(
    (set, get) => ({
      ...DEFAULT_SANDBOX_STATE,
      savedScenarios: [],

      // Controls
      setInitialAmount: (val) => set({ initialAmount: Math.max(0, parseFloat(val) || 0) }),
      setMonthlyContribution: (val) =>
        set({ monthlyContribution: Math.max(0, parseFloat(val) || 0) }),
      setYears: (val) => set({ years: Math.max(1, Math.min(50, parseFloat(val) || 1)) }),
      setAnnualReturn: (val) =>
        set({ annualReturn: Math.max(0, Math.min(100, parseFloat(val) || 0)) }),
      setRiskProfile: (profileId) => {
        const profile = RISK_PROFILES[profileId];
        if (profile) {
          set({
            riskProfile: profileId,
            annualReturn: profile.defaultReturn,
            assetAllocation: { ...profile.defaultAllocation },
          });
        }
      },
      setAssetAllocation: (newAlloc) =>
        set((state) => ({
          assetAllocation: { ...state.assetAllocation, ...newAlloc },
        })),

      // Reset
      resetToDefaults: () => set({ ...DEFAULT_SANDBOX_STATE }),

      // Preset Loader
      loadPreset: (preset) => {
        const profile = RISK_PROFILES[preset.riskProfile] || RISK_PROFILES.moderate;
        set({
          initialAmount: preset.initialAmount,
          monthlyContribution: preset.monthlyContribution,
          years: preset.years,
          annualReturn: preset.annualReturn,
          riskProfile: preset.riskProfile,
          assetAllocation: { ...profile.defaultAllocation },
        });
      },

      // Scenario persistence
      saveScenario: (name, metadata = {}) => {
        const state = get();
        const scenario = {
          id: `scenario-${Date.now()}`,
          name: name?.trim() || `Scenario ${state.savedScenarios.length + 1}`,
          initialAmount: state.initialAmount,
          monthlyContribution: state.monthlyContribution,
          years: state.years,
          annualReturn: state.annualReturn,
          riskProfile: state.riskProfile,
          assetAllocation: { ...state.assetAllocation },
          savedAt: new Date().toISOString(),
          ...metadata,
        };

        set({ savedScenarios: [scenario, ...state.savedScenarios] });
        return scenario;
      },

      deleteScenario: (id) =>
        set((state) => ({
          savedScenarios: state.savedScenarios.filter((s) => s.id !== id),
        })),

      applyScenario: (scenario) => {
        if (!scenario) return;
        set({
          initialAmount: scenario.initialAmount,
          monthlyContribution: scenario.monthlyContribution,
          years: scenario.years,
          annualReturn: scenario.annualReturn,
          riskProfile: scenario.riskProfile || 'moderate',
          assetAllocation: scenario.assetAllocation || { ...DEFAULT_SANDBOX_STATE.assetAllocation },
        });
      },
    }),
    {
      name: 'vitaldrop_risk_sandbox_v1',
      partialize: (state) => ({
        savedScenarios: state.savedScenarios,
        initialAmount: state.initialAmount,
        monthlyContribution: state.monthlyContribution,
        years: state.years,
        annualReturn: state.annualReturn,
        riskProfile: state.riskProfile,
        assetAllocation: state.assetAllocation,
      }),
    }
  )
);
