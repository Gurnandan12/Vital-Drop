'use client';
import React, { useState } from 'react';
import {
  Bookmark,
  X,
  Trash2,
  FolderOpen,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { formatINR, RISK_PROFILES } from '@/lib/riskCalculations';

export function SavedScenariosModal({
  isOpen,
  onClose,
  savedScenarios = [],
  onSaveCurrent,
  onApplyScenario,
  onDeleteScenario,
  currentParams,
  isDark = true,
}) {
  const [scenarioName, setScenarioName] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;

    onSaveCurrent(scenarioName.trim());
    setScenarioName('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDark ? 'bg-[#0f0f1f] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Scenario Portfolio Vault</h3>
              <p className="text-xs text-gray-400">Save and reload custom What-If calibrations</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Save Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <label htmlFor="scenario-name-input" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Save Current Sandbox Configuration
            </label>
            <div className="flex gap-2">
              <input
                id="scenario-name-input"
                type="text"
                placeholder="e.g. My 15-Year Dream Villa Goal"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-500'
                }`}
              />
              <button
                type="submit"
                disabled={!scenarioName.trim()}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-violet-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>

            {justSaved && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Scenario saved to your local storage vault!</span>
              </p>
            )}
          </form>

          {/* List of Saved Scenarios */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Saved Configurations ({savedScenarios.length})</span>
            </h4>

            {savedScenarios.length === 0 ? (
              <div
                className={`text-center py-8 rounded-2xl border border-dashed ${
                  isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}
              >
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No saved scenarios yet</p>
                <p className="text-[11px] opacity-70 mt-0.5">
                  Type a name above and click Save to store your calibration
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedScenarios.map((sc) => {
                  const prof = RISK_PROFILES[sc.riskProfile] || RISK_PROFILES.moderate;

                  return (
                    <div
                      key={sc.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isDark ? 'bg-white/3 border-white/8 hover:border-violet-500/30' : 'bg-gray-50 border-gray-200 hover:border-violet-400'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate">{sc.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${prof.accentBg} ${prof.accentText}`}
                          >
                            {prof.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatINR(sc.initialAmount)} initial • {formatINR(sc.monthlyContribution)}
                          /mo • {sc.years} yrs @ {sc.annualReturn}%
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onApplyScenario(sc);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-bold text-xs border border-violet-500/30 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteScenario(sc.id)}
                          aria-label={`Delete ${sc.name}`}
                          className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavedScenariosModal;
